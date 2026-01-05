import fs from 'fs';
import path from 'path';
import https from 'https';
import {
  CognitoIdentityProviderClient,
  AdminInitiateAuthCommand,
  InitiateAuthCommand,
} from '@aws-sdk/client-cognito-identity-provider';

const CREATE_CATEGORY = /* GraphQL */ `
  mutation CreateCategory($input: CreateCategoryInput!) {
    createCategory(input: $input) {
      id
      name
      description
      order
    }
  }
`;

const UPDATE_CATEGORY = /* GraphQL */ `
  mutation UpdateCategory($input: UpdateCategoryInput!) {
    updateCategory(input: $input) {
      id
      name
      description
      order
    }
  }
`;

const CREATE_LINK = /* GraphQL */ `
  mutation CreateLink($input: CreateLinkInput!) {
    createLink(input: $input) {
      id
      categoryId
      title
      description
      url
      order
      isNew
      isUpdated
      lastUpdated
    }
  }
`;

const UPDATE_LINK = /* GraphQL */ `
  mutation UpdateLink($input: UpdateLinkInput!) {
    updateLink(input: $input) {
      id
      categoryId
      title
      description
      url
      order
      isNew
      isUpdated
      lastUpdated
    }
  }
`;

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function isAlreadyExistsError(errors) {
  if (!errors?.length) return false;
  const msg = (errors[0]?.message || '').toLowerCase();
  return (
    msg.includes('conditionalcheckfailed') ||
    msg.includes('the conditional request failed') ||
    msg.includes('already exists') ||
    msg.includes('duplicate') ||
    msg.includes('dynamodb') // conservative
  );
}

function appsyncUserPoolGraphql({ endpoint, idToken, query, variables }) {
  const url = new URL(endpoint);
  const body = JSON.stringify({ query, variables });

  const reqOptions = {
    host: url.host,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      Authorization: idToken,
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data || '{}'));
        } catch (e) {
          reject(new Error(`Failed to parse AppSync response: ${e.message}. Raw: ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function upsert({ endpoint, idToken, create, update, input }) {
  const created = await appsyncUserPoolGraphql({
    endpoint,
    idToken,
    query: create,
    variables: { input },
  });

  if (created?.errors?.length) {
    if (!isAlreadyExistsError(created.errors)) {
      throw new Error(created.errors.map((e) => e.message).join(', '));
    }

    const updated = await appsyncUserPoolGraphql({
      endpoint,
      idToken,
      query: update,
      variables: { input },
    });

    if (updated?.errors?.length) {
      throw new Error(updated.errors.map((e) => e.message).join(', '));
    }

    return updated;
  }

  return created;
}

function cleanUrl(url) {
  if (typeof url !== 'string') return '';
  return url.trim();
}

async function getIdToken({ region, userPoolId, clientId, username, password }) {
  const cip = new CognitoIdentityProviderClient({ region });

  // Prefer USER_PASSWORD_AUTH first so we don't require IAM permissions (AdminInitiateAuth).
  try {
    const out = await cip.send(
      new InitiateAuthCommand({
        ClientId: clientId,
        AuthFlow: 'USER_PASSWORD_AUTH',
        AuthParameters: {
          USERNAME: username,
          PASSWORD: password,
        },
      })
    );
    if (out?.ChallengeName) {
      throw new Error(
        `Cognito auth returned challenge '${out.ChallengeName}'. Create/confirm the user so it can sign in normally (no MFA/force password change) before running the import.`
      );
    }
    const token = out?.AuthenticationResult?.IdToken;
    if (!token) throw new Error('Missing IdToken from InitiateAuth(USER_PASSWORD_AUTH)');
    return token;
  } catch (e) {
    const msg = e?.message || String(e);
    // Only fall back to AdminInitiateAuth when the app client explicitly disallows USER_PASSWORD_AUTH.
    // Otherwise, surface the real error (wrong client id, wrong region/account, user not confirmed, etc.)
    if (!msg.includes('USER_PASSWORD_AUTH flow not enabled for this client')) {
      throw new Error(`Unable to obtain IdToken via USER_PASSWORD_AUTH: ${msg}`);
    }

    // Fallback: AdminInitiateAuth (requires AWS credentials with cognito-idp:AdminInitiateAuth)
    const out = await cip.send(
      new AdminInitiateAuthCommand({
        UserPoolId: userPoolId,
        ClientId: clientId,
        AuthFlow: 'ADMIN_USER_PASSWORD_AUTH',
        AuthParameters: {
          USERNAME: username,
          PASSWORD: password,
        },
      })
    );
    if (out?.ChallengeName) {
      throw new Error(
        `Cognito admin auth returned challenge '${out.ChallengeName}'. Create/confirm the user so it can sign in normally (no MFA/force password change) before running the import.`
      );
    }
    const token = out?.AuthenticationResult?.IdToken;
    if (!token) throw new Error(`Missing IdToken from AdminInitiateAuth. Root error: ${msg}`);
    return token;
  }
}

async function main() {
  const jsonPath = process.argv[2];
  if (!jsonPath) {
    console.error('Usage: node scripts/import-strapi-directory.mjs <strapi-export.json>');
    process.exit(1);
  }

  const endpoint = requireEnv('NEXT_PUBLIC_AWS_APPSYNC_GRAPHQL_ENDPOINT');
  const region =
    process.env.NEXT_PUBLIC_AWS_APPSYNC_REGION || process.env.NEXT_PUBLIC_AWS_PROJECT_REGION;
  if (!region) throw new Error('Missing NEXT_PUBLIC_AWS_APPSYNC_REGION (or NEXT_PUBLIC_AWS_PROJECT_REGION)');

  const userPoolId = requireEnv('NEXT_PUBLIC_AWS_USER_POOLS_ID');
  const userPoolClientId = requireEnv('NEXT_PUBLIC_AWS_USER_POOLS_WEB_CLIENT_ID');
  const username = requireEnv('MIGRATION_USERNAME');
  const password = requireEnv('MIGRATION_PASSWORD');

  const idToken = await getIdToken({
    region,
    userPoolId,
    clientId: userPoolClientId,
    username,
    password,
  });

  const raw = fs.readFileSync(path.resolve(jsonPath), 'utf8');
  const categories = JSON.parse(raw);

  if (!Array.isArray(categories)) {
    throw new Error('Expected top-level JSON array of categories.');
  }

  console.log(`Importing ${categories.length} categories...`);

  for (let cIdx = 0; cIdx < categories.length; cIdx++) {
    const c = categories[cIdx];
    const catId = String(c.id);
    const attrs = c.attributes || {};

    const catInput = {
      id: catId,
      name: attrs.name || '',
      description: attrs.description ?? null,
      order: cIdx + 1,
        // default live if Strapi had it published
        isLive: !!attrs.publishedAt,
    };

    await upsert({
      endpoint,
      idToken,
      create: CREATE_CATEGORY,
      update: UPDATE_CATEGORY,
      input: catInput,
    });

    const links = attrs?.links?.data || [];
    console.log(`- Category ${catId}: ${catInput.name} (${links.length} links)`);

    for (let lIdx = 0; lIdx < links.length; lIdx++) {
      const l = links[lIdx];
      const lId = String(l.id);
      const la = l.attributes || {};

      const linkInput = {
        id: lId,
        categoryId: catId,
        title: la.title || '',
        description: la.description ?? null,
        url: cleanUrl(la.url),
        order: lIdx + 1,
        isNew: !!la.new,
        isUpdated: !!la.updated,
        // Schema uses AWSDate; Strapi provides YYYY-MM-DD or null
        lastUpdated: la.last_updated ?? null,
        isLive: !!la.publishedAt,
      };

      await upsert({
        endpoint,
        idToken,
        create: CREATE_LINK,
        update: UPDATE_LINK,
        input: linkInput,
      });
    }
  }

  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});



import https from 'https';
import aws4 from 'aws4';

function getAppSyncConfig() {
  const endpoint =
    process.env.NEXT_PUBLIC_AWS_APPSYNC_GRAPHQL_ENDPOINT ||
    process.env.AWS_APPSYNC_GRAPHQL_ENDPOINT;

  const region =
    process.env.NEXT_PUBLIC_AWS_APPSYNC_REGION ||
    process.env.AWS_REGION ||
    process.env.AWS_DEFAULT_REGION;

  if (!endpoint) {
    throw new Error('Missing AppSync endpoint env var (NEXT_PUBLIC_AWS_APPSYNC_GRAPHQL_ENDPOINT)');
  }
  if (!region) {
    throw new Error('Missing AWS region env var (NEXT_PUBLIC_AWS_APPSYNC_REGION/AWS_REGION)');
  }

  return { endpoint, region };
}

function getIamCredentials() {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const sessionToken = process.env.AWS_SESSION_TOKEN;

  if (!accessKeyId || !secretAccessKey) {
    throw new Error(
      'Missing IAM credentials (AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY). Required for server-side AppSync writes/secure reads.'
    );
  }

  return { accessKeyId, secretAccessKey, sessionToken };
}

export async function appsyncIamGraphql({ query, variables }) {
  const { endpoint, region } = getAppSyncConfig();
  const { accessKeyId, secretAccessKey, sessionToken } = getIamCredentials();

  const url = new URL(endpoint);
  const body = JSON.stringify({ query, variables });

  const reqOptions = {
    host: url.host,
    path: url.pathname,
    service: 'appsync',
    region,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    },
    body,
  };

  aws4.sign(reqOptions, { accessKeyId, secretAccessKey, sessionToken });

  return await new Promise((resolve, reject) => {
    const req = https.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data || '{}');
          resolve(parsed);
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



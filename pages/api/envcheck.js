export default function handler(req, res) {
  const keys = [
    'NEXT_PUBLIC_AWS_PROJECT_REGION',
    'NEXT_PUBLIC_AWS_APPSYNC_REGION',
    'NEXT_PUBLIC_AWS_APPSYNC_GRAPHQL_ENDPOINT',
    'NEXT_PUBLIC_AWS_APPSYNC_API_KEY',
    'NEXT_PUBLIC_AWS_USER_POOLS_ID',
    'NEXT_PUBLIC_AWS_USER_POOLS_WEB_CLIENT_ID',
  ];

  const present = Object.fromEntries(keys.map((k) => [k, Boolean(process.env[k])]));

  const endpoint = process.env.NEXT_PUBLIC_AWS_APPSYNC_GRAPHQL_ENDPOINT || '';
  let endpointHost = null;
  try {
    endpointHost = endpoint ? new URL(endpoint).host : null;
  } catch {
    endpointHost = endpoint || null;
  }

  const apiKey = process.env.NEXT_PUBLIC_AWS_APPSYNC_API_KEY || '';
  const apiKeyPrefix = apiKey ? `${apiKey.slice(0, 6)}…${apiKey.slice(-4)}` : null;

  const userPoolId = process.env.NEXT_PUBLIC_AWS_USER_POOLS_ID || '';
  const userPoolIdSuffix = userPoolId ? `…${userPoolId.slice(-6)}` : null;

  const webClientId = process.env.NEXT_PUBLIC_AWS_USER_POOLS_WEB_CLIENT_ID || '';
  const webClientIdSuffix = webClientId ? `…${webClientId.slice(-6)}` : null;

  res.status(200).json({
    ok: true,
    present,
    hints: {
      endpointHost,
      apiKeyPrefix,
      userPoolIdSuffix,
      webClientIdSuffix,
    },
    // Helpful sanity check that we're reading env from the intended project.
    cwd: process.cwd(),
    nodeEnv: process.env.NODE_ENV,
  });
}



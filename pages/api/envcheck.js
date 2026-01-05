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

  res.status(200).json({
    ok: true,
    present,
    // Helpful sanity check that we're reading env from the intended project.
    cwd: process.cwd(),
    nodeEnv: process.env.NODE_ENV,
  });
}



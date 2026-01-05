/* eslint-disable */
/**
 * Amplify config derived from NEXT_PUBLIC_* env vars.
 *
 * IMPORTANT: Do not throw at import-time. Missing env vars should not hard-crash
 * local dev; instead we surface a clear console error and return null.
 *
 * Required env vars:
 * - NEXT_PUBLIC_AWS_APPSYNC_GRAPHQL_ENDPOINT
 * - NEXT_PUBLIC_AWS_APPSYNC_API_KEY
 * - NEXT_PUBLIC_AWS_USER_POOLS_ID
 * - NEXT_PUBLIC_AWS_USER_POOLS_WEB_CLIENT_ID
 */

export function getAmplifyConfig() {
  const region =
    process.env.NEXT_PUBLIC_AWS_PROJECT_REGION ||
    process.env.NEXT_PUBLIC_AWS_APPSYNC_REGION ||
    process.env.NEXT_PUBLIC_AWS_REGION;

  const required = [
    'NEXT_PUBLIC_AWS_APPSYNC_GRAPHQL_ENDPOINT',
    'NEXT_PUBLIC_AWS_APPSYNC_API_KEY',
    'NEXT_PUBLIC_AWS_USER_POOLS_ID',
    'NEXT_PUBLIC_AWS_USER_POOLS_WEB_CLIENT_ID',
  ];

  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) {
    // eslint-disable-next-line no-console
    console.error(
      `[amplify-config] Missing env vars: ${missing.join(
        ', '
      )}. Create a .env.local in the project root and restart next dev.`
    );
    return null;
  }

  return {
    aws_project_region: region,

    // AppSync (public read via API key)
    aws_appsync_graphqlEndpoint: process.env.NEXT_PUBLIC_AWS_APPSYNC_GRAPHQL_ENDPOINT,
    aws_appsync_region: region,
    aws_appsync_authenticationType:
      process.env.NEXT_PUBLIC_AWS_APPSYNC_AUTHENTICATION_TYPE || 'API_KEY',
    aws_appsync_apiKey: process.env.NEXT_PUBLIC_AWS_APPSYNC_API_KEY,

    // Cognito User Pools (admin auth)
    aws_cognito_region: region,
    aws_user_pools_id: process.env.NEXT_PUBLIC_AWS_USER_POOLS_ID,
    aws_user_pools_web_client_id: process.env.NEXT_PUBLIC_AWS_USER_POOLS_WEB_CLIENT_ID,
    oauth: {},
  };
}




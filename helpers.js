import { Amplify } from 'aws-amplify';
import awsExports from './src/aws-exports';
import { generateClient } from 'aws-amplify/api';
import { getSettings } from './src/graphql/queries';

Amplify.configure(awsExports, { ssr: false });

const client = generateClient({
  authMode: 'apiKey',
});

export const getCurrentSettings = async () => {
  const { data } = await client.graphql({
    query: getSettings,
    variables: {
      id: '40b59f00-adf6-48f2-8310-3d78120141fd',
    },
  });
  return data.getSettings;
};

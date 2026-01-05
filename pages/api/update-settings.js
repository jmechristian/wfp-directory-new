import { updateSettings } from '../../src/graphql/mutations';
import { appsyncIamGraphql } from '../../lib/appsyncIam';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { passwordRequired } = body || {};

    if (typeof passwordRequired !== 'boolean') {
      return res.status(400).json({ message: 'passwordRequired must be a boolean' });
    }

    const { data, errors } = await appsyncIamGraphql({
      query: updateSettings,
      variables: {
        input: {
          id: '40b59f00-adf6-48f2-8310-3d78120141fd',
          passwordRequired,
        },
      },
    });

    if (errors?.length) {
      return res.status(500).json({ message: 'Error updating settings', errors });
    }

    return res.status(200).json({ settings: data.updateSettings });
  } catch (error) {
    console.error('Error updating settings:', error);
    return res.status(500).json({ message: 'Error updating settings' });
  }
}



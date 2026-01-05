import { listAuthConfigs } from '../../src/graphql/queries';
import { appsyncIamGraphql } from '../../lib/appsyncIam';

// Returns only non-sensitive fields (no password hashes) for display on /settings
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { data, errors } = await appsyncIamGraphql({
      query: listAuthConfigs,
    });

    if (errors?.length) {
      return res.status(500).json({ message: 'Error fetching configs', errors });
    }

    const items = (data?.listAuthConfigs?.items || []).map((c) => ({
      id: c.id,
      type: c.type,
      updatedAt: c.updatedAt,
      createdAt: c.createdAt,
    }));

    return res.status(200).json({ items });
  } catch (error) {
    console.error('Error fetching configs:', error);
    return res.status(500).json({ message: 'Error fetching configs' });
  }
}



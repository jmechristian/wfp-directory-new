import bcrypt from 'bcrypt';
import { appsyncIamGraphql } from '../../lib/appsyncIam';
import { updateAuthConfig } from '../../src/graphql/mutations';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { password } = body;
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const { data, errors } = await appsyncIamGraphql({
      query: updateAuthConfig,
      variables: {
        input: {
          id: '2a12cb5b-5e54-4317-b4d6-fbb8a2bc28ed',
          passwordHash: hashedPassword,
          updatedAt: new Date().toISOString(),
        },
      },
    });

    if (errors?.length) {
      return res.status(500).json({ message: 'Error updating master password', errors });
    }

    res.status(200).json(data.updateAuthConfig);
  } catch (error) {
    console.error('Error updating master password:', error);
    res.status(500).json({ message: 'Error updating master password' });
  }
}

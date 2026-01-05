import { listAuthConfigs } from '../../src/graphql/queries';
import bcrypt from 'bcrypt';
import { appsyncIamGraphql } from '../../lib/appsyncIam';

export default async function handler(req, res) {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({
      success: false,
      message: 'Password is required',
    });
  }

  try {
    const { data } = await appsyncIamGraphql({
      query: listAuthConfigs,
    });

    const authConfigs = data.listAuthConfigs.items;

    if (!authConfigs || authConfigs.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No auth configurations found',
      });
    }

    // Check each auth config using bcrypt.compare
    for (const authConfig of authConfigs) {
      // console.log('Attempting password verification:');
      // console.log('Input Password:', password);
      // console.log('Stored Hash:', authConfig.passwordHash);

      if (!authConfig.passwordHash) {
        // console.log('Missing hash for authConfig:', authConfig);
        continue;
      }

      try {
        // Convert $2y$ to $2b$ for Node.js bcrypt compatibility
        const modifiedHash = authConfig.passwordHash.replace(/^\$2y\$/, '$2b$');
        const isMatch = await bcrypt.compare(password, modifiedHash);
        // console.log('Password match result:', isMatch);

        if (isMatch) {
          // Set both auth and type cookies
          const thirtyDays = 30 * 24 * 60 * 60 * 1000;
          res.setHeader('Set-Cookie', [
            `auth=true; Path=/; Secure; SameSite=Strict; Max-Age=${thirtyDays}`,
            `type=${authConfig.type}; Path=/; Secure; SameSite=Strict; Max-Age=${thirtyDays}`,
          ]);

          return res.status(200).json({
            success: true,
            authConfig,
          });
        }
      } catch (error) {
        console.error('bcrypt.compare error:', error);
        continue;
      }
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid password',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while checking password',
      error: error.message,
    });
  }
}

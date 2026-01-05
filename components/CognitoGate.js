import { useEffect, useState } from 'react';
import { fetchAuthSession, getCurrentUser, signIn, signOut } from 'aws-amplify/auth';

export default function CognitoGate({ children, title = 'Admin Login' }) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        // Treat the user as signed-in only if we have valid tokens in this browser session.
        const session = await fetchAuthSession();
        const hasTokens = !!session?.tokens?.idToken;
        if (!hasTokens) {
          setUser(null);
          return;
        }
        const u = await getCurrentUser();
        setUser(u);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const onLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await signIn({ username: email, password });
      // Ensure tokens are actually present after login
      await fetchAuthSession();
      const u = await getCurrentUser();
      setUser(u);
      setPassword('');
    } catch (err) {
      setError(err?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const onLogout = async () => {
    setIsLoading(true);
    setError('');
    try {
      await signOut();
      setUser(null);
    } catch (err) {
      setError(err?.message || 'Logout failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Render-prop API so the caller can fully control the UI (admin dashboard only)
  if (typeof children === 'function') {
    return children({
      title,
      isLoading,
      isSignedIn: !!user,
      user,
      error,
      email,
      setEmail,
      password,
      setPassword,
      signIn: onLogin,
      signOut: onLogout,
    });
  }

  // Backward compatibility: if someone renders <CognitoGate><div/></CognitoGate>
  // just show children once signed in, otherwise nothing.
  if (isLoading) return null;
  if (!user) return null;
  return <>{children}</>;
}



import { createContext, useState, useEffect } from 'react';
import { PasswordModal } from './PasswordModal';
import { getCurrentSettings } from '../helpers';
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      let settings = null;
      try {
        settings = await getCurrentSettings();
      } catch (e) {
        // On fresh envs the Settings row may not exist yet; default to "no password gate"
        settings = { passwordRequired: false };
      }

      if (settings?.passwordRequired) {
        // Check for auth and type cookies
        const cookies = document.cookie.split(';');
        const authCookie = cookies.find((cookie) =>
          cookie.trim().startsWith('auth=')
        );
        const typeCookie = cookies.find((cookie) =>
          cookie.trim().startsWith('type=')
        );

        if (authCookie && authCookie.split('=')[1] === 'true' && typeCookie) {
          const type = typeCookie.split('=')[1];
          setUser({ authenticated: true, type });
        } else {
          setShowPasswordModal(true);
        }
      } else {
        // Clear cookies if password is not required
        document.cookie =
          'auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie =
          'type=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        setUser(null);
        setShowPasswordModal(false);
      }
    };

    checkAuth();
  }, []);

  const login = ({ authenticated, user }) => {
    if (authenticated) {
      setUser(user);

      setShowPasswordModal(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login }}>
      {showPasswordModal && (
        <PasswordModal
          onSubmit={({ authenticated, user }) => login({ authenticated, user })}
          onClose={() => setShowPasswordModal(false)}
        />
      )}
      {children}
    </AuthContext.Provider>
  );
};

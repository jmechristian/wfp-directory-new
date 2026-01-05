import React, { useState, useEffect, useContext } from 'react';
import { getCurrentSettings } from '../helpers';
import { PasswordModal } from '../components/PasswordModal';
import { AuthContext } from '../components/AuthProvider';

const Settings = () => {
  const { login } = useContext(AuthContext);
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [masterPassword, setMasterPassword] = useState('');
  const [settings, setSettings] = useState(null);
  const [configs, setConfigs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isMasterPasswordUpdating, setIsMasterPasswordUpdating] =
    useState(false);
  const [isAdminPasswordUpdating, setIsAdminPasswordUpdating] = useState(false);

  useEffect(() => {
    const checkAdminAndFetchData = async () => {
      try {
        // Check for type cookie
        const cookies = document.cookie.split(';');
        const typeCookie = cookies.find((cookie) =>
          cookie.trim().startsWith('type=')
        );

        if (!typeCookie || typeCookie.split('=')[1] !== 'admin') {
          setShowPasswordModal(true);
          return;
        }

        const settings = await getCurrentSettings();
        setSettings(settings);
        setPasswordRequired(settings.passwordRequired);

        const configsRes = await fetch('/api/list-configs');
        if (configsRes.ok) {
          const { items } = await configsRes.json();
          setConfigs(items || []);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setIsLoading(false);
      }
    };

    checkAdminAndFetchData();
  }, [showPasswordModal]);

  const handleAdminPasswordSubmit = async (e) => {
    e.preventDefault();
    setIsAdminPasswordUpdating(true);
    try {
      const response = await fetch('/api/update-admin-password', {
        method: 'POST',
        body: JSON.stringify({ password: adminPassword }),
      });
      if (response.ok) {
        setAdminPassword('');
      }
    } catch (error) {
      console.error('Error updating admin password:', error);
    } finally {
      setIsAdminPasswordUpdating(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'America/New_York',
      hour12: true,
    });
  };

  const handleUpdateMasterPassword = async (e) => {
    e.preventDefault();
    setIsMasterPasswordUpdating(true);
    try {
      const response = await fetch('/api/update-master-password', {
        method: 'POST',
        body: JSON.stringify({ password: masterPassword }),
      });
      if (response.ok) {
        setMasterPassword('');
      }
    } catch (error) {
      console.error('Error updating master password:', error);
    } finally {
      setIsMasterPasswordUpdating(false);
    }
  };

  if (showPasswordModal) {
    return (
      <PasswordModal
        onSubmit={({ authenticated, user }) => {
          login({ authenticated, user });
          setShowPasswordModal(false);
        }}
        onClose={() => setShowPasswordModal(false)}
      />
    );
  }

  if (isLoading) {
    return (
      <div className='settingsPage'>
        <div className='settingsContainer'>
          <div className='skeleton'>
            <div className='skeleton-toggle'></div>
            <div className='skeleton-password-section'>
              <div className='skeleton-form'></div>
              <div className='skeleton-form'></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='settingsPage'>
      <div className='settingsContainer'>
        <div className='toggleSection'>
          <label className='toggleLabel'>
            Password Required
            <div className='toggleSwitch'>
              <input
                type='checkbox'
                checked={passwordRequired}
                onChange={async () => {
                  await fetch('/api/update-settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ passwordRequired: !passwordRequired }),
                  });
                  // Clear all cookies
                  document.cookie.split(';').forEach((cookie) => {
                    document.cookie = cookie
                      .replace(/^ +/, '')
                      .replace(
                        /=.*/,
                        '=;expires=' + new Date().toUTCString() + ';path=/'
                      );
                  });
                  setPasswordRequired(!passwordRequired);
                }}
              />
              <span className='slider'></span>
            </div>
          </label>
        </div>

        <div className='passwordSection'>
          <form onSubmit={handleAdminPasswordSubmit}>
            <h3>Admin Password</h3>
            <div className='passwordRow'>
              <input
                type='password'
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder='Enter new admin password'
              />
              <button type='submit' disabled={isAdminPasswordUpdating}>
                {isAdminPasswordUpdating ? 'Updating...' : 'Update'}
              </button>
            </div>
            <p className='timestamp'>
              Last updated:{' '}
              {formatTimestamp(
                configs.find((config) => config.type === 'admin')?.updatedAt
              )}
            </p>
          </form>

          <form onSubmit={handleUpdateMasterPassword}>
            <h3>Master Password</h3>
            <div className='passwordRow'>
              <input
                type='password'
                value={masterPassword}
                onChange={(e) => setMasterPassword(e.target.value)}
                placeholder='Enter new master password'
                disabled={isMasterPasswordUpdating}
              />
              <button type='submit' disabled={isMasterPasswordUpdating}>
                {isMasterPasswordUpdating ? 'Updating...' : 'Update'}
              </button>
            </div>
            <p className='timestamp'>
              Last updated:{' '}
              {formatTimestamp(
                configs.find((config) => config.type === 'master')?.updatedAt
              )}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;

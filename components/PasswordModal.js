import { useState } from 'react';

export const PasswordModal = ({ onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    // Validate password against env variable or your preferred method
    const response = await fetch('/api/check-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        password: password,
      }),
    });

    const data = await response.json();
    if (data.success) {
      onSubmit({ authenticated: true, user: data.authConfig });
    } else {
      setError('Incorrect password');
    }
    setIsSubmitting(false);
  };

  return (
    <div className='password-modal-overlay'>
      <div className='password-modal-container'>
        <h2 className='password-modal-title'>Enter Password</h2>
        <form onSubmit={handleSubmit}>
          <input
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder='Enter password'
            className='password-modal-input'
          />
          {error && <p className='password-modal-error'>{error}</p>}
          <div className='password-modal-buttons'>
            <button type='submit' className='submit'>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

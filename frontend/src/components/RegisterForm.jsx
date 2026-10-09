import { useState } from 'react';

export default function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      if (response.ok) {
        setSuccess('Registration successful! You can now log in.');
        setName('');
        setEmail('');
        setPassword('');
      } else {
        const errText = await response.text();
        setError(errText || 'Registration failed');
      }
    } catch (err) {
      console.error(err);
      setError('Error connecting to server');
    }
  };

  return (
    <form className="auth-form form-animate-enter" onSubmit={handleSubmit}>
      {error && <div style={{ color: '#ef4444', marginBottom: '12px', fontSize: '14px', background: 'rgba(239, 68, 68, 0.1)', padding: '8px 12px', borderRadius: '6px' }}>{error}</div>}
      {success && <div style={{ color: '#10b981', marginBottom: '12px', fontSize: '14px', background: 'rgba(16, 185, 129, 0.1)', padding: '8px 12px', borderRadius: '6px' }}>{success}</div>}

      <div className="form-group">
        <label htmlFor="name">Full Name</label>
        <div className="input-wrapper">
          <input type="text" id="name" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="email">Email Address</label>
        <div className="input-wrapper">
          <input type="email" id="email" placeholder="john@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <div className="input-wrapper">
          <input type="password" id="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
      </div>

      <button type="submit" className="submit-btn">
        Create Account
      </button>
    </form>
  );
}

import { useState } from 'react';

export default function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (response.ok) {
        const data = await response.json();
        // The backend returns user role inside data.user.role
        onLogin(data.user.role);
      } else {
        const errText = await response.text();
        setError(errText || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      setError('Error connecting to server');
    }
  };

  return (
    <form className="auth-form form-animate-enter" onSubmit={handleSubmit}>
      {error && <div style={{ color: '#ef4444', marginBottom: '12px', fontSize: '14px', background: 'rgba(239, 68, 68, 0.1)', padding: '8px 12px', borderRadius: '6px' }}>{error}</div>}

      <div className="form-group">
        <label htmlFor="email">Email Address</label>
        <div className="input-wrapper">
          <input 
            type="email" 
            id="email" 
            placeholder="sp0577016@gmail.com or prakash@gmail.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <div className="input-wrapper">
          <input type="password" id="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
      </div>

      <div className="forgot-password">
        <a href="#forgot">Forgot Password?</a>
      </div>

      <button type="submit" className="submit-btn">
        Sign In
      </button>
    </form>
  );
}

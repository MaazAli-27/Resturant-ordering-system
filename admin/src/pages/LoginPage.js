import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import './LoginPage.css';

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!email || !password) return setError('Please fill in all fields');
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      if (res.data.data.role !== 'admin' && res.data.data.role !== 'superadmin') {
        return setError('You are not authorized as admin');
      }
      localStorage.setItem('adminToken', res.data.token);
      onLogin(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleLogin(); };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">🍽️</div>
        <h1>Savoria Admin</h1>
        <p>Sign in to your admin account</p>
        <div className="login-form">
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={handleKeyDown} placeholder="admin@savoria.com" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={handleKeyDown} placeholder="••••••••" />
          </div>
          {error && <p className="login-error">{error}</p>}
          <button className="login-btn" onClick={handleLogin} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
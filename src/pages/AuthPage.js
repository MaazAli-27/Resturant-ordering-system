import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './AuthPage.css';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login, register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };

  const validate = () => {
    if (!form.email || !form.password) return 'Please fill in all fields';
    if (!isLogin && !form.name) return 'Please enter your name';
    if (!isLogin && !form.phone) return 'Please enter your phone number';
    if (!isLogin && form.password.length < 6) return 'Password must be at least 6 characters';
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Please enter a valid email';
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    try {
      setLoading(true); setError('');
      if (isLogin) {
        await login(form.email, form.password);
        toast.success(`Welcome back! 👋`);
      } else {
        await register(form.name, form.email, form.phone, form.password);
        toast.success(`Account created! Welcome to Savoria 🍽️`);
      }
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong';
      setError(msg);
      toast.error(msg);
    } finally { setLoading(false); }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSubmit(); };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
      </div>
      <div className="auth-card">
        <div className="auth-logo">🍽️</div>
        <h1 className="auth-title">Savoria</h1>
        <p className="auth-sub">{isLogin ? 'Welcome back!' : 'Create your account'}</p>

        <div className="auth-tabs">
          <button className={`auth-tab ${isLogin ? 'active' : ''}`} onClick={() => { setIsLogin(true); setError(''); }}>Login</button>
          <button className={`auth-tab ${!isLogin ? 'active' : ''}`} onClick={() => { setIsLogin(false); setError(''); }}>Sign Up</button>
        </div>

        <div className="auth-form">
          {!isLogin && (
            <div className="auth-input-wrap">
              <label>Full Name</label>
              <div className="input-with-icon">
                <span className="input-icon">👤</span>
                <input name="name" value={form.name} onChange={handleChange} onKeyDown={handleKeyDown} placeholder="John Doe" />
              </div>
            </div>
          )}
          <div className="auth-input-wrap">
            <label>Email</label>
            <div className="input-with-icon">
              <span className="input-icon">📧</span>
              <input name="email" type="email" value={form.email} onChange={handleChange} onKeyDown={handleKeyDown} placeholder="john@example.com" />
            </div>
          </div>
          {!isLogin && (
            <div className="auth-input-wrap">
              <label>Phone Number</label>
              <div className="input-with-icon">
                <span className="input-icon">📞</span>
                <input name="phone" value={form.phone} onChange={handleChange} onKeyDown={handleKeyDown} placeholder="+92 300 123 4567" />
              </div>
            </div>
          )}
          <div className="auth-input-wrap">
            <label>Password</label>
            <div className="input-with-icon">
              <span className="input-icon">🔒</span>
              <input name="password" type={showPass ? 'text' : 'password'} value={form.password} onChange={handleChange} onKeyDown={handleKeyDown} placeholder="••••••••" />
              <button className="toggle-pass" onClick={() => setShowPass(!showPass)} type="button">{showPass ? '🙈' : '👁️'}</button>
            </div>
          </div>

          {error && (
            <div className="auth-error-box">
              <span>⚠️</span> {error}
            </div>
          )}

          <button className="auth-submit" onClick={handleSubmit} disabled={loading}>
            {loading ? <span className="auth-spinner" /> : isLogin ? '🚀 Login' : '✨ Create Account'}
          </button>
        </div>

        <p className="auth-switch">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button className="auth-switch-btn" onClick={() => { setIsLogin(!isLogin); setError(''); }}>
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>

        {isLogin && (
          <div className="demo-credentials">
            <p>🧪 Demo: <strong>admin@savoria.com</strong> / <strong>admin123</strong></p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthPage;

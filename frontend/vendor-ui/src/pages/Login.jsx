import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Mock credentials for each role
const MOCK_USERS = {
  admin: { password: 'admin123', role: 'ADMIN', name: 'Admin User', landing: '/dashboard/stats' },
  vendor: { password: 'vendor123', role: 'VENDOR', name: 'Vendor Corp', landing: '/dashboard/vendors' },
  procurement: { password: 'proc123', role: 'PROCUREMENT_OFFICER', name: 'Proc Officer', landing: '/dashboard/workflow' },
  legal: { password: 'legal123', role: 'LEGAL_TEAM', name: 'Legal Team', landing: '/dashboard/workflow' },
  finance: { password: 'fin123', role: 'FINANCE_TEAM', name: 'Finance Team', landing: '/dashboard/workflow' },
};

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    const user = MOCK_USERS[username.toLowerCase()];
    if (user && user.password === password) {
      localStorage.setItem('role', user.role);
      localStorage.setItem('username', username);
      localStorage.setItem('name', user.name);
      navigate(user.landing);
    } else {
      setError('Invalid username or password. Please try again.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <h1>Vendor onboarding system</h1>
          <p>hello </p>
        </div>

        <p className="login-title">Welcome back</p>
        <p className="login-sub">Sign in to your account to continue</p>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. admin, vendor, procurement..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-full" style={{ padding: '0.75rem', fontSize: '0.9rem', justifyContent: 'center' }}>
            Sign In →
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

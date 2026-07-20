import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Login.css'; // 👈 Exporting l-CSS file

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await login(email, password);
      if (!result.success) {
        setError(result.message || 'Invalid email or password.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      {/* Brand Header */}
      <div className="brand-header">
        <h1 className="brand-title">
          Reslan <span className="brand-accent">CarWash</span>
        </h1>
        <p className="brand-subtitle">Car Wash Management System</p>
      </div>

      {/* Login Card */}
      <div className="login-card">
        <h2 className="welcome-title">Welcome Back</h2>
        <p className="welcome-subtitle">Please enter your details to sign in.</p>

        {error && <div className="error-alert">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Email Input */}
          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="login-input"
            />
          </div>

          {/* Password Input */}
          <div className="input-group">
            <label className="input-label">Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="login-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="eye-button"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  // Eye Off Icon
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  // Eye Icon
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="submit-button"
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
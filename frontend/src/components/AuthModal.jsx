import React, { useState } from 'react';
import { X, Lock, Mail, User, KeyRound } from 'lucide-react';
import { api, setStoredToken, setStoredUser } from '../services/api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'passenger',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await api.register(formData);
      }
      const loginRes = await api.login({
        email: formData.email,
        password: formData.password,
      });

      setStoredToken(loginRes.token);
      const userObj = {
        name: formData.name || formData.email.split('@')[0],
        email: formData.email,
        role: loginRes.role || formData.role || 'passenger',
      };
      setStoredUser(userObj);

      onAuthSuccess(userObj);
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card modal-sm">
        <div className="modal-header">
          <div className="modal-header-title">
            <Lock size={20} className="modal-title-icon" />
            <div>
              <h3>{isRegister ? 'Create Account' : 'Welcome to SmartRail'}</h3>
              <p>{isRegister ? 'Sign up for a passenger account' : 'Enter your email and password to sign in'}</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-alert">{error}</div>}

          {isRegister && (
            <div className="form-group">
              <label><User size={14} /> Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Daksh Srivastava"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          )}

          <div className="form-group">
            <label><Mail size={14} /> Email Address</label>
            <input
              type="email"
              required
              placeholder="e.g. user@railway.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label><KeyRound size={14} /> Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          {isRegister && (
            <div className="form-group">
              <label>System Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="passenger">Passenger</option>
                <option value="staff">Station Staff</option>
                <option value="admin">Operations Admin</option>
              </select>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Authenticating...' : isRegister ? 'Register Account' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer-toggle">
          {isRegister ? (
            <p>
              Already have an account?{' '}
              <button type="button" onClick={() => setIsRegister(false)}>
                Sign In
              </button>
            </p>
          ) : (
            <p>
              New passenger?{' '}
              <button type="button" onClick={() => setIsRegister(true)}>
                Create Account
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import authService from '../../services/auth.service';
import '../../assets/styles/login.css';
import { Lock, Mail } from 'lucide-react';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [newPasswordData, setNewPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [requiresPasswordChange, setRequiresPasswordChange] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleNewPasswordChange = (e) => {
    setNewPasswordData({ ...newPasswordData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(credentials);
      if (res.data?.requirePasswordChange) {
        setRequiresPasswordChange(true);
        setUserEmail(res.data.user.email);
        setError('For your security, you must change your temporary password before proceeding.');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChangeSubmit = async (e) => {
    e.preventDefault();
    if (newPasswordData.newPassword !== newPasswordData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await authService.changePassword({
        email: userEmail,
        tempPassword: newPasswordData.currentPassword,
        newPassword: newPasswordData.newPassword
      });
      // After changing password, we need to log them in with the new token
      if (res.success) {
        localStorage.setItem('token', res.data.token);
        // We'd ideally need a way to set user in context, but reload works or calling getProfile
        window.location.href = '/dashboard';
      }
    } catch (err) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card glass-panel">
        <div className="login-header">
          <h2>{requiresPasswordChange ? 'Change Password' : 'Welcome Back'}</h2>
          <p>{requiresPasswordChange ? 'Set a new secure password' : 'AI Employee Attendance System'}</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        {!requiresPasswordChange ? (
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <Mail className="input-icon" size={20} />
              <input 
                type="email" 
                name="email" 
                placeholder="Email Address" 
                value={credentials.email}
                onChange={handleChange}
                required 
              />
            </div>
            <div className="input-group">
              <Lock className="input-icon" size={20} />
              <input 
                type="password" 
                name="password" 
                placeholder="Password" 
                value={credentials.password}
                onChange={handleChange}
                required 
              />
            </div>
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handlePasswordChangeSubmit}>
            <div className="input-group">
              <Lock className="input-icon" size={20} />
              <input 
                type="password" 
                name="currentPassword" 
                placeholder="Current Password" 
                value={newPasswordData.currentPassword}
                onChange={handleNewPasswordChange}
                required 
              />
            </div>
            <div className="input-group">
              <Lock className="input-icon" size={20} />
              <input 
                type="password" 
                name="newPassword" 
                placeholder="New Password" 
                value={newPasswordData.newPassword}
                onChange={handleNewPasswordChange}
                required 
                minLength="6"
              />
            </div>
            <div className="input-group">
              <Lock className="input-icon" size={20} />
              <input 
                type="password" 
                name="confirmPassword" 
                placeholder="Confirm New Password" 
                value={newPasswordData.confirmPassword}
                onChange={handleNewPasswordChange}
                required 
                minLength="6"
              />
            </div>
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Updating...' : 'Update Password & Login'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;

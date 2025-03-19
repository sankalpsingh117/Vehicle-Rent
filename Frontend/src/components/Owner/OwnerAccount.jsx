import React, { useState, useEffect } from "react";
import axios from 'axios';
import "../account.css";

const OwnerAccount = () => {
  const [info, setInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    getAccountInfo();
  }, []);

  const getAccountInfo = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/account-info', { 
        headers: { Authorisation: `Bearer ${token}` } 
      });
      setInfo(response.data);
    } catch (err) {
      setError('Failed to fetch account information');
      console.error('Error fetching account info:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }

    try {
      setChangingPassword(true);
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:3000/change-password',
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        },
        { headers: { Authorisation: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setPasswordSuccess('Password changed successfully');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setPasswordError(response.data.message || 'Failed to change password');
      }
    } catch (err) {
      setPasswordError('Failed to change password. Please try again.');
      console.error('Error changing password:', err);
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="account-container">
        <div className="account-card">
          <div className="account-header">
            <h2>Loading...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="account-container">
        <div className="account-card">
          <div className="account-header">
            <h2>Error</h2>
            <p className="error-message">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="account-container">
      <div className="account-card">
        <div className="account-header">
          <h2>My Account</h2>
          <p className="subtitle">Manage your business profile and security settings</p>
        </div>

        <div className="account-content">
          <div className="profile-info">
            <h3>Business Information</h3>
            <div className="info-content">
              <div className="info-group">
                <span className="info-label">Name</span>
                <p className="info-value">{info.name}</p>
              </div>
              
              <div className="info-group">
                <span className="info-label">Email</span>
                <p className="info-value">{info.email}</p>
              </div>

              <div className="info-group">
                <span className="info-label">Company Name</span>
                <p className="info-value">{info.companyName || 'Not specified'}</p>
              </div>
            </div>
          </div>

          <div className="password-section">
            <h3>Security Settings</h3>
            <form className="password-form" onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({
                    ...passwordForm,
                    currentPassword: e.target.value
                  })}
                  required
                />
              </div>

              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({
                    ...passwordForm,
                    newPassword: e.target.value
                  })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({
                    ...passwordForm,
                    confirmPassword: e.target.value
                  })}
                  required
                />
              </div>

              {passwordError && <p className="error-message">{passwordError}</p>}
              {passwordSuccess && <p className="success-message">{passwordSuccess}</p>}

              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={changingPassword}
              >
                {changingPassword ? 'Changing Password...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerAccount;

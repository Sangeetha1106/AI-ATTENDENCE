import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const Profile = () => {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  return (
    <div className="profile-container page-container">
      <div className="page-header">
        <h2>My Profile</h2>
      </div>
      <div className="profile-card glass-panel">
        <div className="profile-info">
          <div className="info-group">
            <label>Name</label>
            <p>{user.name}</p>
          </div>
          <div className="info-group">
            <label>Role</label>
            <p className="role-badge">{user.role}</p>
          </div>
          {user.department && (
            <div className="info-group">
              <label>Department</label>
              <p>{user.department}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h2>AI Attendance System</h2>
      </div>
      <div className="navbar-menu">
        <div className="user-profile">
          <User className="icon" />
          <span>{user?.name} ({user?.role})</span>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut className="icon" /> Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

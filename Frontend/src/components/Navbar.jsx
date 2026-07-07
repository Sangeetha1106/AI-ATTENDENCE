import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, LogOut, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import notificationService from '../services/notification.service';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (user) {
      notificationService.getMyNotifications().then(res => {
        setNotifications(res.data || []);
      }).catch(err => console.error(err));
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h2>AI Attendance System</h2>
      </div>
      <div className="navbar-menu" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        
        <div style={{ position: 'relative' }}>
          <button 
            style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative' }}
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <Bell className="icon" size={24} />
            {unreadCount > 0 && (
              <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '10px', fontWeight: 'bold' }}>
                {unreadCount}
              </span>
            )}
          </button>
          
          {showDropdown && (
            <div style={{ position: 'absolute', right: 0, top: '100%', width: '300px', background: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', borderRadius: '8px', zIndex: 1000, maxHeight: '400px', overflowY: 'auto' }}>
              <div style={{ padding: '12px', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold' }}>Notifications</div>
              {notifications.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>No notifications</div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} style={{ padding: '12px', borderBottom: '1px solid #e2e8f0', backgroundColor: n.isRead ? 'white' : '#f0f9ff' }} onClick={() => !n.isRead && handleMarkRead(n.id)}>
                    <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>{n.title}</div>
                    <div style={{ fontSize: '13px', color: '#475569' }}>{n.message}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

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

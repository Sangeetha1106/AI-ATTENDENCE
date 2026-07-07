import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, Users, Building2, CalendarCheck, FileText, BrainCircuit, User, Settings, Bell, LogOut } from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);

  if (!user) return null;

  const role = user.role;

  const renderLinks = () => {
    if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
      return (
        <>
          <li><NavLink to="/dashboard" className={({isActive}) => isActive ? 'active' : ''}><LayoutDashboard className="icon" /> Dashboard</NavLink></li>
          <li><NavLink to="/employees" className={({isActive}) => isActive ? 'active' : ''}><Users className="icon" /> Employees</NavLink></li>
          <li><NavLink to="/employees/add" className={({isActive}) => isActive ? 'active' : ''}><User className="icon" /> Add Employee</NavLink></li>
          <li><NavLink to="/departments" className={({isActive}) => isActive ? 'active' : ''}><Building2 className="icon" /> Departments</NavLink></li>
          <li><NavLink to="/attendance/history" className={({isActive}) => isActive ? 'active' : ''}><CalendarCheck className="icon" /> Attendance</NavLink></li>
          <li><NavLink to="/leave-view" className={({isActive}) => isActive ? 'active' : ''}><CalendarCheck className="icon" /> Leave Requests</NavLink></li>
          <li><NavLink to="/on-duty" className={({isActive}) => isActive ? 'active' : ''}><CalendarCheck className="icon" /> On Duty</NavLink></li>
          <li><NavLink to="/reports" className={({isActive}) => isActive ? 'active' : ''}><FileText className="icon" /> Reports</NavLink></li>
          <li><NavLink to="/ai-summary" className={({isActive}) => isActive ? 'active' : ''}><BrainCircuit className="icon" /> AI Summary</NavLink></li>
          <li><NavLink to="/settings" className={({isActive}) => isActive ? 'active' : ''}><Settings className="icon" /> Settings</NavLink></li>
        </>
      );
    } 
    
    if (role === 'HR_MANAGER') {
      return (
        <>
          <li><NavLink to="/dashboard" className={({isActive}) => isActive ? 'active' : ''}><LayoutDashboard className="icon" /> Dashboard</NavLink></li>
          <li><NavLink to="/attendance/history" className={({isActive}) => isActive ? 'active' : ''}><CalendarCheck className="icon" /> Attendance</NavLink></li>
          <li><NavLink to="/leave-approval" className={({isActive}) => isActive ? 'active' : ''}><CalendarCheck className="icon" /> Leave Requests</NavLink></li>
          <li><NavLink to="/on-duty-approval" className={({isActive}) => isActive ? 'active' : ''}><CalendarCheck className="icon" /> On Duty</NavLink></li>
          <li><NavLink to="/ai-summary" className={({isActive}) => isActive ? 'active' : ''}><BrainCircuit className="icon" /> AI Summary</NavLink></li>
          <li><NavLink to="/reports" className={({isActive}) => isActive ? 'active' : ''}><FileText className="icon" /> Reports</NavLink></li>
        </>
      );
    } 
    
    if (role === 'DEPARTMENT_MANAGER') {
      return (
        <>
          <li><NavLink to="/dashboard" className={({isActive}) => isActive ? 'active' : ''}><LayoutDashboard className="icon" /> Dashboard</NavLink></li>
          <li><NavLink to="/attendance/history" className={({isActive}) => isActive ? 'active' : ''}><CalendarCheck className="icon" /> Attendance</NavLink></li>
          <li><NavLink to="/leave-requests" className={({isActive}) => isActive ? 'active' : ''}><CalendarCheck className="icon" /> Leave Requests</NavLink></li>
          <li><NavLink to="/on-duty-requests" className={({isActive}) => isActive ? 'active' : ''}><CalendarCheck className="icon" /> On Duty</NavLink></li>
          <li><NavLink to="/ai-summary" className={({isActive}) => isActive ? 'active' : ''}><BrainCircuit className="icon" /> AI Summary</NavLink></li>
        </>
      );
    }

    if (role === 'EMPLOYEE') {
      return (
        <>
          <li><NavLink to="/dashboard" className={({isActive}) => isActive ? 'active' : ''}><LayoutDashboard className="icon" /> Dashboard</NavLink></li>
          <li><NavLink to="/attendance/history" className={({isActive}) => isActive ? 'active' : ''}><CalendarCheck className="icon" /> Attendance</NavLink></li>
          <li><NavLink to="/leave-apply" className={({isActive}) => isActive ? 'active' : ''}><CalendarCheck className="icon" /> Leave</NavLink></li>
          <li><NavLink to="/on-duty-apply" className={({isActive}) => isActive ? 'active' : ''}><CalendarCheck className="icon" /> On Duty</NavLink></li>
          <li><NavLink to="/notifications" className={({isActive}) => isActive ? 'active' : ''}><Bell className="icon" /> Notifications</NavLink></li>
          <li><NavLink to="/profile" className={({isActive}) => isActive ? 'active' : ''}><User className="icon" /> Profile</NavLink></li>
        </>
      );
    }

    return null;
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h3>Menu</h3>
      </div>
      <ul className="sidebar-nav">
        {renderLinks()}

        <li>
          <NavLink to="/login" onClick={logout} className="logout-btn" style={{marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1.5rem', color: '#EF4444', textDecoration: 'none', fontWeight: '500'}}>
            <LogOut className="icon" /> Logout
          </NavLink>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;

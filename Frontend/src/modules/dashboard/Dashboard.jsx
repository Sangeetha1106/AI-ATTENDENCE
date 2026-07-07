import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import HRDashboard from './HRDashboard';
import ManagerDashboard from './ManagerDashboard';
import EmployeeDashboard from './EmployeeDashboard';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  if (user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') {
    return <AdminDashboard />;
  }
  
  if (user?.role === 'HR_MANAGER') {
    return <HRDashboard />;
  }

  if (user?.role === 'DEPARTMENT_MANAGER') {
    return <ManagerDashboard />;
  }

  if (user?.role === 'EMPLOYEE') {
    return <EmployeeDashboard />;
  }

  return <div>Access Denied</div>;
};

export default Dashboard;

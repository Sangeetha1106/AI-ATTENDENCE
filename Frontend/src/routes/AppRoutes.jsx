import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';

import Login from '../modules/auth/Login';
import Profile from '../modules/auth/Profile';
import Dashboard from '../modules/dashboard/Dashboard';
import EmployeeList from '../modules/employee/EmployeeList';
import AddEmployee from '../modules/employee/AddEmployee';
import EmployeeDetails from '../modules/employee/EmployeeDetails';
import DepartmentList from '../modules/department/DepartmentList';
import AddDepartment from '../modules/department/AddDepartment';
import MarkAttendance from '../modules/attendance/MarkAttendance';
import AttendanceHistory from '../modules/attendance/AttendanceHistory';
import AttendanceDetails from '../modules/attendance/AttendanceDetails';
import DailyReport from '../modules/reports/DailyReport';
import MonthlyReport from '../modules/reports/MonthlyReport';
import YearlyReport from '../modules/reports/YearlyReport';
import AISummary from '../modules/ai/AISummary';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute roles={['ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER', 'EMPLOYEE']} />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/attendance/history" element={<AttendanceHistory />} />
        <Route path="/attendance/:id" element={<AttendanceDetails />} />
      </Route>

      <Route element={<ProtectedRoute roles={['ADMIN', 'HR_MANAGER']} />}>
        <Route path="/employees" element={<EmployeeList />} />
        <Route path="/employees/add" element={<AddEmployee />} />
        <Route path="/employees/:id" element={<EmployeeDetails />} />
      </Route>

      <Route element={<ProtectedRoute roles={['ADMIN']} />}>
        <Route path="/departments" element={<DepartmentList />} />
        <Route path="/departments/add" element={<AddDepartment />} />
      </Route>

      <Route element={<ProtectedRoute roles={['ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER']} />}>
        <Route path="/attendance/mark" element={<MarkAttendance />} />
        <Route path="/reports" element={<DailyReport />} />
        <Route path="/reports/daily" element={<DailyReport />} />
        <Route path="/reports/monthly" element={<MonthlyReport />} />
        <Route path="/reports/yearly" element={<YearlyReport />} />
        <Route path="/ai-summary" element={<AISummary />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;

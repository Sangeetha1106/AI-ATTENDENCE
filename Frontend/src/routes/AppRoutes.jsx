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

import AttendanceHistory from '../modules/attendance/AttendanceHistory';
import AttendanceDetails from '../modules/attendance/AttendanceDetails';
import DailyReport from '../modules/reports/DailyReport';
import MonthlyReport from '../modules/reports/MonthlyReport';
import YearlyReport from '../modules/reports/YearlyReport';
import AISummary from '../modules/ai/AISummary';

import ManagerLeaveRequests from '../modules/leave/ManagerLeaveRequests';
import HRLeaveApproval from '../modules/leave/HRLeaveApproval';
import AdminLeaveView from '../modules/leave/AdminLeaveView';
import LeaveApply from '../modules/leave/LeaveApply';
import OnDutyApply from '../modules/onduty/OnDutyApply';
import ManagerOnDutyRequests from '../modules/onduty/ManagerOnDutyRequests';
import HROnDutyApproval from '../modules/onduty/HROnDutyApproval';

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
        <Route path="/leave-apply" element={<LeaveApply />} />
        <Route path="/on-duty-apply" element={<OnDutyApply />} />
      </Route>

      <Route element={<ProtectedRoute roles={['ADMIN', 'HR_MANAGER']} />}>
        <Route path="/employees" element={<EmployeeList />} />
        <Route path="/employees/add" element={<AddEmployee />} />
        <Route path="/employees/:id" element={<EmployeeDetails />} />
      </Route>

      <Route element={<ProtectedRoute roles={['ADMIN']} />}>
        <Route path="/departments" element={<DepartmentList />} />
        <Route path="/departments/add" element={<AddDepartment />} />
        <Route path="/leave-view" element={<AdminLeaveView />} />
      </Route>

      <Route element={<ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN']} />}>
        <Route path="/leave-view" element={<AdminLeaveView />} />
      </Route>

      <Route element={<ProtectedRoute roles={['DEPARTMENT_MANAGER']} />}>
        <Route path="/leave-requests" element={<ManagerLeaveRequests />} />
        <Route path="/on-duty-requests" element={<ManagerOnDutyRequests />} />
      </Route>

      <Route element={<ProtectedRoute roles={['HR_MANAGER']} />}>
        <Route path="/leave-approval" element={<HRLeaveApproval />} />
        <Route path="/on-duty-approval" element={<HROnDutyApproval />} />
      </Route>

      <Route element={<ProtectedRoute roles={['ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER']} />}>

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

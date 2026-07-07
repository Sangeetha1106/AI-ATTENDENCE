const express = require('express');
const cors = require('cors');
const authRoutes = require('./modules/auth/auth.routes');
const employeeRoutes = require('./modules/employee/employee.routes');
const attendanceRoutes = require('./modules/attendance/attendance.routes');
const departmentRoutes = require('./modules/department/department.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');
const reportRoutes = require('./modules/report/report.routes');
const aiRoutes = require('./modules/ai/ai.routes');
const leaveRoutes = require('./modules/leave/leave.routes');
const onDutyRoutes = require('./modules/onduty/onduty.routes');
const notificationRoutes = require('./modules/notification/notification.routes');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/onduty', onDutyRoutes);
app.use('/api/notifications', notificationRoutes);

app.use(errorMiddleware);

module.exports = app;

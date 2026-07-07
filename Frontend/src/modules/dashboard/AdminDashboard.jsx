import React, { useEffect, useState } from 'react';
import dashboardService from '../../services/dashboard.service';
import DashboardCard from '../../components/DashboardCard';
import Loader from '../../components/Loader';
import { Users, Building2, UserCheck, UserX, CalendarClock, Briefcase, Percent, Clock3 } from 'lucide-react';
import { formatPercentage } from '../../utils/helpers';
import AttendanceTable from '../../components/AttendanceTable';
import attendanceService from '../../services/attendance.service';
import '../../assets/styles/dashboard.css';

const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [todayRecords, setTodayRecords] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, attendanceRes] = await Promise.all([
          dashboardService.getSummary(),
          attendanceService.getByDate(new Date().toISOString().split('T')[0])
        ]);
        setSummary(summaryRes.data);
        setTodayRecords(attendanceRes.data);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader />;
  if (error) return <div className="error-message">{error}</div>;
  if (!summary) return null;

  return (
    <div className="dashboard-container page-container">
      <div className="page-header">
        <h2>Admin Overview</h2>
      </div>
      
      <div className="dashboard-grid">
        <DashboardCard title="Total Employees" value={summary.totalEmployees} icon={Users} colorClass="card-blue" />
        <DashboardCard title="Departments" value={summary.totalDepartments} icon={Building2} colorClass="card-purple" />
        <DashboardCard title="Present" value={summary.totalPresent} icon={UserCheck} colorClass="card-green" />
        <DashboardCard title="Late" value={summary.totalLate} icon={Clock3} colorClass="card-orange" />
        <DashboardCard title="Absent" value={summary.totalAbsent} icon={UserX} colorClass="card-red" />
        <DashboardCard title="On Duty" value={summary.totalOnDuty} icon={Briefcase} colorClass="card-teal" />
        <DashboardCard title="Leave" value={summary.totalLeave} icon={CalendarClock} colorClass="card-yellow" />
        <DashboardCard title="Attendance %" value={formatPercentage(summary.attendancePercentage)} icon={Percent} colorClass="card-blue" />
      </div>

      <div className="glass-panel p-4" style={{ marginTop: '24px' }}>
        <h3 style={{ marginBottom: '16px' }}>Today's Attendance</h3>
        <AttendanceTable records={todayRecords} />
      </div>
    </div>
  );
};

export default AdminDashboard;

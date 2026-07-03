import React, { useEffect, useState } from 'react';
import dashboardService from '../../services/dashboard.service';
import DashboardCard from '../../components/DashboardCard';
import Loader from '../../components/Loader';
import { Users, Building2, UserCheck, UserX, CalendarClock, Briefcase, Percent } from 'lucide-react';
import '../../assets/styles/dashboard.css';
import { formatPercentage } from '../../utils/helpers';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await dashboardService.getSummary();
        setSummary(res.data);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) return <Loader />;
  if (error) return <div className="error-message">{error}</div>;
  if (!summary) return null;

  return (
    <div className="dashboard-container page-container">
      <div className="page-header">
        <h2>Dashboard Overview</h2>
      </div>
      
      <div className="dashboard-grid">
        <DashboardCard title="Total Employees" value={summary.totalEmployees} icon={Users} colorClass="card-blue" />
        {summary.totalDepartments > 0 && (
          <DashboardCard title="Departments" value={summary.totalDepartments} icon={Building2} colorClass="card-purple" />
        )}
        <DashboardCard title="Present" value={summary.totalPresent} icon={UserCheck} colorClass="card-green" />
        <DashboardCard title="Absent" value={summary.totalAbsent} icon={UserX} colorClass="card-red" />
        <DashboardCard title="On Duty" value={summary.totalOnDuty} icon={Briefcase} colorClass="card-orange" />
        <DashboardCard title="Leave" value={summary.totalLeave} icon={CalendarClock} colorClass="card-yellow" />
        <DashboardCard title="Attendance %" value={formatPercentage(summary.attendancePercentage)} icon={Percent} colorClass="card-teal" />
      </div>
    </div>
  );
};

export default Dashboard;

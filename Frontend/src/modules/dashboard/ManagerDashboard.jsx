import React, { useEffect, useState } from 'react';
import dashboardService from '../../services/dashboard.service';
import DashboardCard from '../../components/DashboardCard';
import Loader from '../../components/Loader';
import { Users, UserCheck, UserX, CalendarClock, Briefcase, Percent, Clock3 } from 'lucide-react';
import { formatPercentage } from '../../utils/helpers';
import AttendanceTable from '../../components/AttendanceTable';
import attendanceService from '../../services/attendance.service';
import leaveService from '../../services/leave.service';
import onDutyService from '../../services/onduty.service';
import '../../assets/styles/dashboard.css';

const ManagerDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [todayRecords, setTodayRecords] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [pendingOnDuty, setPendingOnDuty] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, attendanceRes, leavesRes, onDutyRes] = await Promise.all([
          dashboardService.getSummary(),
          attendanceService.getByDate(new Date().toISOString().split('T')[0]),
          leaveService.getAllLeaves(),
          onDutyService.getAllOnDuty()
        ]);
        setSummary(summaryRes.data);
        setTodayRecords(attendanceRes.data);
        
        setPendingLeaves(leavesRes.data?.filter(l => l.status === 'PENDING') || []);
        setPendingOnDuty(onDutyRes.data?.filter(o => o.status === 'PENDING') || []);
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
        <h2>Manager Dashboard - Team Overview</h2>
      </div>
      
      <div className="dashboard-grid">
        <DashboardCard title="Team Members" value={summary.totalEmployees} icon={Users} colorClass="card-blue" />
        <DashboardCard title="Present" value={summary.totalPresent} icon={UserCheck} colorClass="card-green" />
        <DashboardCard title="Late" value={summary.totalLate} icon={Clock3} colorClass="card-orange" />
        <DashboardCard title="Absent" value={summary.totalAbsent} icon={UserX} colorClass="card-red" />
        <DashboardCard title="On Leave" value={summary.totalLeave} icon={CalendarClock} colorClass="card-yellow" />
        <DashboardCard title="On Duty" value={summary.totalOnDuty} icon={Briefcase} colorClass="card-teal" />
      </div>

      <div className="glass-panel p-4 mt-6">
        <h3 className="mb-4">Pending Manager Approvals</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div>
             <h4 className="mb-2">Leaves ({pendingLeaves.length})</h4>
             {pendingLeaves.length === 0 ? <p className="text-gray-400">No pending leaves.</p> : (
               <ul className="space-y-2">
                 {pendingLeaves.map(l => (
                   <li key={l.id} className="p-3 bg-gray-800 rounded border border-gray-700 text-sm flex justify-between items-center">
                     <div>
                       {l.employee?.fullName} - {l.leaveType}
                       <br/><span className="text-gray-400">{l.startDate} to {l.endDate}</span>
                     </div>
                     <div className="space-x-2">
                       <button onClick={() => leaveService.updateStatus(l.id, 'MANAGER_APPROVED').then(() => window.location.reload())} className="px-2 py-1 bg-green-600 rounded">Approve</button>
                       <button onClick={() => leaveService.updateStatus(l.id, 'REJECTED').then(() => window.location.reload())} className="px-2 py-1 bg-red-600 rounded">Reject</button>
                     </div>
                   </li>
                 ))}
               </ul>
             )}
           </div>
           <div>
             <h4 className="mb-2">On Duty ({pendingOnDuty.length})</h4>
             {pendingOnDuty.length === 0 ? <p className="text-gray-400">No pending on-duty requests.</p> : (
               <ul className="space-y-2">
                 {pendingOnDuty.map(o => (
                   <li key={o.id} className="p-3 bg-gray-800 rounded border border-gray-700 text-sm flex justify-between items-center">
                     <div>
                       {o.employee?.fullName} - {o.date}
                       <br/><span className="text-gray-400">{o.location}</span>
                     </div>
                     <div className="space-x-2">
                       <button onClick={() => onDutyService.updateStatus(o.id, 'MANAGER_APPROVED').then(() => window.location.reload())} className="px-2 py-1 bg-green-600 rounded">Approve</button>
                       <button onClick={() => onDutyService.updateStatus(o.id, 'REJECTED').then(() => window.location.reload())} className="px-2 py-1 bg-red-600 rounded">Reject</button>
                     </div>
                   </li>
                 ))}
               </ul>
             )}
           </div>
        </div>
      </div>

      <div className="glass-panel p-4 mt-6">
        <h3 className="mb-4">Today's Team Attendance</h3>
        <AttendanceTable records={todayRecords} />
      </div>
    </div>
  );
};

export default ManagerDashboard;

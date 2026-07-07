import React, { useState } from 'react';
import aiService from '../../services/ai.service';
import Loader from '../../components/Loader';
import { Sparkles, User, Briefcase, Mail, Building, Clock, CalendarDays, BarChart2 } from 'lucide-react';
import '../../assets/styles/ai.css';

const AISummary = () => {
  const [employeeData, setEmployeeData] = useState(null);
  const [orgSummary, setOrgSummary] = useState('');
  const [searchName, setSearchName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateOrg = async () => {
    setLoading(true);
    setError('');
    setEmployeeData(null);
    setOrgSummary('');
    try {
      const res = await aiService.generateSummary();
      setOrgSummary(res.data.summary);
    } catch (err) {
      setError(err.message || 'Failed to generate Organization Summary');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchEmployee = async () => {
    if (!searchName.trim()) {
      setError('Please enter an employee name');
      return;
    }
    setLoading(true);
    setError('');
    setEmployeeData(null);
    setOrgSummary('');
    try {
      const res = await aiService.generateEmployeeSummary(searchName);
      setEmployeeData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to generate Employee Summary');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <h2>AI Attendance Summary</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              placeholder="Search Employee..." 
              value={searchName} 
              onChange={(e) => setSearchName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchEmployee()}
              className="form-control"
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', minWidth: '250px' }}
            />
            <button className="btn btn-primary flex-center" onClick={handleSearchEmployee} disabled={loading || !searchName}>
              Search
            </button>
          </div>
          <button className="btn btn-primary flex-center" onClick={handleGenerateOrg} disabled={loading}>
            <Sparkles className="icon mr-2" />
            {loading && !searchName ? 'Analyzing...' : 'Org Summary'}
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="ai-loading">
          <Loader />
          <p>Analyzing attendance data...</p>
        </div>
      ) : employeeData ? (
        <div className="employee-summary-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* 1. EMPLOYEE INFORMATION */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={48} color="#94a3b8" />
            </div>
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div><strong>Name:</strong> {employeeData.employee.fullName}</div>
              <div><strong>ID:</strong> {employeeData.employee.employeeId || 'N/A'}</div>
              <div><Building size={16} style={{marginRight:'4px'}}/><strong>Department:</strong> {employeeData.employee.departmentName}</div>
              <div><Briefcase size={16} style={{marginRight:'4px'}}/><strong>Designation:</strong> {employeeData.employee.designation}</div>
              <div><Mail size={16} style={{marginRight:'4px'}}/><strong>Email:</strong> {employeeData.employee.email}</div>
              <div><strong>Reporting Manager:</strong> {employeeData.employee.reportingManager}</div>
              <div><strong>Employment Status:</strong> <span className="badge badge-success">{employeeData.employee.employmentStatus}</span></div>
              <div><strong>Today's Status:</strong> <span className={`badge ${employeeData.stats.todayStatus === 'Present' ? 'badge-success' : employeeData.stats.todayStatus === 'Leave' ? 'badge-warning' : 'badge-danger'}`}>{employeeData.stats.todayStatus}</span></div>
            </div>
          </div>

          {/* 2. ATTENDANCE SUMMARY */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}><CalendarDays /> Attendance Summary</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between' }}>
              <StatCard title="Present Days" value={employeeData.stats.present} color="#10b981" />
              <StatCard title="Absent Days" value={employeeData.stats.absent} color="#ef4444" />
              <StatCard title="Late Days" value={employeeData.stats.late} color="#f59e0b" />
              <StatCard title="Leave Days" value={employeeData.stats.leave} color="#3b82f6" />
              <StatCard title="On Duty Days" value={employeeData.stats.onDuty} color="#6366f1" />
              <StatCard title="Half Day" value={employeeData.stats.halfDay} color="#8b5cf6" />
              <StatCard title="Attendance %" value={`${employeeData.stats.attendancePercentage}%`} color="#ec4899" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.02)', borderRadius: '8px' }}>
              <div><Clock size={16} /> <strong>Average Working Hours:</strong> {employeeData.stats.avgWorkingHours}</div>
              <div><Clock size={16} /> <strong>Total Working Hours:</strong> {employeeData.stats.totalWorkingHours}</div>
            </div>
          </div>

          {/* 3. MONTHLY ANALYTICS */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}><BarChart2 /> Monthly Analytics</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <AnalyticsWidget title="Current Month Attendance" value={employeeData.stats.currentMonthPresent} subtext="Present Days" />
              <AnalyticsWidget title="Late Arrival Trend" value={employeeData.stats.currentMonthLate} subtext="This Month" />
              <AnalyticsWidget title="Leave Trend" value={employeeData.stats.currentMonthLeave} subtext="This Month" />
              <AnalyticsWidget title="On Duty Trend" value={employeeData.stats.currentMonthOnDuty} subtext="This Month" />
            </div>
          </div>

          {/* 4. AI GENERATED SUMMARY */}
          <div className="glass-panel ai-result-panel" style={{ padding: '1.5rem', background: 'rgba(236, 72, 153, 0.05)', border: '1px solid rgba(236, 72, 153, 0.2)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#ec4899' }}><Sparkles /> AI Attendance Summary</h3>
            {employeeData.stats.totalWorkingDays === 0 ? (
              <p>No attendance records found.</p>
            ) : (
              <div className="markdown-content" dangerouslySetInnerHTML={{ __html: formatSummary(employeeData.aiSummary) }} />
            )}
          </div>

        </div>
      ) : orgSummary ? (
        <div className="glass-panel ai-result-panel">
          <div className="markdown-content" dangerouslySetInnerHTML={{ __html: formatSummary(orgSummary) }} />
        </div>
      ) : (
        <div className="glass-panel empty-state">
          <Sparkles size={48} className="text-muted" />
          <h3>No Summary Generated Yet</h3>
          <p>Search for an employee to view their specific attendance AI summary.</p>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, color }) => (
  <div className="stat-card" style={{ flex: 1, minWidth: '120px', background: `${color}1A`, padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
    <div style={{ fontSize: '2rem', fontWeight: 'bold', color }}>{value}</div>
    <div style={{ fontSize: '0.875rem', marginTop: '0.25rem', color: '#4b5563' }}>{title}</div>
  </div>
);

const AnalyticsWidget = ({ title, value, subtext }) => (
  <div style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff' }}>
    <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>{title}</div>
    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#334155' }}>{value}</div>
    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{subtext}</div>
  </div>
);

// Simple formatter to convert markdown-like text to basic HTML for display
const formatSummary = (text) => {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>');
};

export default AISummary;

import React, { useEffect, useState } from 'react';
import leaveService from '../../services/leave.service';
import Loader from '../../components/Loader';
import { CalendarClock } from 'lucide-react';
import '../../assets/styles/dashboard.css';

const AdminLeaveView = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const res = await leaveService.getAllLeaves();
      setLeaves(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load leaves');
    } finally {
      setLoading(false);
    }
  };

  const getApprovedBy = (l) => {
    if (l.status === 'APPROVED') return 'HR / Admin';
    if (l.status === 'MANAGER_APPROVED') return 'Department Manager';
    if (l.status === 'REJECTED') return 'Rejected';
    return '-';
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'APPROVED': return 'status-approved';
      case 'MANAGER_APPROVED': return 'status-approved';
      case 'REJECTED': return 'status-rejected';
      default: return 'status-pending';
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h2><CalendarClock size={24} style={{ display: 'inline', marginRight: '10px' }}/> View All Leaves</h2>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="glass-panel p-4">
        {leaves.length === 0 ? (
          <p className="text-gray-400">No leave requests found.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', textAlign: 'left' }}>
                  <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>Employee Name</th>
                  <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>Leave Type</th>
                  <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>Status</th>
                  <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>Approved By</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map(l => (
                  <tr key={l.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '16px' }}>{l.employee?.fullName || l.employee?.name}</td>
                    <td style={{ padding: '16px' }}>{l.leaveType}</td>
                    <td style={{ padding: '16px' }}><span className={`status-badge ${getStatusClass(l.status)}`}>{l.status}</span></td>
                    <td style={{ padding: '16px' }}>{getApprovedBy(l)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLeaveView;

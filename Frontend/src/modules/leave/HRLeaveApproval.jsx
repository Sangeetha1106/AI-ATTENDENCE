import React, { useEffect, useState } from 'react';
import leaveService from '../../services/leave.service';
import Loader from '../../components/Loader';
import { CalendarClock } from 'lucide-react';
import '../../assets/styles/dashboard.css';

const HRLeaveApproval = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const res = await leaveService.getAllLeaves();
      setLeaves(res.data?.filter(l => l.status === 'MANAGER_APPROVED') || []);
    } catch (err) {
      setError(err.message || 'Failed to load leaves');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await leaveService.updateStatus(id, status);
      fetchLeaves();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h2><CalendarClock size={24} style={{ display: 'inline', marginRight: '10px' }}/> Leave Approval</h2>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="glass-panel p-4">
        {leaves.length === 0 ? (
          <p className="text-gray-400">No leaves pending HR approval.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', textAlign: 'left' }}>
                  <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>Employee Name</th>
                  <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>Employee ID</th>
                  <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>Department</th>
                  <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>Leave Type</th>
                  <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>From Date</th>
                  <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>To Date</th>
                  <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>Reason</th>
                  <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>Manager Status</th>
                  <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map(l => (
                  <tr key={l.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '16px' }}>{l.employee?.fullName || l.employee?.name}</td>
                    <td style={{ padding: '16px' }}>{l.employee?.employeeId}</td>
                    <td style={{ padding: '16px' }}>{l.employee?.department?.departmentName || '-'}</td>
                    <td style={{ padding: '16px' }}>{l.leaveType}</td>
                    <td style={{ padding: '16px' }}>{l.startDate}</td>
                    <td style={{ padding: '16px' }}>{l.endDate}</td>
                    <td style={{ padding: '16px' }}>{l.reason}</td>
                    <td style={{ padding: '16px' }}><span className="status-badge status-approved">{l.status}</span></td>
                    <td style={{ padding: '16px' }}>
                      <button onClick={() => handleStatusChange(l.id, 'APPROVED')} className="btn btn-primary" style={{ marginRight: '8px', padding: '6px 12px' }}>Approve</button>
                      <button onClick={() => handleStatusChange(l.id, 'REJECTED')} className="btn btn-outline" style={{ borderColor: 'red', color: 'red', padding: '6px 12px' }}>Reject</button>
                    </td>
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

export default HRLeaveApproval;

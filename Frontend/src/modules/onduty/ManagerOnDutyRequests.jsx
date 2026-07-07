import React, { useEffect, useState } from 'react';
import onDutyService from '../../services/onduty.service';
import Loader from '../../components/Loader';
import { Briefcase } from 'lucide-react';
import '../../assets/styles/dashboard.css';

const ManagerOnDutyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await onDutyService.getAllOnDuty();
      setRequests(res.data?.filter(o => o.status === 'PENDING') || []);
    } catch (err) {
      setError(err.message || 'Failed to load On Duty requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await onDutyService.updateStatus(id, status);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h2><Briefcase size={24} style={{ display: 'inline', marginRight: '10px' }}/> On Duty Requests</h2>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="glass-panel p-4">
        {requests.length === 0 ? (
          <p className="text-gray-400">No pending On Duty requests for your team.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', textAlign: 'left' }}>
                  <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>Employee Name</th>
                  <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>Employee ID</th>
                  <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>Department</th>
                  <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>Date</th>
                  <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>Destination</th>
                  <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>Purpose</th>
                  <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>Applied Date</th>
                  <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>Status</th>
                  <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '16px' }}>{r.employee?.fullName || r.employee?.name}</td>
                    <td style={{ padding: '16px' }}>{r.employee?.employeeId}</td>
                    <td style={{ padding: '16px' }}>{r.employee?.department?.departmentName || '-'}</td>
                    <td style={{ padding: '16px' }}>{r.date}</td>
                    <td style={{ padding: '16px' }}>{r.location}</td>
                    <td style={{ padding: '16px' }}>{r.purpose}</td>
                    <td style={{ padding: '16px' }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '16px' }}><span className="status-badge status-pending">{r.status}</span></td>
                    <td style={{ padding: '16px' }}>
                      <button onClick={() => handleStatusChange(r.id, 'MANAGER_APPROVED')} className="btn btn-primary" style={{ marginRight: '8px', padding: '6px 12px' }}>Approve</button>
                      <button onClick={() => handleStatusChange(r.id, 'REJECTED')} className="btn btn-outline" style={{ borderColor: 'red', color: 'red', padding: '6px 12px' }}>Reject</button>
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

export default ManagerOnDutyRequests;

import React, { useState, useEffect, useContext } from 'react';
import leaveService from '../../services/leave.service';
import { AuthContext } from '../../context/AuthContext';
import { FileText } from 'lucide-react';
import Loader from '../../components/Loader';

const LeaveApply = () => {
  const { user } = useContext(AuthContext);
  const [leaves, setLeaves] = useState([]);
  const [leaveForm, setLeaveForm] = useState({ leaveType: '', startDate: '', endDate: '', reason: '' });
  const [loading, setLoading] = useState(true);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const leavesRes = await leaveService.getMyLeaves();
      setLeaves(leavesRes.data || []);
    } catch (err) {
      console.error('Failed to fetch leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.id) {
      fetchLeaves();
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await leaveService.applyLeave(leaveForm);
      alert("Leave application submitted successfully!");
      setLeaveForm({ leaveType: '', startDate: '', endDate: '', reason: '' });
      fetchLeaves();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="page-container">
      <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <h3 style={{ marginTop: '0', color: '#1e293b', fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
          <FileText size={24} color="#f59e0b" /> Leave Request
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px', marginTop: '24px' }}>
          <div>
            <h4 style={{ color: '#334155', marginBottom: '16px' }}>Apply for Leave</h4>
            <form className="standard-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Leave Type</label>
                <input 
                  type="text" 
                  placeholder="e.g., Sick Leave, Casual Leave" 
                  required 
                  minLength="3"
                  maxLength="50"
                  value={leaveForm.leaveType} 
                  onChange={e => setLeaveForm({...leaveForm, leaveType: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label>From Date</label>
                <input type="date" required value={leaveForm.startDate} onChange={e => setLeaveForm({...leaveForm, startDate: e.target.value})} />
              </div>
              <div className="form-group">
                <label>To Date</label>
                <input type="date" required value={leaveForm.endDate} onChange={e => setLeaveForm({...leaveForm, endDate: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Reason</label>
                <textarea rows="3" required value={leaveForm.reason} onChange={e => setLeaveForm({...leaveForm, reason: e.target.value})}></textarea>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Submit Leave Request</button>
            </form>
          </div>
          
          <div>
            <h4 style={{ color: '#334155', marginBottom: '16px' }}>Leave History</h4>
            {leaves.length === 0 ? (
              <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '8px', textAlign: 'center', color: '#64748b' }}>
                No past leave records found.
              </div>
            ) : (
              <div style={{ overflowX: 'auto', maxHeight: '400px' }}>
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f8fafc', zIndex: 1 }}>
                    <tr>
                      <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '13px', textTransform: 'uppercase' }}>Application Date</th>
                      <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '13px', textTransform: 'uppercase' }}>Leave Type</th>
                      <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '13px', textTransform: 'uppercase' }}>From Date</th>
                      <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '13px', textTransform: 'uppercase' }}>To Date</th>
                      <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '13px', textTransform: 'uppercase' }}>Reason</th>
                      <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '13px', textTransform: 'uppercase' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaves.map(l => (
                      <tr key={l.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '12px', fontSize: '14px' }}>{new Date(l.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: '12px', fontSize: '14px', fontWeight: '500' }}>{l.leaveType}</td>
                        <td style={{ padding: '12px', fontSize: '14px' }}>{l.startDate}</td>
                        <td style={{ padding: '12px', fontSize: '14px' }}>{l.endDate}</td>
                        <td style={{ padding: '12px', fontSize: '14px', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={l.reason}>{l.reason}</td>
                        <td style={{ padding: '12px' }}><span className={`status-badge status-${l.status.toLowerCase()}`}>{l.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
               <div style={{ flex: 1, background: '#fffbeb', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
                 <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#b45309', fontWeight: 'bold' }}>Pending</div>
                 <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#92400e' }}>{leaves.filter(l => l.status === 'PENDING').length}</div>
               </div>
               <div style={{ flex: 1, background: '#f0fdf4', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #22c55e' }}>
                 <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#166534', fontWeight: 'bold' }}>Approved</div>
                 <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#15803d' }}>{leaves.filter(l => l.status === 'APPROVED' || l.status === 'MANAGER_APPROVED').length}</div>
               </div>
               <div style={{ flex: 1, background: '#fef2f2', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
                 <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#991b1b', fontWeight: 'bold' }}>Rejected</div>
                 <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#b91c1c' }}>{leaves.filter(l => l.status === 'REJECTED').length}</div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveApply;

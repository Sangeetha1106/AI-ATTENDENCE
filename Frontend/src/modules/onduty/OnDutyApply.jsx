import React, { useState, useEffect, useContext } from 'react';
import onDutyService from '../../services/onduty.service';
import { AuthContext } from '../../context/AuthContext';
import { Briefcase } from 'lucide-react';
import Loader from '../../components/Loader';

const OnDutyApply = () => {
  const { user } = useContext(AuthContext);
  const [onDutys, setOnDutys] = useState([]);
  const [onDutyForm, setOnDutyForm] = useState({ date: '', purpose: '', location: '', details: '' });
  const [loading, setLoading] = useState(true);

  const fetchOnDutys = async () => {
    try {
      setLoading(true);
      const onDutysRes = await onDutyService.getMyOnDuty();
      setOnDutys(onDutysRes.data || []);
    } catch (err) {
      console.error('Failed to fetch on duty requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.id) {
      fetchOnDutys();
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onDutyService.applyOnDuty(onDutyForm);
      alert("On Duty application submitted successfully!");
      setOnDutyForm({ date: '', purpose: '', location: '', details: '' });
      fetchOnDutys();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="page-container">
      <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <h3 style={{ marginTop: '0', color: '#1e293b', fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
          <Briefcase size={24} color="#8b5cf6" /> On Duty Request
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px', marginTop: '24px' }}>
          <div>
            <h4 style={{ color: '#334155', marginBottom: '16px' }}>Apply On Duty</h4>
            <form className="standard-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>On Duty Date</label>
                <input type="date" required value={onDutyForm.date} onChange={e => setOnDutyForm({...onDutyForm, date: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Purpose of Visit</label>
                <input type="text" placeholder="e.g. Client Meeting, Site Visit" required value={onDutyForm.purpose} onChange={e => setOnDutyForm({...onDutyForm, purpose: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Destination / Location</label>
                <input type="text" placeholder="e.g. Downtown Office" required value={onDutyForm.location} onChange={e => setOnDutyForm({...onDutyForm, location: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Reason</label>
                <textarea rows="3" required value={onDutyForm.details} onChange={e => setOnDutyForm({...onDutyForm, details: e.target.value})}></textarea>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', backgroundColor: '#8b5cf6', borderColor: '#8b5cf6' }}>Submit On Duty Request</button>
            </form>
          </div>
          
          <div>
            <h4 style={{ color: '#334155', marginBottom: '16px' }}>On Duty History</h4>
            {onDutys.length === 0 ? (
              <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '8px', textAlign: 'center', color: '#64748b' }}>
                No past On Duty records found.
              </div>
            ) : (
              <div style={{ overflowX: 'auto', maxHeight: '400px' }}>
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f8fafc', zIndex: 1 }}>
                    <tr>
                      <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '13px', textTransform: 'uppercase' }}>Application Date</th>
                      <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '13px', textTransform: 'uppercase' }}>On Duty Date</th>
                      <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '13px', textTransform: 'uppercase' }}>Destination</th>
                      <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '13px', textTransform: 'uppercase' }}>Purpose</th>
                      <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '13px', textTransform: 'uppercase' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {onDutys.map(o => (
                      <tr key={o.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '12px', fontSize: '14px' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: '12px', fontSize: '14px', fontWeight: '500' }}>{o.date}</td>
                        <td style={{ padding: '12px', fontSize: '14px' }}>{o.location}</td>
                        <td style={{ padding: '12px', fontSize: '14px' }}>{o.purpose}</td>
                        <td style={{ padding: '12px' }}><span className={`status-badge status-${o.status.toLowerCase()}`}>{o.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
               <div style={{ flex: 1, background: '#fffbeb', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
                 <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#b45309', fontWeight: 'bold' }}>Pending</div>
                 <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#92400e' }}>{onDutys.filter(o => o.status === 'PENDING').length}</div>
               </div>
               <div style={{ flex: 1, background: '#f0fdf4', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #22c55e' }}>
                 <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#166534', fontWeight: 'bold' }}>Approved</div>
                 <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#15803d' }}>{onDutys.filter(o => o.status === 'APPROVED' || o.status === 'MANAGER_APPROVED').length}</div>
               </div>
               <div style={{ flex: 1, background: '#fef2f2', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
                 <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#991b1b', fontWeight: 'bold' }}>Rejected</div>
                 <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#b91c1c' }}>{onDutys.filter(o => o.status === 'REJECTED').length}</div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnDutyApply;

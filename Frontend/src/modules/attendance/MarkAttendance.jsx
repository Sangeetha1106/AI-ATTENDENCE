import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import attendanceService from '../../services/attendance.service';
import employeeService from '../../services/employee.service';

const MarkAttendance = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    employeeId: '',
    departmentId: '', // Automatically populated based on selected employee
    attendanceDate: new Date().toISOString().split('T')[0],
    status: 'PRESENT',
    remarks: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await employeeService.getAll();
        setEmployees(res.data);
        if (res.data.length > 0) {
          setFormData(prev => ({ 
            ...prev, 
            employeeId: res.data[0].id,
            departmentId: res.data[0].departmentId 
          }));
        }
      } catch (err) {
        setError('Failed to load employees');
      }
    };
    fetchEmployees();
  }, []);

  const handleChange = (e) => {
    if (e.target.name === 'employeeId') {
      const selectedEmp = employees.find(emp => emp.id === parseInt(e.target.value));
      setFormData({ 
        ...formData, 
        employeeId: e.target.value,
        departmentId: selectedEmp?.departmentId || ''
      });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      await attendanceService.mark(formData);
      setSuccessMsg('Attendance marked successfully!');
      // Reset form but keep date
      setFormData({ ...formData, status: 'PRESENT', remarks: '' });
    } catch (err) {
      setError(err.message || 'Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Mark Attendance</h2>
      </div>
      
      <div className="form-container glass-panel">
        {error && <div className="error-message">{error}</div>}
        {successMsg && <div className="success-message">{successMsg}</div>}
        
        <form onSubmit={handleSubmit} className="standard-form">
          <div className="form-group">
            <label>Employee</label>
            <select name="employeeId" value={formData.employeeId} onChange={handleChange} required>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.fullName} ({emp.employeeId})</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Date</label>
            <input type="date" name="attendanceDate" value={formData.attendanceDate} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleChange} required>
              <option value="PRESENT">Present</option>
              <option value="ABSENT">Absent</option>
              <option value="ON_DUTY">On Duty</option>
              <option value="LEAVE">Leave</option>
            </select>
          </div>

          <div className="form-group">
            <label>Remarks</label>
            <input type="text" name="remarks" value={formData.remarks} onChange={handleChange} />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Mark Attendance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MarkAttendance;

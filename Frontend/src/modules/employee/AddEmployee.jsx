import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import employeeService from '../../services/employee.service';
import departmentService from '../../services/department.service';

const AddEmployee = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    fullName: '',
    employeeId: '',
    email: '',
    phone: '',
    gender: 'MALE',
    designation: '',
    departmentId: '',
    joiningDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await departmentService.getAll();
        setDepartments(res.data);
        if (res.data.length > 0) {
          setFormData(prev => ({ ...prev, departmentId: res.data[0].id }));
        }
      } catch (err) {
        console.error("Failed to load departments", err);
      }
    };
    fetchDepts();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await employeeService.add(formData);
      if (res.message) {
        alert(res.message);
      } else {
        alert('Employee created successfully.');
      }
      navigate('/employees');
    } catch (err) {
      setError(err.message || 'Failed to add employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Add New Employee</h2>
      </div>
      
      <div className="form-container glass-panel">
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="standard-form">
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
          </div>
          
          <div className="form-group">
            <label>Employee ID</label>
            <input type="text" name="employeeId" value={formData.employeeId} onChange={handleChange} required placeholder="e.g., EMP001" />
          </div>
          
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Gender</label>
            <select name="gender" value={formData.gender} onChange={handleChange}>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Designation</label>
            <input type="text" name="designation" value={formData.designation} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Department</label>
            <select name="departmentId" value={formData.departmentId} onChange={handleChange} required>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.departmentName}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Joining Date</label>
            <input type="date" name="joiningDate" value={formData.joiningDate} onChange={handleChange} required />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/employees')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Add Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployee;

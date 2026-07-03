import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import departmentService from '../../services/department.service';

const AddDepartment = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    departmentName: '',
    departmentCode: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await departmentService.add(formData);
      navigate('/departments');
    } catch (err) {
      setError(err.message || 'Failed to add department');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Add New Department</h2>
      </div>
      
      <div className="form-container glass-panel">
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="standard-form">
          <div className="form-group">
            <label>Department Name</label>
            <input type="text" name="departmentName" value={formData.departmentName} onChange={handleChange} required />
          </div>
          
          <div className="form-group">
            <label>Department Code</label>
            <input type="text" name="departmentCode" value={formData.departmentCode} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange}></textarea>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/departments')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Add Department'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDepartment;

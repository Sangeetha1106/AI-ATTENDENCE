import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import employeeService from '../../services/employee.service';
import Loader from '../../components/Loader';
import { formatDate } from '../../utils/helpers';

const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await employeeService.getById(id);
        setEmployee(res.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch employee details');
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id]);

  const toggleStatus = async () => {
    try {
      const newStatus = employee.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await employeeService.updateStatus(id, newStatus);
      setEmployee({ ...employee, status: newStatus });
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  if (loading) return <Loader />;
  if (error) return <div className="error-message">{error}</div>;
  if (!employee) return null;

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Employee Profile: {employee.fullName}</h2>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>Back</button>
      </div>

      <div className="profile-card glass-panel">
        <div className="profile-info grid-2">
          <div className="info-group">
            <label>Employee ID</label>
            <p>{employee.employeeId}</p>
          </div>
          <div className="info-group">
            <label>Status</label>
            <p>
              <span className={`status-badge status-${employee.status.toLowerCase()}`}>{employee.status}</span>
              <button className="btn btn-small ml-2" onClick={toggleStatus}>Toggle Status</button>
            </p>
          </div>
          <div className="info-group">
            <label>Email</label>
            <p>{employee.email}</p>
          </div>
          <div className="info-group">
            <label>Phone</label>
            <p>{employee.phone || '-'}</p>
          </div>
          <div className="info-group">
            <label>Department</label>
            <p>{employee.department?.departmentName || '-'}</p>
          </div>
          <div className="info-group">
            <label>Designation</label>
            <p>{employee.designation || '-'}</p>
          </div>
          <div className="info-group">
            <label>Gender</label>
            <p>{employee.gender}</p>
          </div>
          <div className="info-group">
            <label>Joining Date</label>
            <p>{formatDate(employee.joiningDate)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetails;

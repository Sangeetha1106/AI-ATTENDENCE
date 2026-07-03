import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import employeeService from '../../services/employee.service';
import Loader from '../../components/Loader';
import '../../assets/styles/employee.css';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await employeeService.getAll();
      setEmployees(res.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Employee Directory</h2>
        <Link to="/employees/add" className="btn btn-primary">Add Employee</Link>
      </div>
      
      {error && <div className="error-message">{error}</div>}

      <div className="table-container glass-panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => (
              <tr key={emp.id}>
                <td>{emp.employeeId}</td>
                <td>{emp.fullName}</td>
                <td>{emp.email}</td>
                <td>{emp.department?.departmentName || '-'}</td>
                <td><span className={`status-badge status-${emp.status.toLowerCase()}`}>{emp.status}</span></td>
                <td>
                  <Link to={`/employees/${emp.id}`} className="btn-link">View</Link>
                </td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr><td colSpan="6" className="text-center">No employees found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeList;

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import departmentService from '../../services/department.service';
import Loader from '../../components/Loader';

const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await departmentService.getAll();
      setDepartments(res.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Departments</h2>
        <Link to="/departments/add" className="btn btn-primary">Add Department</Link>
      </div>
      
      {error && <div className="error-message">{error}</div>}

      <div className="table-container glass-panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {departments.map(dept => (
              <tr key={dept.id}>
                <td>{dept.departmentCode}</td>
                <td>{dept.departmentName}</td>
                <td><span className={`status-badge status-${dept.status.toLowerCase()}`}>{dept.status}</span></td>
              </tr>
            ))}
            {departments.length === 0 && (
              <tr><td colSpan="3" className="text-center">No departments found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DepartmentList;

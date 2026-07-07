import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import employeeService from '../../services/employee.service';
import departmentService from '../../services/department.service';
import Loader from '../../components/Loader';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import '../../assets/styles/employee.css';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination & Filters State
  const [page, setPage] = useState(1);
  const limit = 10;
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [status, setStatus] = useState('');
  const [designation, setDesignation] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEmployees();
    }, 300);
    return () => clearTimeout(timer);
  }, [page, search, departmentId, status, designation]);

  const fetchDepartments = async () => {
    try {
      const res = await departmentService.getAll();
      setDepartments(res.data || []);
    } catch (err) {
      console.error('Failed to fetch departments', err);
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        search: search || undefined,
        department: departmentId || undefined,
        status: status || undefined,
        designation: designation || undefined
      };
      const res = await employeeService.getAll(params);
      
      setEmployees(res.employees || res.data || []);
      setTotalEmployees(res.totalEmployees || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      setError(err.message || 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(1); // Reset to first page on filter change
  };

  // Pagination Controls
  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const handlePageClick = (pageNum) => {
    setPage(pageNum);
  };

  const renderPagination = () => {
    const pages = [];
    let startPage = Math.max(1, page - 2);
    let endPage = Math.min(totalPages, page + 2);

    if (endPage - startPage < 4) {
      if (startPage === 1) endPage = Math.min(totalPages, 5);
      else if (endPage === totalPages) startPage = Math.max(1, totalPages - 4);
    }

    if (startPage > 1) {
      pages.push(
        <button key="1" className="pagination-btn" onClick={() => handlePageClick(1)}>1</button>
      );
      if (startPage > 2) {
        pages.push(<span key="dots-start" className="pagination-dots">...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button 
          key={i} 
          className={`pagination-btn ${page === i ? 'active' : ''}`} 
          onClick={() => handlePageClick(i)}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="dots-end" className="pagination-dots">...</span>);
      }
      pages.push(
        <button key={totalPages} className="pagination-btn" onClick={() => handlePageClick(totalPages)}>{totalPages}</button>
      );
    }

    return pages;
  };

  const startRecord = totalEmployees === 0 ? 0 : (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, totalEmployees);

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Employee Directory</h2>
        <Link to="/employees/add" className="btn btn-primary">Add Employee</Link>
      </div>
      
      {error && <div className="error-message">{error}</div>}

      <div className="filters-container glass-panel" style={{ padding: '16px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
        <div className="search-box" style={{ flex: '1 1 250px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text" 
            className="filter-input"
            placeholder="Search by Name, Email or ID..." 
            value={search}
            onChange={handleFilterChange(setSearch)}
            style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid var(--surface-border)' }}
          />
        </div>
        
        <div className="filter-group" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <select 
            className="filter-input"
            value={departmentId} 
            onChange={handleFilterChange(setDepartmentId)}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--surface-border)', cursor: 'pointer' }}
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.departmentName}</option>
            ))}
          </select>

          <select 
            className="filter-input"
            value={status} 
            onChange={handleFilterChange(setStatus)}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--surface-border)', cursor: 'pointer' }}
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          <input 
            type="text" 
            className="filter-input"
            placeholder="Designation..." 
            value={designation}
            onChange={handleFilterChange(setDesignation)}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--surface-border)' }}
          />
        </div>
      </div>

      <div className="table-container glass-panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="text-center" style={{ padding: '2rem' }}><Loader /></td></tr>
            ) : employees.length === 0 ? (
              <tr><td colSpan="7" className="text-center" style={{ padding: '2rem', color: '#94a3b8' }}>No Employees Found</td></tr>
            ) : (
              employees.map(emp => (
                <tr key={emp.id}>
                  <td>{emp.employeeId}</td>
                  <td>{emp.fullName}</td>
                  <td>{emp.email}</td>
                  <td>{emp.department?.departmentName || '-'}</td>
                  <td>{emp.designation || '-'}</td>
                  <td><span className={`status-badge status-${emp.status.toLowerCase()}`}>{emp.status}</span></td>
                  <td>
                    <Link to={`/employees/${emp.id}`} className="btn-link">View</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!loading && totalEmployees > 0 && (
          <div className="pagination-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid var(--surface-border)', flexWrap: 'wrap', gap: '16px' }}>
            <div className="pagination-info" style={{ color: '#94a3b8', fontSize: '14px' }}>
              Showing {startRecord}–{endRecord} of {totalEmployees} Employees
            </div>
            <div className="pagination-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button 
                className="pagination-arrow" 
                onClick={handlePrevPage} 
                disabled={page === 1}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', border: 'none', color: page === 1 ? '#475569' : '#3b82f6', cursor: page === 1 ? 'not-allowed' : 'pointer', fontWeight: '500' }}
              >
                <ChevronLeft size={16} /> Previous
              </button>
              
              <div className="pagination-numbers" style={{ display: 'flex', gap: '6px' }}>
                {renderPagination()}
              </div>

              <button 
                className="pagination-arrow" 
                onClick={handleNextPage} 
                disabled={page === totalPages}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', border: 'none', color: page === totalPages ? '#475569' : '#3b82f6', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontWeight: '500' }}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeList;

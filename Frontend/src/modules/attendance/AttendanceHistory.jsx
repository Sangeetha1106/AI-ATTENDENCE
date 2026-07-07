import React, { useEffect, useState, useContext, useCallback } from 'react';
import attendanceService from '../../services/attendance.service';
import departmentService from '../../services/department.service';
import Loader from '../../components/Loader';
import AttendanceTable from '../../components/AttendanceTable';
import { AuthContext } from '../../context/AuthContext';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import '../../assets/styles/dashboard.css'; // Or any relevant css

const AttendanceHistory = () => {
  const { user } = useContext(AuthContext);
  const isAdminView = user?.role !== 'EMPLOYEE';

  const [records, setRecords] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination & Filtering State
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const [filters, setFilters] = useState({
    date: '',
    department: '',
    status: ''
  });

  const [sortConfig, setSortConfig] = useState({
    field: 'Date',
    order: 'DESC'
  });

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // reset to page 1 on search
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch departments for filter
  useEffect(() => {
    if (isAdminView) {
      departmentService.getAll().then(res => setDepartments(res.data || [])).catch(console.error);
    }
  }, [isAdminView]);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      if (user.role === 'EMPLOYEE') {
        const res = await attendanceService.getByEmployee(user.id);
        setRecords(res.data || res);
        setTotalRecords((res.data || res).length);
      } else {
        const params = {
          page,
          limit,
          search: debouncedSearch,
          date: filters.date,
          department: filters.department,
          status: filters.status,
          sortField: sortConfig.field,
          sortOrder: sortConfig.order
        };
        const res = await attendanceService.getAll(params);
        // The backend returns { rows, count } now
        setRecords(res.data?.rows || []);
        setTotalRecords(res.data?.count || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch attendance history');
    } finally {
      setLoading(false);
    }
  }, [user, page, limit, debouncedSearch, filters, sortConfig]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1); // reset to page 1 on filter change
  };

  const handleSort = (field) => {
    setSortConfig(prev => ({
      field,
      order: prev.field === field && prev.order === 'ASC' ? 'DESC' : 'ASC'
    }));
  };

  // Pagination helpers
  const totalPages = Math.ceil(totalRecords / limit) || 1;
  const startRecord = (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, totalRecords);

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <h2>{user.role === 'EMPLOYEE' ? 'My Attendance History' : 'Attendance Management'}</h2>
      </div>
      
      {error && <div className="error-message">{error}</div>}

      {isAdminView && (
        <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', backgroundColor: '#f1f5f9', padding: '8px 16px', borderRadius: '8px' }}>
            <Search size={20} color="#64748b" />
            <input 
              type="text" 
              placeholder="🔍 Search by Employee Name, Employee ID, Email, Department..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: 'none', background: 'transparent', flex: 1, outline: 'none', fontSize: '15px' }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontWeight: '500' }}>
              <Filter size={18} /> Filters:
            </div>
            
            <input 
              type="date" 
              name="date"
              value={filters.date}
              onChange={handleFilterChange}
              style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }}
            />
            
            <select 
              name="department" 
              value={filters.department} 
              onChange={handleFilterChange}
              style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }}
            >
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.departmentName}</option>
              ))}
            </select>
            
            <select 
              name="status" 
              value={filters.status} 
              onChange={handleFilterChange}
              style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }}
            >
              <option value="">All Statuses</option>
              <option value="PRESENT">Present</option>
              <option value="ABSENT">Absent</option>
              <option value="LATE">Late</option>
              <option value="ON_DUTY">On Duty</option>
              <option value="LEAVE">Leave</option>
            </select>
            
            <button 
              onClick={() => { setFilters({ date: '', department: '', status: '' }); setSearch(''); setPage(1); setSortConfig({field: 'Date', order: 'DESC'}); }} 
              className="btn btn-outline" 
              style={{ padding: '8px 12px' }}>
              Clear Filters
            </button>
          </div>
        </div>
      )}

      <div className="glass-panel p-4">
        {loading && <Loader />}
        
        {!loading && (
          <>
            <AttendanceTable 
              records={records} 
              onSort={isAdminView ? handleSort : undefined} 
              sortField={sortConfig.field} 
              sortOrder={sortConfig.order} 
            />
            
            {isAdminView && totalRecords > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b', fontSize: '14px' }}>
                  Showing {startRecord}–{endRecord} of {totalRecords} records
                </span>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn btn-outline"
                    style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <ChevronLeft size={16} /> Previous
                  </button>
                  <button 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="btn btn-outline"
                    style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AttendanceHistory;

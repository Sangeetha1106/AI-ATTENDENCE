import React, { useEffect, useState, useContext } from 'react';
import attendanceService from '../../services/attendance.service';
import Loader from '../../components/Loader';
import AttendanceTable from '../../components/AttendanceTable';
import { AuthContext } from '../../context/AuthContext';

const AttendanceHistory = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      let res;
      if (user.role === 'EMPLOYEE') {
        res = await attendanceService.getByEmployee(user.id);
      } else {
        res = await attendanceService.getAll();
      }
      // The service for employee returns array, getAll returns object or array. Handle properly.
      setRecords(res.data || res);
    } catch (err) {
      setError(err.message || 'Failed to fetch attendance history');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>{user.role === 'EMPLOYEE' ? 'My Attendance History' : 'Global Attendance History'}</h2>
      </div>
      
      {error && <div className="error-message">{error}</div>}

      <div className="glass-panel p-4">
        <AttendanceTable records={records} />
      </div>
    </div>
  );
};

export default AttendanceHistory;

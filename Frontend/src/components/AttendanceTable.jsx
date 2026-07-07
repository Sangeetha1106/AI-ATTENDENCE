import React, { useContext } from 'react';
import { formatDate } from '../utils/helpers';
import { AuthContext } from '../context/AuthContext';

import { ArrowUp, ArrowDown } from 'lucide-react';

const AttendanceTable = ({ records, onSort, sortField, sortOrder }) => {
  const { user } = useContext(AuthContext);
  const isAdminView = user?.role !== 'EMPLOYEE';

  if (!records || records.length === 0) {
    return <p className="text-gray-400">No attendance records found.</p>;
  }

  const renderSortIcon = (field) => {
    if (sortField !== field) return <span style={{ opacity: 0.3, marginLeft: '4px' }}>↕</span>;
    return sortOrder === 'ASC' ? <ArrowUp size={14} style={{ display: 'inline', marginLeft: '4px' }} /> : <ArrowDown size={14} style={{ display: 'inline', marginLeft: '4px' }} />;
  };

  const handleSort = (field) => {
    if (onSort) onSort(field);
  };

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('Date')} style={{ cursor: 'pointer' }}>Date {isAdminView && renderSortIcon('Date')}</th>
            {isAdminView && <th onClick={() => handleSort('EmployeeName')} style={{ cursor: 'pointer' }}>Employee Name {renderSortIcon('EmployeeName')}</th>}
            {isAdminView && <th>Employee ID</th>}
            {isAdminView && <th onClick={() => handleSort('Department')} style={{ cursor: 'pointer' }}>Department {renderSortIcon('Department')}</th>}
            {isAdminView && <th>Designation</th>}
            <th onClick={() => handleSort('Status')} style={{ cursor: 'pointer' }}>Status {isAdminView && renderSortIcon('Status')}</th>
            <th>Check In</th>
            <th>Check Out</th>
            {isAdminView && <th>Location Status</th>}
            {isAdminView && <th>Working Hours</th>}
          </tr>
        </thead>
        <tbody>
          {records.map(record => (
            <tr key={record.id}>
              <td>{formatDate(record.attendanceDate)}</td>
              {isAdminView && <td>{record.employee?.fullName}</td>}
              {isAdminView && <td>{record.employee?.employeeId}</td>}
              {isAdminView && <td>{record.department?.departmentName || 'N/A'}</td>}
              {isAdminView && <td>{record.employee?.designation || 'N/A'}</td>}
              <td>
                <span className={`status-badge status-${record.status?.toLowerCase() || 'unknown'}`}>
                  {record.status}
                </span>
              </td>
              <td>{record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : '-'}</td>
              <td>{record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : '-'}</td>
              {isAdminView && (
                <td>
                  <span style={{ fontWeight: '600', color: record.locationStatus === 'INSIDE' ? '#22c55e' : (record.locationStatus === 'OUTSIDE' ? '#ef4444' : '#94a3b8') }}>
                    {record.locationStatus ? (record.locationStatus === 'INSIDE' ? 'Inside Office' : 'Outside Office') : '-'}
                  </span>
                </td>
              )}
              {isAdminView && <td>{record.workingHours || '-'}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceTable;

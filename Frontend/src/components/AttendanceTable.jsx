import React from 'react';
import { formatDate } from '../utils/helpers';

const AttendanceTable = ({ records }) => {
  if (!records || records.length === 0) {
    return <p className="no-data">No attendance records found.</p>;
  }

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Employee</th>
            <th>Department</th>
            <th>Status</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {records.map(record => (
            <tr key={record.id}>
              <td>{formatDate(record.attendanceDate)}</td>
              <td>{record.employee?.fullName} ({record.employee?.employeeId})</td>
              <td>{record.department?.departmentName || 'N/A'}</td>
              <td>
                <span className={`status-badge status-${record.status.toLowerCase()}`}>
                  {record.status}
                </span>
              </td>
              <td>{record.remarks || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceTable;

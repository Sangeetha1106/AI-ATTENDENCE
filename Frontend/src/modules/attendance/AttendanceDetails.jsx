import React from 'react';

const AttendanceDetails = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Attendance Details</h2>
      </div>
      <div className="glass-panel p-4">
        <p>Details view is read-only. Edit and Delete features are disabled as per business rules.</p>
      </div>
    </div>
  );
};

export default AttendanceDetails;

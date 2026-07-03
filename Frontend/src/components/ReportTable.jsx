import React from 'react';
import AttendanceTable from './AttendanceTable';

const ReportTable = ({ report }) => {
  if (!report) return null;

  return (
    <div className="report-table-wrapper">
      <div className="report-header">
        <h3>{report.reportType} Report</h3>
        <div className="report-meta">
          {report.date && <span>Date: {report.date}</span>}
          {report.month && <span>Month: {report.month}/{report.year}</span>}
          {!report.month && !report.date && report.year && <span>Year: {report.year}</span>}
          <span className="total-records">Total Records: {report.totalRecords}</span>
        </div>
      </div>
      <AttendanceTable records={report.records} />
    </div>
  );
};

export default ReportTable;

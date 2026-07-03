import React, { useState, useEffect } from 'react';
import reportService from '../../services/report.service';
import ReportTable from '../../components/ReportTable';
import Loader from '../../components/Loader';

const DailyReport = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await reportService.getDaily(date);
      setReport(res.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Daily Attendance Report</h2>
      </div>

      <div className="filter-card glass-panel">
        <div className="form-group row">
          <label>Select Date:</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <button className="btn btn-primary ml-4" onClick={fetchReport}>Generate Report</button>
        </div>
      </div>

      {loading ? <Loader /> : error ? <div className="error-message">{error}</div> : (
        <div className="glass-panel p-4 mt-4">
          <ReportTable report={report} />
        </div>
      )}
    </div>
  );
};

export default DailyReport;

import React, { useState } from 'react';
import aiService from '../../services/ai.service';
import Loader from '../../components/Loader';
import { Sparkles } from 'lucide-react';
import '../../assets/styles/ai.css';

const AISummary = () => {
  const [summary, setSummary] = useState('');
  const [searchName, setSearchName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setSummary('');
    try {
      const res = await aiService.generateSummary();
      setSummary(res.data.summary);
    } catch (err) {
      setError(err.message || 'Failed to generate AI Summary');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchEmployee = async () => {
    if (!searchName.trim()) {
      setError('Please enter an employee name');
      return;
    }
    setLoading(true);
    setError('');
    setSummary('');
    try {
      const res = await aiService.generateEmployeeSummary(searchName);
      setSummary(res.data.summary);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to generate Employee Summary');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <h2>AI Attendance Summary</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              placeholder="Search Employee..." 
              value={searchName} 
              onChange={(e) => setSearchName(e.target.value)}
              className="form-control"
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <button className="btn btn-primary flex-center" onClick={handleSearchEmployee} disabled={loading || !searchName}>
              Search
            </button>
          </div>
          <button className="btn btn-primary flex-center" onClick={handleGenerate} disabled={loading}>
            <Sparkles className="icon mr-2" />
            {loading ? 'Analyzing Data...' : 'Org Summary'}
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="ai-loading">
          <Loader />
          <p>Google Gemini is analyzing your organization's attendance trends...</p>
        </div>
      ) : summary ? (
        <div className="glass-panel ai-result-panel">
          <div className="markdown-content" dangerouslySetInnerHTML={{ __html: formatSummary(summary) }} />
        </div>
      ) : (
        <div className="glass-panel empty-state">
          <Sparkles size={48} className="text-muted" />
          <h3>No Summary Generated Yet</h3>
          <p>Click the button above to analyze your workforce attendance data using AI.</p>
        </div>
      )}
    </div>
  );
};

// Simple formatter to convert markdown-like text to basic HTML for display
const formatSummary = (text) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>');
};

export default AISummary;

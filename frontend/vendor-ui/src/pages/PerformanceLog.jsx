import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const METRICS = ['DELIVERY_TIME', 'QUALITY_SCORE', 'COMPLIANCE_SCORE'];

const ScoreBar = ({ score }) => {
  const pct   = (score / 10) * 100;
  const color = score >= 8 ? '#10b981' : score >= 5 ? '#f59e0b' : '#ef4444';
  return (
    <div className="score-meter">
      <div className="score-bar"><div className="score-fill" style={{ width: `${pct}%`, background: color }} /></div>
      <span className="fw-700 text-sm" style={{ color, minWidth: 20 }}>{score}</span>
    </div>
  );
};

const PerformanceLog = () => {
  const [logs, setLogs]     = useState([]);
  const [showForm, setShow] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');
  const [form, setForm]     = useState({ vendorId: '', metric: 'DELIVERY_TIME', score: '', remarks: '' });
  const [msg, setMsg]       = useState('');
  const role     = localStorage.getItem('role');
  const canLog   = ['ADMIN', 'PROCUREMENT_OFFICER', 'FINANCE_TEAM'].includes(role);

  const fetchLogs = async () => {
    setLoading(true); setError('');
    try {
      const r = await api.get('/vendors/performance');
      setLogs(r.data || []);
    } catch {
      console.error('Failed to fetch from backend.');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/vendors/performance', form);
      fetchLogs();
      setMsg(' Performance evaluation submitted successfully.');
    } catch {
      setMsg(' Failed to submit. Ensure vendor ID is valid.');
    }
    setShow(false);
    setForm({ vendorId: '', metric: 'DELIVERY_TIME', score: '', remarks: '' });
  };

  // Aggregate per vendor
  const vendorSummary = logs.reduce((acc, log) => {
    const key = log.companyName || `Vendor #${log.vendorId}`;
    if (!acc[key]) acc[key] = { total: 0, count: 0 };
    acc[key].total += log.score;
    acc[key].count++;
    return acc;
  }, {});

  const filtered = logs.filter(l => filter === 'ALL' || l.metric === filter);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Performance Logs</div>
          <div className="page-subtitle">Score vendors on Delivery, Quality & Compliance (1–10)</div>
        </div>
        {canLog && (
          <button className="btn btn-primary" onClick={() => setShow(!showForm)}>
            {showForm ? '✕ Cancel' : '+ Add Evaluation'}
          </button>
        )}
      </div>

      {msg   && <div className={`alert ${msg.startsWith('') ? 'alert-success' : 'alert-danger'}`}>{msg}</div>}
      {error && <div className="alert alert-warning">{error}</div>}

      {/* Vendor summary cards */}
      {Object.keys(vendorSummary).length > 0 && (
        <div className="grid grid-3 gap-4 mb-6">
          {Object.entries(vendorSummary).map(([name, data]) => {
            const avg = (data.total / data.count).toFixed(1);
            return (
              <div className="stat-card" key={name}>
                <div className="fw-700 mb-2">{name}</div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-muted text-xs">Avg Score</span>
                  <span className="fw-700 text-lg" style={{ color: avg >= 8 ? '#10b981' : avg >= 5 ? '#f59e0b' : '#ef4444' }}>{avg}/10</span>
                </div>
                <ScoreBar score={parseFloat(avg)} />
                <div className="text-xs text-muted mt-2">{data.count} evaluations</div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="card mb-4">
          <div className="card-title mb-4">New Performance Evaluation</div>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Vendor ID *</label>
                <input type="number" className="form-input" value={form.vendorId} onChange={e => setForm(p => ({...p, vendorId: e.target.value}))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Metric *</label>
                <select className="form-select" value={form.metric} onChange={e => setForm(p => ({...p, metric: e.target.value}))}>
                  {METRICS.map(m => <option key={m} value={m}>{m.replace(/_/g,' ')}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Score (1–10) *</label>
                <input type="number" min="1" max="10" className="form-input" value={form.score} onChange={e => setForm(p => ({...p, score: e.target.value}))} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Remarks</label>
              <textarea className="form-textarea" value={form.remarks} onChange={e => setForm(p => ({...p, remarks: e.target.value}))} placeholder="Evaluation notes..." />
            </div>
            <button type="submit" className="btn btn-primary">Submit Evaluation</button>
          </form>
        </div>
      )}

      <div className="table-wrapper">
        <div className="table-toolbar">
          <select className="form-select" style={{ width: 220 }} value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="ALL">All Metrics</option>
            {METRICS.map(m => <option key={m} value={m}>{m.replace(/_/g,' ')}</option>)}
          </select>
          <span className="text-muted text-sm" style={{ marginLeft: 'auto' }}>{filtered.length} records</span>
        </div>
        <div className="table-scroll">
          <table style={{ minWidth: 700 }}>
            <thead>
              <tr>
                <th>Vendor</th>
                <th>Metric</th>
                <th style={{ minWidth: 160 }}>Score</th>
                <th>Evaluated By</th>
                <th>Date</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6}><div className="empty-state"><div className="icon">⏳</div><p>Loading performance logs...</p></div></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6}>
                  <div className="empty-state">
                    <div className="icon"></div>
                    <p>{logs.length === 0 ? 'No performance evaluations yet. Add your first evaluation above.' : 'No logs match the selected metric.'}</p>
                  </div>
                </td></tr>
              ) : filtered.map(log => (
                <tr key={log.id}>
                  <td className="fw-600">{log.companyName || `Vendor #${log.vendorId}`}</td>
                  <td><span className="text-xs fw-600">{log.metric?.replace(/_/g,' ')}</span></td>
                  <td style={{ width: 200 }}><ScoreBar score={log.score} /></td>
                  <td className="text-sm text-muted">{log.evaluatedBy}</td>
                  <td className="text-xs text-muted">{log.evaluationDate}</td>
                  <td className="text-sm text-muted">{log.remarks || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PerformanceLog;

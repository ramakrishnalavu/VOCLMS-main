import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const CONTRACT_TYPES    = ['SERVICE', 'SUPPLY', 'LEASE', 'NDA', 'MSA'];
const RENEWAL_TYPES     = ['AUTO_RENEW', 'MANUAL_RENEW', 'NO_RENEW'];
const CONTRACT_STATUSES = ['DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'EXPIRING', 'EXPIRED', 'TERMINATED', 'REJECTED'];

const ContractList = () => {
  const [contracts, setContracts] = useState([]);
  const [filter, setFilter]       = useState('ALL');
  const [showNew, setShowNew]     = useState(false);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [msg, setMsg]             = useState('');
  const [form, setForm] = useState({ vendorId: '', contractNumber: '', contractType: 'SERVICE', startDate: '', endDate: '', renewalType: 'NO_RENEW', value: '' });
  const role         = localStorage.getItem('role');
  const approverName = localStorage.getItem('name') || localStorage.getItem('username') || 'Unknown';
  const canCreate    = ['PROCUREMENT_OFFICER'].includes(role);
  const canApprove   = ['LEGAL_TEAM', 'FINANCE_TEAM', 'PROCUREMENT_OFFICER'].includes(role);

  const fetchContracts = async () => {
    setLoading(true); setError('');
    try {
      const r = await api.get('/contracts');
      setContracts(r.data || []);
    } catch {
      console.error('Failed to fetch from backend.');
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchContracts(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        contractNumber: form.contractNumber,
        contractType: form.contractType,
        startDate: form.startDate,
        endDate: form.endDate,
        renewalType: form.renewalType,
        value: form.value ? parseFloat(form.value) : 0
      };
      await api.post(`/contracts/${form.vendorId}`, payload);
      fetchContracts();
      setMsg(' Contract created successfully as DRAFT.');
    } catch {
      setMsg(' Failed to create contract. Ensure vendor is APPROVED.');
    }
    setShowNew(false);
    setForm({ vendorId: '', contractNumber: '', contractType: 'SERVICE', startDate: '', endDate: '', renewalType: 'NO_RENEW', value: '' });
  };

  const handleSubmitContract = async (id) => {
    try { await api.put(`/contracts/${id}/submit`); fetchContracts(); } catch {
      setContracts(prev => prev.map(c => c.id === id ? { ...c, status: 'PENDING_APPROVAL' } : c));
    }
  };

  const handleApprove = async (id) => {
    try { await api.put(`/contracts/${id}/approve?username=${encodeURIComponent(approverName)}`); fetchContracts(); } catch {
      setContracts(prev => prev.map(c => c.id === id ? { ...c, status: 'ACTIVE', approvedBy: approverName } : c));
    }
  };

  const handleReject = async (id) => {
    try { await api.put(`/contracts/${id}/reject?username=${encodeURIComponent(approverName)}`); fetchContracts(); } catch {
      setContracts(prev => prev.map(c => c.id === id ? { ...c, status: 'REJECTED', approvedBy: approverName } : c));
    }
  };

  const handleTerminate = async (id) => {
    try { await api.put(`/contracts/${id}/terminate`); fetchContracts(); } catch {
      setContracts(prev => prev.map(c => c.id === id ? { ...c, status: 'TERMINATED' } : c));
    }
  };

  const filtered    = contracts.filter(c => filter === 'ALL' || c.status === filter);
  const formatMoney = (v) => v ? `₹${Number(v).toLocaleString('en-IN')}` : '—';
  const statusBadge = (s) => `badge badge-${s?.toLowerCase()}`;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Contracts</div>
          <div className="page-subtitle">Manage vendor contracts and their approval lifecycle</div>
        </div>
        {canCreate && (
          <button className="btn btn-primary" onClick={() => setShowNew(!showNew)}>
            {showNew ? '✕ Cancel' : '+ New Contract'}
          </button>
        )}
      </div>

      <div className="lifecycle-flow">
        <span className="badge badge-draft">DRAFT</span><span className="lifecycle-arrow">→</span>
        <span className="badge badge-pending_approval">PENDING_APPROVAL</span><span className="lifecycle-arrow">→</span>
        <span className="badge badge-active">ACTIVE</span><span className="lifecycle-arrow">→</span>
        <span className="badge badge-expiring">EXPIRING</span><span className="lifecycle-arrow">→</span>
        <span className="badge badge-expired">EXPIRED</span><span className="lifecycle-arrow">→</span>
        <span className="badge badge-terminated">TERMINATED</span>
        <span style={{marginLeft: '10px'}} className="badge badge-rejected">/ REJECTED</span>
      </div>

      {msg   && <div className={`alert ${msg.startsWith('') ? 'alert-success' : 'alert-danger'}`}>{msg}</div>}
      {error && <div className="alert alert-warning">{error}</div>}

      {showNew && (
        <div className="card mb-4">
          <div className="card-title mb-4">Create New Contract</div>
          <div className="alert alert-info mb-4"> Contracts can only be created for APPROVED vendors.</div>
          <form onSubmit={handleCreate}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Vendor ID *</label>
                <input type="number" className="form-input" value={form.vendorId} onChange={e => setForm(p => ({...p, vendorId: e.target.value}))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Contract Number *</label>
                <input type="text" className="form-input" placeholder="CTR-2025-XXX" value={form.contractNumber} onChange={e => setForm(p => ({...p, contractNumber: e.target.value}))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Contract Type</label>
                <select className="form-select" value={form.contractType} onChange={e => setForm(p => ({...p, contractType: e.target.value}))}>
                  {CONTRACT_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Renewal Type</label>
                <select className="form-select" value={form.renewalType} onChange={e => setForm(p => ({...p, renewalType: e.target.value}))}>
                  {RENEWAL_TYPES.map(t => <option key={t}>{t.replace(/_/g,' ')}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Start Date *</label>
                <input type="date" className="form-input" value={form.startDate} onChange={e => setForm(p => ({...p, startDate: e.target.value}))} required />
              </div>
              <div className="form-group">
                <label className="form-label">End Date *</label>
                <input type="date" className="form-input" value={form.endDate} onChange={e => setForm(p => ({...p, endDate: e.target.value}))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Contract Value (₹)</label>
                <input type="number" className="form-input" value={form.value} onChange={e => setForm(p => ({...p, value: e.target.value}))} placeholder="0" />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">Create Contract</button>
          </form>
        </div>
      )}

      <div className="table-wrapper">
        <div className="table-toolbar">
          <select className="form-select" style={{ width: 200 }} value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="ALL">All Statuses</option>
            {CONTRACT_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
          </select>
          <span className="text-muted text-sm" style={{ marginLeft: 'auto' }}>{filtered.length} contracts</span>
        </div>
        <div className="table-scroll">
          <table style={{ minWidth: 900 }}>
            <thead>
              <tr>
                <th>Contract No.</th>
                <th>Vendor</th>
                <th>Type</th>
                <th>Value</th>
                <th>Start</th>
                <th>End</th>
                <th>Renewal</th>
                <th>Status</th>
                <th>Approved By</th>
                {canApprove && <th style={{ minWidth: 180 }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={canApprove ? 9 : 8}><div className="empty-state"><div className="icon">⏳</div><p>Loading contracts...</p></div></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={canApprove ? 9 : 8}>
                  <div className="empty-state">
                    <div className="icon"></div>
                    <p>{contracts.length === 0 ? 'No contracts created yet. Contracts can only be made for APPROVED vendors.' : 'No contracts match selected filter.'}</p>
                  </div>
                </td></tr>
              ) : filtered.map(c => (
                <tr key={c.id}>
                  <td className="fw-600 text-sm">{c.contractNumber}</td>
                  <td className="text-sm">{c.vendor?.companyName || c.companyName || `Vendor #${c.vendor?.id || 'Unknown'}`}</td>
                  <td><span className="text-xs fw-600">{c.contractType}</span></td>
                  <td className="fw-600">{formatMoney(c.value)}</td>
                  <td className="text-xs text-muted">{c.startDate}</td>
                  <td className="text-xs text-muted">{c.endDate}</td>
                  <td><span className="text-xs">{c.renewalType?.replace(/_/g,' ')}</span></td>
                  <td><span className={statusBadge(c.status)}>{c.status?.replace(/_/g,' ')}</span></td>
                  <td className="text-xs text-muted fw-600">{c.approvedBy || '—'}</td>
                  {canApprove && (
                    <td>
                      <div className="flex gap-1" style={{ flexWrap: 'nowrap' }}>
                        {c.status === 'DRAFT' && canCreate && <button className="btn btn-primary btn-sm" onClick={() => handleSubmitContract(c.id)}>Submit Draft</button>}
                        {c.status === 'PENDING_APPROVAL' && (
                          <>
                            <button className="btn btn-success btn-sm" onClick={() => handleApprove(c.id)}>✓ Approve</button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleReject(c.id)}>✕ Reject</button>
                          </>
                        )}
                        {['ACTIVE','EXPIRING'].includes(c.status) && <button className="btn btn-danger btn-sm" onClick={() => handleTerminate(c.id)}>✕ Terminate</button>}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ContractList;

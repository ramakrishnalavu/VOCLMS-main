import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const DOC_TYPES = ['GST_CERTIFICATE', 'PAN_CARD', 'BANK_DETAILS', 'INSURANCE', 'ISO_CERTIFICATE'];

const VendorDocuments = () => {
  const [docs, setDocs] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [showUpload, setShowUpload] = useState(false);
  const [form, setForm] = useState({ vendorId: '', documentType: 'GST_CERTIFICATE', documentUrl: '' });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const role = localStorage.getItem('role');
  const canVerify = ['LEGAL_TEAM'].includes(role);

  const fetchDocs = async () => {
    setLoading(true); setError('');
    try {
      const r = await api.get('/vendor-documents');
      setDocs(r.data || []);
    } catch {
      console.error('Failed to fetch from backend.');
      setDocs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocs(); }, []);

  const handleVerify = async (id, action) => {
    try { await api.put(`/vendor-documents/${id}/${action}`); } catch { }
    setDocs(prev => prev.map(d => d.id === id ? { ...d, verificationStatus: action === 'verify' ? 'VERIFIED' : 'REJECTED' } : d));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        vendor: { id: parseInt(form.vendorId) },
        documentType: form.documentType,
        documentUrl: form.documentUrl
      };
      await api.post('/vendor-documents', payload);
      fetchDocs();
      setMsg(' Document uploaded successfully. Awaiting verification.');
    } catch {
      setMsg(' Upload failed. Please check vendor ID and try again.');
    }
    setShowUpload(false);
    setForm({ vendorId: '', documentType: 'GST_CERTIFICATE', documentUrl: '' });
  };

  const filtered = docs.filter(d => filter === 'ALL' || d.verificationStatus === filter);
  const statusColor = { PENDING: 'badge-pending', VERIFIED: 'badge-verified', REJECTED: 'badge-rejected' };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Vendor Documents</div>
          <div className="page-subtitle">Track and verify mandatory compliance documents</div>
        </div>
        {['VENDOR', 'ADMIN'].includes(role) && (
          <button className="btn btn-primary" onClick={() => setShowUpload(!showUpload)}>
            {showUpload ? '✕ Cancel' : '⬆ Upload Document'}
          </button>
        )}
      </div>

      {msg && <div className={`alert ${msg.startsWith(' Document uploaded successfully. Awaiting verification.') ? 'alert-success' : 'alert-danger'}`}>{msg}</div>}
      {error && <div className="alert alert-warning">{error}</div>}

      {showUpload && (
        <div className="card mb-4">
          <div className="card-title mb-4">Upload New Document</div>
          <form onSubmit={handleUpload}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Vendor ID *</label>
                <input type="number" className="form-input" value={form.vendorId} onChange={e => setForm(p => ({ ...p, vendorId: e.target.value }))} placeholder="Enter Vendor ID" required />
              </div>
              <div className="form-group">
                <label className="form-label">Document Type *</label>
                <select className="form-select" value={form.documentType} onChange={e => setForm(p => ({ ...p, documentType: e.target.value }))}>
                  {DOC_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Document URL *</label>
                <input type="url" className="form-input" value={form.documentUrl} onChange={e => setForm(p => ({ ...p, documentUrl: e.target.value }))} placeholder="https://..." required />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">Upload</button>
          </form>
        </div>
      )}

      <div className="table-wrapper">
        <div className="table-toolbar">
          <span className="fw-600 text-sm">Documents</span>
          <select className="form-select" style={{ width: 180 }} value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="VERIFIED">Verified</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <span className="text-muted text-sm" style={{ marginLeft: 'auto' }}>{filtered.length} documents</span>
        </div>
        <div className="table-scroll">
          <table style={{ minWidth: 800 }}>
            <thead>
              <tr>
                <th>Vendor</th>
                <th>Document Type</th>
                <th>Verification Status</th>
                <th>Verified By</th>
                <th>Expiry Date</th>
                <th>Link</th>
                {canVerify && <th style={{ minWidth: 160 }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={canVerify ? 7 : 6}><div className="empty-state"><div className="icon">⏳</div><p>Loading documents...</p></div></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={canVerify ? 7 : 6}>
                  <div className="empty-state">
                    <div className="icon">📄</div>
                    <p>{docs.length === 0 ? 'No documents uploaded yet.' : 'No documents match selected filter.'}</p>
                  </div>
                </td></tr>
              ) : filtered.map(doc => (
                <tr key={doc.id}>
                  <td className="fw-600">{doc.vendor?.companyName || doc.companyName || `Vendor #${doc.vendor?.id || doc.vendorId}`}</td>
                  <td><span className="text-xs fw-600">{doc.documentType?.replace(/_/g, ' ')}</span></td>
                  <td><span className={`badge ${statusColor[doc.verificationStatus] || 'badge-pending'}`}>{doc.verificationStatus}</span></td>
                  <td className="text-muted text-sm">{doc.verifiedBy?.username || doc.verifiedBy || '—'}</td>
                  <td className="text-sm">{doc.expiryDate || '—'}</td>
                  <td>{doc.documentUrl && <a href={doc.documentUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">View</a>}</td>
                  {canVerify && (
                    <td>
                      <div className="flex gap-1">
                        {doc.verificationStatus === 'PENDING' && (
                          <>
                            <button className="btn btn-success btn-sm" onClick={() => handleVerify(doc.id, 'verify')}>✓ Verify</button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleVerify(doc.id, 'reject')}>✗ Reject</button>
                          </>
                        )}
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

export default VendorDocuments;

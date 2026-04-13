import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const PAYMENT_TERMS_OPTIONS = ['Net 30', 'Net 45', 'Net 60', 'Net 90', 'Advance Payment', 'Milestone-based'];

const PaymentTerms = () => {
  const [terms, setTerms]       = useState([]);
  const [selected, setSelected] = useState(null);
  const [editTerm, setEditTerm] = useState('');
  const [remarks, setRemarks]   = useState('');
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [msg, setMsg]           = useState('');
  const role     = localStorage.getItem('role');
  const canApprove = ['FINANCE_TEAM'].includes(role);

  useEffect(() => {
    api.get('/contracts/payment-terms')
      .then(r => { setTerms(r.data || []); setLoading(false); })
      .catch(() => { console.error('Failed to fetch from backend.'); setLoading(false); });
  }, []);

  const handleAction = async (id, action) => {
    try {
      await api.put(`/contracts/payment-terms/${id}/${action}`, { remarks, paymentTerm: editTerm });
    } catch {}
    setTerms(prev => prev.map(t => t.id === id ? {
      ...t,
      financeStatus: action === 'approve' ? 'APPROVED' : 'REJECTED',
      approvedBy: localStorage.getItem('username'),
      approvedAt: new Date().toISOString().slice(0, 10),
      remarks,
      paymentTerm: editTerm || t.paymentTerm,
    } : t));
    setSelected(null); setRemarks(''); setEditTerm('');
    setMsg(` Payment terms ${action === 'approve' ? 'approved' : 'rejected'} successfully.`);
  };

  const statusBadge = { APPROVED: 'badge-approved', PENDING: 'badge-pending', REJECTED: 'badge-rejected' };
  const formatMoney = (v) => `₹${Number(v).toLocaleString('en-IN')}`;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Payment Terms Approval</div>
          <div className="page-subtitle">Finance Team reviews and approves contract payment conditions</div>
        </div>
        <div className="flex gap-2">
          <span className="badge badge-pending">{terms.filter(t => t.financeStatus === 'PENDING').length} Pending</span>
          <span className="badge badge-approved">{terms.filter(t => t.financeStatus === 'APPROVED').length} Approved</span>
        </div>
      </div>

      <div className="alert alert-info mb-4">
         Finance Team must approve payment terms before a contract becomes ACTIVE. Rejected terms must be renegotiated.
      </div>

      {msg   && <div className="alert alert-success">{msg}</div>}
      {error && <div className="alert alert-warning">{error}</div>}

      {loading && <div className="alert alert-info"> Loading payment terms...</div>}

      {!loading && terms.length === 0 && !error && (
        <div className="card"><div className="empty-state"><div className="icon"></div><p>No payment terms to review. They will appear here when contracts are created.</p></div></div>
      )}

      {['PENDING', 'APPROVED', 'REJECTED'].map(status => {
        const group = terms.filter(t => t.financeStatus === status);
        if (group.length === 0) return null;
        return (
          <div key={status} className="mb-6">
            <div style={{ fontWeight: 700, fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.75rem' }}>
              {status === 'PENDING' ? '⏳' : status === 'APPROVED' ? '' : ''} {status} ({group.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {group.map(t => (
                <div key={t.id} className="card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 700 }}>{t.contractNumber}</span>
                        <span className={`badge ${statusBadge[t.financeStatus]}`}>{t.financeStatus}</span>
                      </div>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>{t.vendor?.companyName || t.companyName || '—'}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginTop: '0.75rem' }}>
                        {[
                          ['Contract Type', t.contractType],
                          ['Contract Value', formatMoney(t.value || 0)],
                          ['Payment Term', t.paymentTerm || '—'],
                          ['GST %', t.gstPercentage ? `${t.gstPercentage}%` : '—'],
                          ['Penalty Clause', t.penaltyClause || '—'],
                          ['Approved By', t.approvedBy || '—'],
                          ['Approved At', t.approvedAt || '—'],
                          ['Remarks', t.financeRemarks || t.remarks || '—'],
                        ].map(([label, val]) => (
                          <div key={label}>
                            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
                            <div style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 500 }}>{val}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {canApprove && t.financeStatus === 'PENDING' && (
                      <button className="btn btn-primary btn-sm" style={{ flexShrink: 0 }} onClick={() => { setSelected(t.id); setEditTerm(t.paymentTerm || ''); setRemarks(''); }}>
                        Review
                      </button>
                    )}
                  </div>

                  {selected === t.id && (
                    <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                      <div style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.875rem' }}>Review Payment Terms</div>
                      <div className="form-grid">
                        <div className="form-group">
                          <label className="form-label">Adjust Payment Term</label>
                          <select className="form-select" value={editTerm} onChange={e => setEditTerm(e.target.value)}>
                            {PAYMENT_TERMS_OPTIONS.map(o => <option key={o}>{o}</option>)}
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Finance Remarks</label>
                          <input className="form-input" value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Add finance notes..." />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="btn btn-success" onClick={() => handleAction(t.id, 'approve')}>✓ Approve Terms</button>
                        <button className="btn btn-danger" onClick={() => handleAction(t.id, 'reject')}>✗ Reject Terms</button>
                        <button className="btn btn-ghost" onClick={() => setSelected(null)}>Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PaymentTerms;

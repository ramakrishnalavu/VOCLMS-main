import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const buildTimeline = (vendor) => [
  { stage: 'REGISTERED',     label: 'Company Registered',    icon: '📝', color: '#8b5cf6', done: true,                                           desc: 'Vendor submitted company profile and basic registration details.' },
  { stage: 'DOCS_SUBMITTED', label: 'Documents Submitted',   icon: '📄', color: '#6366f1', done: true,                                           desc: 'GST Certificate, PAN Card, Insurance & Bank Details uploaded.' },
  { stage: 'PROCUREMENT',    label: 'Procurement Review',    icon: '🔍', color: '#f59e0b', done: !['REGISTERED'].includes(vendor.status),         desc: 'PROCUREMENT_OFFICER reviewed the vendor application and supporting documents.' },
  { stage: 'LEGAL',          label: 'Legal Verification',    icon: '⚖️', color: '#3b82f6', done: ['APPROVED'].includes(vendor.status),             desc: 'LEGAL_TEAM verified all compliance documents and regulatory standing.' },
  { stage: 'FINANCE',        label: 'Finance Approval',      icon: '💰', color: '#10b981', done: vendor.status === 'APPROVED',                    desc: 'FINANCE_TEAM approved payment terms and financial credentials.' },
  { stage: 'APPROVED',       label: 'Vendor Approved',       icon: '✅', color: '#10b981', done: vendor.status === 'APPROVED',                    desc: 'All three approval stages completed. Vendor is now APPROVED and ready for contracts.' },
  { stage: 'CONTRACT',       label: 'Contract Created',      icon: '📋', color: '#0ea5e9', done: vendor.status === 'APPROVED',                    desc: 'First contract created. Only APPROVED vendors can receive contracts.' },
  { stage: 'ACTIVE',         label: 'Contract Active',       icon: '🟢', color: '#10b981', done: vendor.status === 'APPROVED',                    desc: 'Contract approved by Legal and Finance teams. Contract is now ACTIVE.' },
  { stage: 'EXPIRING',       label: 'Renewal Reminders',     icon: '📧', color: '#f97316', done: false,                                           desc: 'System auto-sends renewal reminders at 30, 15 & 7 days before contract expiry.' },
  { stage: 'RENEWAL',        label: 'Renewed / Expired',     icon: '🔄', color: '#64748b', done: false,                                           desc: 'Contract renewed or expired based on renewal type (AUTO_RENEW / MANUAL_RENEW / NO_RENEW).' },
];

const VendorTimeline = () => {
  const [vendors, setVendors]   = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    api.get('/vendors')
      .then(r => { setVendors(r.data || []); setLoading(false); })
      .catch(() => { console.error('Failed to fetch from backend.'); setLoading(false); });
  }, []);

  const vendor   = vendors.find(v => v.id === selected);
  const timeline = vendor ? buildTimeline(vendor) : [];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Vendor Lifecycle Timeline</div>
          <div className="page-subtitle">Track complete journey from registration to contract expiry</div>
        </div>
      </div>

      <div className="alert alert-info mb-4">
        📌 Full lifecycle: <strong>Register → Submit Docs → Procurement → Legal → Finance → Approved → Contract Active → Renewal</strong>
      </div>

      {error && <div className="alert alert-warning">{error}</div>}

      {loading && <div className="alert alert-info">⏳ Loading vendors...</div>}

      <div className="card mb-6">
        <div className="card-title mb-4">Select a Vendor</div>
        {!loading && vendors.length === 0 && !error && (
          <div className="empty-state"><div className="icon">🏢</div><p>No vendors registered yet. Register a vendor first to track its lifecycle.</p></div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {vendors.map(v => (
            <button
              key={v.id}
              onClick={() => setSelected(v.id)}
              style={{ padding: '1rem', textAlign: 'left', border: `2px solid ${selected === v.id ? '#3b82f6' : '#e2e8f0'}`, borderRadius: 10, background: selected === v.id ? '#eff6ff' : 'white', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              <div style={{ fontWeight: 700, marginBottom: 4, color: '#0f172a' }}>{v.companyName}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{v.category} · {v.vendorType?.replace(/_/g,' ')}</div>
              <div style={{ marginTop: 6 }}>
                <span className={`badge badge-${v.status?.toLowerCase()}`}>{v.status?.replace(/_/g,' ')}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {vendor && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <div className="card-title">{vendor.companyName} — Lifecycle Journey</div>
              <div className="card-subtitle">{vendor.category} · {vendor.vendorType?.replace(/_/g,' ')}</div>
            </div>
            <span className={`badge badge-${vendor.status?.toLowerCase()}`} style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}>
              Current: {vendor.status?.replace(/_/g,' ')}
            </span>
          </div>

          <div style={{ position: 'relative', paddingLeft: '2.5rem' }}>
            <div style={{ position: 'absolute', left: '1rem', top: 16, bottom: 16, width: 2, background: '#e2e8f0' }} />
            {timeline.map((step) => (
              <div key={step.stage} style={{ position: 'relative', marginBottom: '1.25rem', display: 'flex', gap: '1rem' }}>
                <div style={{ position: 'absolute', left: '-2.5rem', width: 32, height: 32, borderRadius: '50%', background: step.done ? step.color : '#f1f5f9', border: `2px solid ${step.done ? step.color : '#e2e8f0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', color: step.done ? 'white' : '#94a3b8', zIndex: 1, boxShadow: step.done ? `0 0 0 4px ${step.color}22` : 'none' }}>
                  {step.done ? step.icon : '○'}
                </div>
                <div style={{ flex: 1, background: step.done ? 'white' : '#f8fafc', border: `1px solid ${step.done ? '#e2e8f0' : '#f1f5f9'}`, borderRadius: 8, padding: '0.875rem 1rem', opacity: step.done ? 1 : 0.5 }}>
                  <div style={{ fontWeight: 600, color: step.done ? '#0f172a' : '#94a3b8', fontSize: '0.9rem' }}>{step.label}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 3 }}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorTimeline;

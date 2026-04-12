import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const daysUntil = (dateStr) => {
  if (!dateStr) return Infinity;
  return Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
};

const urgencyConfig = (days) => {
  if (days <= 7) return { color: '#ef4444', bg: '#fee2e2', border: '#fca5a5', label: `${days} days left` };
  if (days <= 15) return { color: '#f97316', bg: '#fff7ed', border: '#fdba74', label: `${days} days left` };
  if (days <= 30) return { color: '#f59e0b', bg: '#fef3c7', border: '#fcd34d', label: `${days} days left` };
  return null;
};

const ContractRenewals = () => {
  const [contracts, setContracts] = useState([]);
  const [renewed, setRenewed] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const role = localStorage.getItem('role');
  const canRenew = ['ADMIN', 'FINANCE_TEAM', 'PROCUREMENT_OFFICER'].includes(role);

  useEffect(() => {
    api.get('/contracts')
      .then(r => { setContracts(r.data || []); setLoading(false); })
      .catch(() => { console.error('Failed to fetch from backend.'); setLoading(false); });
  }, []);

  const handleRenew = async (id, months) => {
    try { await api.put(`/contracts/${id}/renew`, { months }); } catch { }
    setRenewed(prev => ({ ...prev, [id]: months }));
  };

  const expiring = contracts
    .map(c => ({ ...c, daysLeft: daysUntil(c.endDate) }))
    .filter(c => c.daysLeft <= 30 && !['TERMINATED', 'EXPIRED'].includes(c.status))
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const critical = expiring.filter(c => c.daysLeft <= 7);
  const urgent = expiring.filter(c => c.daysLeft > 7 && c.daysLeft <= 15);
  const warning = expiring.filter(c => c.daysLeft > 15 && c.daysLeft <= 30);
  const formatMoney = (v) => v ? `₹${Number(v).toLocaleString('en-IN')}` : '—';

  const RenewalCard = ({ contract }) => {
    const cfg = urgencyConfig(contract.daysLeft);
    const isRenewed = renewed[contract.id];
    return (
      <div style={{ border: `1.5px solid ${cfg.border}`, background: cfg.bg, borderRadius: 10, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '0.75rem' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 4 }}>
            <span style={{ fontWeight: 700, color: '#0f172a' }}>{contract.contractNumber}</span>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: cfg.color, background: 'white', padding: '1px 8px', borderRadius: 99, border: `1px solid ${cfg.border}` }}>
              {contract.daysLeft <= 0 ? 'EXPIRES TODAY' : cfg.label}
            </span>
          </div>
          <div style={{ fontSize: '0.875rem', color: '#334155', fontWeight: 500 }}>{contract.companyName}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>
            Type: {contract.contractType} &nbsp;·&nbsp; Value: {formatMoney(contract.value)} &nbsp;·&nbsp; Ends: {contract.endDate} &nbsp;·&nbsp; Renewal: {contract.renewalType?.replace(/_/g, ' ')}
          </div>
        </div>
        {canRenew && !isRenewed ? (
          <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
            <button className="btn btn-success btn-sm" onClick={() => handleRenew(contract.id, 12)}>↺ Renew 12m</button>
            <button className="btn btn-ghost btn-sm" onClick={() => handleRenew(contract.id, 6)}>Renew 6m</button>
          </div>
        ) : isRenewed ? (
          <span style={{ color: '#10b981', fontWeight: 700, fontSize: '0.875rem' }}>✓ Renewal Initiated ({isRenewed}m)</span>
        ) : (
          <span style={{ fontSize: '0.75rem', color: cfg.color, fontWeight: 600 }}>Renewal pending Finance approval</span>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Contract Renewal Center</div>
          <div className="page-subtitle">Contracts expiring within 30 days — reminders sent at 30, 15 & 7 days</div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span className="badge badge-rejected">{critical.length} Critical</span>
          <span className="badge badge-expiring">{urgent.length} Urgent</span>
          <span className="badge badge-under_review">{warning.length} Warning</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: '🔴 Within 7 days', count: critical.length, color: '#ef4444' },
          { label: '🟠 Within 15 days', count: urgent.length, color: '#f97316' },
          { label: '🟡 Within 30 days', count: warning.length, color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ borderTop: `4px solid ${s.color}` }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color }}>{s.count}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card mb-4" style={{ padding: '1rem 1.5rem', background: '#f8fafc' }}>
        <div className="flex gap-4 flex-wrap">
          <span className="fw-600 text-sm">📅 Auto-Reminder Policy:</span>
          <span className="text-sm text-muted">📧 30 days — Initial notice</span>
          <span className="text-sm text-muted">📧 15 days — Urgent follow-up</span>
          <span className="text-sm text-muted">📧 7 days — Critical alert to Finance & Admin</span>
        </div>
      </div>

      {loading && <div className="alert alert-info">⏳ Loading contracts...</div>}
      {error && <div className="alert alert-warning">{error}</div>}

      {!loading && expiring.length === 0 && (
        <div className="card"><div className="empty-state"><div className="icon">✅</div><p>{contracts.length === 0 ? 'No contracts found. Create contracts for your approved vendors.' : 'No contracts expiring in the next 30 days. All good!'}</p></div></div>
      )}

      {critical.length > 0 && (
        <div className="mb-4">
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#ef4444', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.5rem' }}>🔴 Critical — Expires Within 7 Days</div>
          {critical.map(c => <RenewalCard key={c.id} contract={c} />)}
        </div>
      )}
      {urgent.length > 0 && (
        <div className="mb-4">
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f97316', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.5rem' }}>🟠 Urgent — Expires Within 15 Days</div>
          {urgent.map(c => <RenewalCard key={c.id} contract={c} />)}
        </div>
      )}
      {warning.length > 0 && (
        <div className="mb-4">
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.5rem' }}>🟡 Warning — Expires Within 30 Days</div>
          {warning.map(c => <RenewalCard key={c.id} contract={c} />)}
        </div>
      )}
    </div>
  );
};

export default ContractRenewals;

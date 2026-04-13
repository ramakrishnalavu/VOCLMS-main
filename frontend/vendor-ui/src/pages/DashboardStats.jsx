import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';

const StatCard = ({ emoji, label, value, accent }) => (
  <div className="stat-card">
    <div className="stat-card-accent" style={{ background: accent }} />
    <div className="stat-icon" style={{ background: accent + '20', color: accent }}>
      {emoji}
    </div>
    <div className="stat-value">{value}</div>
    <div className="stat-label">{label}</div>
  </div>
);

const DashboardStats = () => {
  const [vendors, setVendors]     = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading]     = useState(true);
  const name                       = localStorage.getItem('name') || 'Admin';

  useEffect(() => {
    Promise.allSettled([
      api.get('/vendors'),
      api.get('/contracts'),
    ]).then(([v, c]) => {
      setVendors(v.status === 'fulfilled' ? (v.value.data || []) : []);
      setContracts(c.status === 'fulfilled' ? (c.value.data || []) : []);
      setLoading(false);
    });
  }, []);

  const count = (arr, key, val) => arr.filter(x => x[key] === val).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard Overview</div>
          <div className="page-subtitle">Welcome back, {name}  — Here's what's happening today</div>
        </div>
        <div className="text-muted text-sm">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>

      {loading && <div className="alert alert-info"> Loading data from backend...</div>}

      {/* Vendor Stats */}
      <div className="fw-700 mb-4" style={{ color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>Vendor Overview</div>
      <div className="grid grid-4 gap-4 mb-6">
        <StatCard emoji="" label="Total Vendors"    value={vendors.length}                                    accent="#3b82f6" />
        <StatCard emoji="" label="Approved"          value={count(vendors,'status','APPROVED')}                accent="#10b981" />
        <StatCard emoji="" label="Under Review"      value={count(vendors,'status','UNDER_REVIEW')}           accent="#f59e0b" />
        <StatCard emoji="" label="Newly Registered"  value={count(vendors,'status','REGISTERED')}             accent="#8b5cf6" />
      </div>
      <div className="grid grid-4 gap-4 mb-6">
        <StatCard emoji=" " label="Rejected"           value={count(vendors,'status','REJECTED')}              accent="#ef4444" />
        <StatCard emoji="" label="Blacklisted"        value={count(vendors,'status','BLACKLISTED')}           accent="#374151" />
        <StatCard emoji="" label="Inactive"           value={count(vendors,'status','INACTIVE')}              accent="#94a3b8" />
        <StatCard emoji="" label="Approval Rate"      value={vendors.length > 0 ? Math.round((count(vendors,'status','APPROVED')/vendors.length)*100) + '%' : '—'} accent="#6366f1" />
      </div>

      {/* Contract Stats */}
      <div className="fw-700 mb-4" style={{ color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>Contract Overview</div>
      <div className="grid grid-4 gap-4 mb-6">
        <StatCard emoji="" label="Total Contracts"   value={contracts.length}                                  accent="#3b82f6" />
        <StatCard emoji="" label="Active Contracts"   value={count(contracts,'status','ACTIVE')}               accent="#10b981" />
        <StatCard emoji="" label="Expiring Soon"      value={count(contracts,'status','EXPIRING')}             accent="#f97316" />
        <StatCard emoji="" label="Pending Approval"   value={count(contracts,'status','PENDING_APPROVAL')}     accent="#f59e0b" />
      </div>

      {/* Workflow Rules reference */}
      <div className="card">
        <div className="card-header">
          <div className="card-title"> System Workflow Rules</div>
        </div>
        <div className="grid grid-2 gap-4">
          {[
            ['', 'Vendor Lifecycle',     'REGISTERED → UNDER_REVIEW → APPROVED → REJECTED → BLACKLISTED → INACTIVE'],
            ['', 'Contract Lifecycle',   'DRAFT → PENDING_APPROVAL → ACTIVE → EXPIRING → EXPIRED → TERMINATED'],
            ['1️', 'Stage 1: Procurement', 'PROCUREMENT_OFFICER must approve before Legal Verification begins'],
            ['2️', 'Stage 2: Legal',       'LEGAL_TEAM must verify all documents before Finance Approval'],
            ['3️', 'Stage 3: Finance',     'FINANCE_TEAM approval completes the onboarding process'],
            ['', 'Blacklisted Policy',   'BLACKLISTED vendors cannot receive new contracts'],
          ].map(([icon, title, desc]) => (
            <div key={title} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.75rem', background: '#f8fafc', borderRadius: 8 }}>
              <span style={{ fontSize: '1.2rem' }}>{icon}</span>
              <div>
                <div className="fw-600 text-sm">{title}</div>
                <div className="text-xs text-muted mt-1">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;

import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const ALL_STATUSES = ['REGISTERED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'BLACKLISTED', 'INACTIVE'];

const StatusBadge = ({ status }) => (
  <span className={`badge badge-${status?.toLowerCase()}`}>
    {status?.replace(/_/g, ' ')}
  </span>
);

const VendorList = () => {
  const [vendors, setVendors]          = useState([]);
  const [search, setSearch]            = useState('');
  const [filterStatus, setFilter]      = useState('ALL');
  const [filterCategory, setFilterCat] = useState('ALL');
  const [loading, setLoading]          = useState(true);
  const [error, setError]              = useState('');
  const role          = localStorage.getItem('role');
  const isAdmin       = role === 'ADMIN';
  const isProcurement = role === 'PROCUREMENT_OFFICER';

  const fetchVendors = async () => {
    setLoading(true); setError('');
    try {
      const res = await api.get('/vendors');
      setVendors(res.data || []);
    } catch {
      console.error('Failed to fetch from backend.');
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVendors(); }, []);

  const updateStatus = async (id, action) => {
    try {
      await api.put(`/vendors/${id}/${action}`);
      fetchVendors();
    } catch {
      // optimistic update
      setVendors(prev => prev.map(v => {
        if (v.id !== id) return v;
        const map = { 'start-review': 'UNDER_REVIEW', reject: 'REJECTED', blacklist: 'BLACKLISTED', deactivate: 'INACTIVE' };
        return { ...v, status: map[action] || v.status };
      }));
    }
  };

  const filtered = vendors.filter(v => {
    const matchSearch = v.companyName?.toLowerCase().includes(search.toLowerCase()) ||
                        v.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || v.status === filterStatus;
    const matchCat    = filterCategory === 'ALL' || v.category === filterCategory;
    return matchSearch && matchStatus && matchCat;
  });

  const canApprove   = isProcurement;
  const canBlacklist = isAdmin;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Vendor Directory</div>
          <div className="page-subtitle">Manage and review all registered vendors</div>
        </div>
        <div className="flex gap-2">
          <span className="badge badge-approved">{vendors.filter(v => v.status === 'APPROVED').length} Approved</span>
          <span className="badge badge-under_review">{vendors.filter(v => v.status === 'UNDER_REVIEW').length} Under Review</span>
          <span className="badge badge-registered">{vendors.filter(v => v.status === 'REGISTERED').length} New</span>
        </div>
      </div>

      {error && <div className="alert alert-warning">{error}</div>}

      <div className="table-wrapper">
        <div className="table-toolbar">
          <input
            type="text"
            className="form-input"
            style={{ width: 260 }}
            placeholder="🔍 Search by company or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select className="form-select" style={{ width: 170 }} value={filterStatus} onChange={e => setFilter(e.target.value)}>
            <option value="ALL">All Statuses</option>
            {ALL_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
          <select className="form-select" style={{ width: 150 }} value={filterCategory} onChange={e => setFilterCat(e.target.value)}>
            <option value="ALL">All Categories</option>
            {['IT','CONSTRUCTION','LOGISTICS','CONSULTING','MANUFACTURING'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <span className="text-muted text-sm" style={{ marginLeft: 'auto' }}>{filtered.length} vendors</span>
        </div>

        <div className="table-scroll">
          <table style={{ minWidth: 800 }}>
            <thead>
              <tr>
                <th>#</th>
                <th>Company Name</th>
                <th>Email</th>
                <th>Type</th>
                <th>Category</th>
                <th>Status</th>
                {canApprove && <th style={{ minWidth: 180 }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={canApprove ? 7 : 6}>
                  <div className="empty-state"><div className="icon">⏳</div><p>Loading vendors...</p></div>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={canApprove ? 7 : 6}>
                  <div className="empty-state">
                    <div className="icon">🏢</div>
                    <p>{vendors.length === 0 ? 'No vendors registered yet. Register your first vendor!' : 'No vendors match your filters.'}</p>
                  </div>
                </td></tr>
              ) : filtered.map((v, i) => (
                <tr key={v.id}>
                  <td className="text-muted text-xs">#{v.id}</td>
                  <td>
                    <div className="fw-600">{v.companyName}</div>
                    <div className="text-xs text-muted">{v.phone}</div>
                  </td>
                  <td className="text-sm">{v.email}</td>
                  <td><span className="text-xs fw-600">{v.vendorType?.replace(/_/g, ' ')}</span></td>
                  <td><span className="text-xs fw-600">{v.category}</span></td>
                  <td><StatusBadge status={v.status} /></td>
                  {canApprove && (
                    <td>
                      <div className="flex gap-1" style={{ flexWrap: 'nowrap' }}>
                        {v.status === 'REGISTERED' && (
                          <button className="btn btn-primary btn-sm" onClick={() => updateStatus(v.id, 'start-review')}>▶ Start Review</button>
                        )}
                        {v.status === 'UNDER_REVIEW' && (
                           <span className="text-muted text-xs" style={{marginRight: 10, alignSelf: 'center'}}>In Pipeline...</span>
                        )}
                        {v.status !== 'REJECTED' && v.status !== 'BLACKLISTED' && (
                          <button className="btn btn-danger btn-sm" onClick={() => updateStatus(v.id, 'reject')}>✗ Reject</button>
                        )}
                        {canBlacklist && v.status !== 'BLACKLISTED' && (
                          <button className="btn btn-warning btn-sm" onClick={() => updateStatus(v.id, 'blacklist')}>🚫</button>
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

export default VendorList;

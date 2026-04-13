import React, { useState } from 'react';
import api from '../api/axiosConfig';

const VENDOR_TYPES = ['INDIVIDUAL', 'SMALL_BUSINESS', 'LARGE_ENTERPRISE'];
const CATEGORIES   = ['IT', 'CONSTRUCTION', 'LOGISTICS', 'CONSULTING', 'MANUFACTURING'];

const VendorRegistration = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    registrationNumber: '',
    panNumber: '',
    address: '',
    email: '',
    phone: '',
    vendorType: 'INDIVIDUAL',
    category: 'IT',
  });
  const [message, setMessage] = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); setError(''); setLoading(true);
    try {
      await api.post('/vendors/register', formData);
      setMessage(' Vendor registered successfully! Status: REGISTERED');
      setFormData({ companyName: '', registrationNumber: '', panNumber: '', address: '', email: '', phone: '', vendorType: 'INDIVIDUAL', category: 'IT' });
    } catch (err) {
      setError(' Failed to register vendor. Please check all fields and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Register New Vendor</div>
          <div className="page-subtitle">Fill in the details below to onboard a new vendor</div>
        </div>
      </div>

      <div className="lifecycle-flow">
        <span className="badge badge-registered">REGISTERED</span>
        <span className="lifecycle-arrow">→</span>
        <span className="badge badge-under_review">UNDER_REVIEW</span>
        <span className="lifecycle-arrow">→</span>
        <span className="badge badge-approved">APPROVED</span>
        <span className="lifecycle-arrow">→</span>
        <span className="badge badge-rejected">REJECTED</span>
        <span className="lifecycle-arrow">→</span>
        <span className="badge badge-blacklisted">BLACKLISTED</span>
        <span className="lifecycle-arrow">→</span>
        <span className="badge badge-inactive">INACTIVE</span>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Company Information</div>
            <div className="card-subtitle">All fields marked are mandatory for registration</div>
          </div>
        </div>

        {message && <div className="alert alert-success">{message}</div>}
        {error   && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Company Name *</label>
              <input type="text" name="companyName" className="form-input" value={formData.companyName} onChange={handleChange} placeholder="Acme Corporation" required />
            </div>
            <div className="form-group">
              <label className="form-label">Registration Number (GST/VAT) *</label>
              <input type="text" name="registrationNumber" className="form-input" value={formData.registrationNumber} onChange={handleChange} placeholder="27AAPFU0939F1ZV" required />
            </div>
            <div className="form-group">
              <label className="form-label">PAN Number *</label>
              <input type="text" name="panNumber" className="form-input" value={formData.panNumber} onChange={handleChange} placeholder="AAPFU0939F" required />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input type="email" name="email" className="form-input" value={formData.email} onChange={handleChange} placeholder="contact@company.com" required />
            </div>
            <div className="form-group">
              <label className="form-label">Phone *</label>
              <input type="text" name="phone" className="form-input" value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210" required />
            </div>
            <div className="form-group">
              <label className="form-label">Vendor Type *</label>
              <select name="vendorType" className="form-select" value={formData.vendorType} onChange={handleChange}>
                {VENDOR_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select name="category" className="form-select" value={formData.category} onChange={handleChange}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Address *</label>
            <textarea name="address" className="form-textarea" rows="3" value={formData.address} onChange={handleChange} placeholder="Full business address including city, state, pincode..." required />
          </div>

          <div className="flex gap-3">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? ' Submitting...' : ' Register Vendor'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setFormData({ companyName: '', registrationNumber: '', panNumber: '', address: '', email: '', phone: '', vendorType: 'INDIVIDUAL', category: 'IT' })}>
              🗑 Clear Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorRegistration;

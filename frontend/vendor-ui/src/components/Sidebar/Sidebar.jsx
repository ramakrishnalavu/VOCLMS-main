import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

// Role-aligned navigation per problem statement
const NAV_CONFIG = {
  ADMIN: [
    { section: 'Overview',   items: [
      { label: 'Dashboard',            icon: '', to: '/dashboard/stats' },
      { label: 'Vendor Timeline',      icon: '', to: '/dashboard/timeline' },
    ]},
    { section: 'Vendors',    items: [
      { label: 'All Vendors',          icon: '', to: '/dashboard/vendors' },
      { label: 'Register Vendor',      icon: '', to: '/dashboard/register' },
      { label: 'Compliance Documents', icon: '', to: '/dashboard/documents' },
    ]},
    { section: 'Workflow',   items: [
      { label: 'Onboarding Workflow',  icon: '', to: '/dashboard/workflow' },
    ]},
    { section: 'Contracts',  items: [
      { label: 'Contracts',            icon: '', to: '/dashboard/contracts' },
      { label: 'Renewal Center',       icon: '', to: '/dashboard/renewals' },
      { label: 'Payment Terms',        icon: '', to: '/dashboard/payment-terms' },
    ]},
    { section: 'Reports',    items: [
      { label: 'Performance Logs',     icon: '📈', to: '/dashboard/performance' },
    ]},
  ],

  VENDOR: [
    { section: 'My Account', items: [
      { label: 'Register Company',     icon: '', to: '/dashboard/register' },
      { label: 'Upload Documents',     icon: '', to: '/dashboard/documents' },
      { label: 'Onboarding Status',    icon: '', to: '/dashboard/workflow' },
      { label: 'My Contracts',         icon: '', to: '/dashboard/contracts' },
      { label: 'Lifecycle Tracker',    icon: '', to: '/dashboard/timeline' },
    ]},
  ],

  PROCUREMENT_OFFICER: [
    { section: 'Review Applications', items: [
      { label: 'Vendor Applications',  icon:' ', to: '/dashboard/vendors' },
      { label: 'Onboarding Workflow',  icon: '', to: '/dashboard/workflow' },
    ]},
    { section: 'Compliance', items: [
      { label: 'Compliance Documents', icon: '', to: '/dashboard/documents' },
    ]},
    { section: 'Contracts', items: [
      { label: 'Contracts',            icon: '', to: '/dashboard/contracts' },
      { label: 'Renewal Center',       icon: '', to: '/dashboard/renewals' },
    ]},
  ],

  LEGAL_TEAM: [
    { section: 'Compliance Verification', items: [
      { label: 'Verify Documents',     icon: '', to: '/dashboard/documents' },
      { label: 'Vendor Applications',  icon: '', to: '/dashboard/vendors' },
      { label: 'Onboarding Workflow',  icon: '', to: '/dashboard/workflow' },
    ]},
    { section: 'Contracts', items: [
      { label: 'Contracts',            icon: '', to: '/dashboard/contracts' },
    ]},
  ],

  FINANCE_TEAM: [
    { section: 'Finance Review', items: [
      { label: 'Payment Terms',        icon: '', to: '/dashboard/payment-terms' },
      { label: 'Onboarding Workflow',  icon: '', to: '/dashboard/workflow' },
    ]},
    { section: 'Contracts', items: [
      { label: 'Contracts',            icon: '', to: '/dashboard/contracts' },
      { label: 'Renewal Center',       icon:'', to: '/dashboard/renewals' },
    ]},
    { section: 'Reports', items: [
      { label: 'Performance Logs',     icon: '', to: '/dashboard/performance' },
      { label: 'Vendor Directory',     icon: '', to: '/dashboard/vendors' },
    ]},
  ],
};

const ROLE_COLORS = {
  ADMIN:               'linear-gradient(135deg, #3b82f6, #8b5cf6)',
  VENDOR:              'linear-gradient(135deg, #8b5cf6, #ec4899)',
  PROCUREMENT_OFFICER: 'linear-gradient(135deg, #10b981, #3b82f6)',
  LEGAL_TEAM:          'linear-gradient(135deg, #f59e0b, #ef4444)',
  FINANCE_TEAM:        'linear-gradient(135deg, #ef4444, #f97316)',
};

const ROLE_LABELS = {
  ADMIN:               'Administrator',
  VENDOR:              'Vendor',
  PROCUREMENT_OFFICER: 'Procurement',
  LEGAL_TEAM:          'Legal Team',
  FINANCE_TEAM:        'Finance Team',
};

const Sidebar = () => {
  const role     = localStorage.getItem('role') || 'VENDOR';
  const name     = localStorage.getItem('name') || 'User';
  const navigate = useNavigate();
  const sections = NAV_CONFIG[role] || NAV_CONFIG.VENDOR;
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h1>VOCLMS</h1>
        <p>Vendor Lifecycle System</p>
      </div>

      <nav className="sidebar-nav">
        {sections.map(({ section, items }) => (
          <div key={section}>
            <div className="sidebar-section-label">{section}</div>
            {items.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <span className="link-icon">{link.icon}</span>
                {link.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user-info">
          <div className="sidebar-avatar" style={{ background: ROLE_COLORS[role] }}>
            {initials}
          </div>
          <div>
            <div className="sidebar-user-name">{name}</div>
            <div className="sidebar-user-role">{ROLE_LABELS[role]}</div>
          </div>
        </div>
        <button className="btn btn-logout" onClick={handleLogout}>
           Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

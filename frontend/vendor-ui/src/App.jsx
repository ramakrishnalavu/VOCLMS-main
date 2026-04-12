import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login              from './pages/Login';
import DashboardLayout    from './components/Layout/DashboardLayout';
import ProtectedRoute     from './components/ProtectedRoute';
import DashboardStats     from './pages/DashboardStats';
import VendorList         from './pages/VendorList';
import VendorRegistration from './pages/VendorRegistration';
import VendorDocuments    from './pages/VendorDocuments';
import OnboardingWorkflow from './pages/OnboardingWorkflow';
import ContractList       from './pages/ContractList';
import ContractRenewals   from './pages/ContractRenewals';
import PaymentTerms       from './pages/PaymentTerms';
import VendorTimeline     from './pages/VendorTimeline';
import PerformanceLog     from './pages/PerformanceLog';

const ALL_ROLES = ['ADMIN', 'VENDOR', 'PROCUREMENT_OFFICER', 'LEGAL_TEAM', 'FINANCE_TEAM'];

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute allowedRoles={ALL_ROLES} />}>
          <Route path="/dashboard" element={<DashboardLayout />}>

            <Route index element={<Navigate to="vendors" replace />} />

            {/* Accessible to all roles */}
            <Route path="vendors"       element={<VendorList />} />
            <Route path="documents"     element={<VendorDocuments />} />
            <Route path="workflow"      element={<OnboardingWorkflow />} />
            <Route path="contracts"     element={<ContractList />} />
            <Route path="renewals"      element={<ContractRenewals />} />
            <Route path="timeline"      element={<VendorTimeline />} />

            {/* Vendor + Admin: register */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'VENDOR']} />}>
              <Route path="register"    element={<VendorRegistration />} />
            </Route>

            {/* Finance + Admin: payment terms */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'FINANCE_TEAM']} />}>
              <Route path="payment-terms" element={<PaymentTerms />} />
            </Route>

            {/* Admin + Finance: stats */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'FINANCE_TEAM']} />}>
              <Route path="stats"       element={<DashboardStats />} />
            </Route>

            {/* Admin + Procurement + Finance: performance */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'PROCUREMENT_OFFICER', 'FINANCE_TEAM']} />}>
              <Route path="performance" element={<PerformanceLog />} />
            </Route>
          </Route>
        </Route>

        <Route path="/"  element={<Navigate to="/login" replace />} />
        <Route path="*"  element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;

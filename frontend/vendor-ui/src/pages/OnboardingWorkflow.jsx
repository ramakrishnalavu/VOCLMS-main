import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const STAGES = ['PROCUREMENT_REVIEW', 'LEGAL_VERIFICATION', 'FINANCE_APPROVAL', 'COMPLETED'];
const stageIndex = (stage) => STAGES.indexOf(stage);

const WorkflowStages = ({ currentStage, stageStatus }) => {
  const idx = stageIndex(currentStage);
  return (
    <div className="flex items-center gap-2" style={{ minWidth: 320 }}>
      {STAGES.slice(0, 3).map((stage, i) => {
        const done   = i < idx || currentStage === 'COMPLETED';
        const active = i === idx && currentStage !== 'COMPLETED';
        return (
          <React.Fragment key={stage}>
            <div className="stage-block">
              <div className={`stage-circle ${done ? 'done' : active ? 'active' : 'pending'}`}
                style={active && stageStatus === 'REJECTED' ? { background: '#ef4444', borderColor: '#ef4444' } : {}}>
                {done ? '✓' : i + 1}
              </div>
              <div className={`stage-label ${done ? 'done' : active ? 'active' : ''}`} style={{ maxWidth: 70, fontSize: '0.6rem' }}>
                {stage.replace(/_/g,' ')}
              </div>
            </div>
            {i < 2 && <div className={`stage-line ${done ? 'done' : ''}`} style={{ minWidth: 20 }} />}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const OnboardingWorkflow = () => {
  const [workflows, setWorkflows] = useState([]);
  const [filter, setFilter]       = useState('ALL');
  const [remarkId, setRemarkId]   = useState(null);
  const [remark, setRemark]       = useState('');
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const role = localStorage.getItem('role');

  const myStage = {
    PROCUREMENT_OFFICER: 'PROCUREMENT_REVIEW',
    LEGAL_TEAM:          'LEGAL_VERIFICATION',
    FINANCE_TEAM:        'FINANCE_APPROVAL',
  }[role];

  const fetchWorkflows = async () => {
    setLoading(true); setError('');
    try {
      const r = await api.get('/vendors/workflow');
      setWorkflows(r.data || []);
    } catch {
      console.error('Failed to fetch from backend.');
      setWorkflows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWorkflows(); }, []);

  const updateWorkflow = async (id, action) => {
    try {
      await api.put(`/vendors/workflow/${id}/${action}`, { remarks: remark });
      fetchWorkflows();
    } catch {
      setWorkflows(prev => prev.map(w => {
        if (w.id !== id) return w;
        if (action === 'approve') {
          const nextIdx   = stageIndex(w.currentStage) + 1;
          const nextStage = STAGES[nextIdx] || 'COMPLETED';
          return { ...w, currentStage: nextStage, stageStatus: nextStage === 'COMPLETED' ? 'APPROVED' : 'PENDING', remarks: remark };
        }
        return { ...w, stageStatus: 'REJECTED', remarks: remark };
      }));
    }
    setRemarkId(null); setRemark('');
  };

  const filtered = workflows.filter(w => filter === 'ALL' || w.currentStage === filter);
  const statusColor = { PENDING: 'badge-pending', IN_PROGRESS: 'badge-in_progress', APPROVED: 'badge-approved', REJECTED: 'badge-rejected' };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Onboarding Workflow</div>
          <div className="page-subtitle">3-stage approval: Procurement → Legal → Finance</div>
        </div>
      </div>

      <div className="card mb-4" style={{ padding: '1rem 1.5rem' }}>
        <div className="flex items-center gap-3 text-sm fw-600">
          <span>Workflow Rules:</span>
          <span className="text-muted">Procurement must approve before Legal.</span>
          <span className="text-muted">Legal must approve before Finance.</span>
          <span className="text-muted">All 3 stages → Vendor APPROVED.</span>
        </div>
      </div>

      {error && <div className="alert alert-warning">{error}</div>}

      <div className="table-wrapper">
        <div className="table-toolbar">
          <span className="fw-600 text-sm">Workflows</span>
          <select className="form-select" style={{ width: 220 }} value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="ALL">All Stages</option>
            {STAGES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
          <span className="text-muted text-sm" style={{ marginLeft: 'auto' }}>{filtered.length} records</span>
        </div>
        <div className="table-scroll">
          <table style={{ minWidth: 1000 }}>
            <thead>
              <tr>
                <th style={{ minWidth: 140 }}>Vendor</th>
                <th style={{ minWidth: 340 }}>Workflow Progress</th>
                <th style={{ minWidth: 160 }}>Current Stage</th>
                <th style={{ minWidth: 120 }}>Stage Status</th>
                <th style={{ minWidth: 110 }}>Assigned To</th>
                <th style={{ minWidth: 160 }}>Remarks</th>
                <th style={{ minWidth: 100 }}>Updated</th>
                {role !== 'VENDOR' && <th style={{ minWidth: 160 }}>Action</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8}><div className="empty-state"><div className="icon"></div><p>Loading workflows...</p></div></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8}>
                  <div className="empty-state">
                    <div className="icon"></div>
                    <p>{workflows.length === 0 ? 'No vendor workflows started yet. Vendors must be registered first.' : 'No workflows match the selected stage.'}</p>
                  </div>
                </td></tr>
              ) : filtered.map(w => {
                return (
                  <React.Fragment key={w.id}>
                    <tr>
                      <td className="fw-600">{w.companyName}</td>
                      <td><WorkflowStages currentStage={w.currentStage} stageStatus={w.stageStatus} /></td>
                      <td><span className="text-xs fw-600">{w.currentStage?.replace(/_/g, ' ')}</span></td>
                      <td><span className={`badge ${statusColor[w.stageStatus] || 'badge-pending'}`}>{w.stageStatus}</span></td>
                      <td className="text-sm text-muted">{w.assignedTo}</td>
                      <td className="text-sm text-muted">{w.remarks || '—'}</td>
                      <td className="text-xs text-muted">{w.updatedAt}</td>
                      {role !== 'VENDOR' && (
                        <td>
                          {w.currentStage === myStage && w.stageStatus !== 'APPROVED' ? (
                            <button className="btn btn-success btn-sm" onClick={() => { setRemarkId(w.id); setRemark(''); }}>Review</button>
                          ) : w.currentStage !== 'COMPLETED' ? (
                            <span className="text-xs" style={{color: '#f59e0b', fontWeight: 600}}>
                              ⏳ Waiting for {w.currentStage?.split('_')[0] || 'Unknown'}
                            </span>
                          ) : null}
                        </td>
                      )}
                    </tr>
                    {remarkId === w.id && (
                      <tr>
                        <td colSpan={8} style={{ background: '#f8fafc', padding: '1rem 1.5rem' }}>
                          <div className="flex gap-3 items-center">
                            <input className="form-input" style={{ flex: 1 }} placeholder="Add remarks (optional)..." value={remark} onChange={e => setRemark(e.target.value)} />
                            <button className="btn btn-success btn-sm" onClick={() => updateWorkflow(w.id, 'approve')}>✓ Approve Stage</button>
                            <button className="btn btn-danger btn-sm" onClick={() => updateWorkflow(w.id, 'reject')}>✗ Reject Stage</button>
                            <button className="btn btn-ghost btn-sm" onClick={() => setRemarkId(null)}>Cancel</button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWorkflow;

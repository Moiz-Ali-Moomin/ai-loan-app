'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { loansApi } from '@/lib/api';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useState } from 'react';
import { CheckCircle, XCircle, Clock, ShieldCheck, Brain, FileText, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function LoanDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const qc = useQueryClient();
  const [approvalNotes, setApprovalNotes] = useState('');
  const [showApprovalForm, setShowApprovalForm] = useState(false);

  const { data: loanData } = useQuery({ queryKey: ['loan', id], queryFn: () => loansApi.get(id) });
  const { data: workflowData } = useQuery({ queryKey: ['workflow', id], queryFn: () => loansApi.getWorkflow(id) });
  const { data: auditData } = useQuery({ queryKey: ['audit', id], queryFn: () => loansApi.getAudit(id) });

  const approvalMutation = useMutation({
    mutationFn: (decision: 'APPROVE' | 'REJECT') =>
      loansApi.submitApproval(id, { decision, notes: approvalNotes }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['loan', id] });
      qc.invalidateQueries({ queryKey: ['workflow', id] });
      setShowApprovalForm(false);
    },
  });

  const loan = loanData?.data?.data;
  const workflow = workflowData?.data?.data;
  const auditEvents = auditData?.data?.data ?? [];

  if (!loan) return <div className="p-8 text-slate-500">Loading...</div>;

  const needsApproval = loan.status === 'AWAITING_HUMAN_APPROVAL';

  return (
    <div className="p-8 max-w-6xl">
      <Link href="/dashboard/loans" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6">
        <ChevronLeft className="w-4 h-4" /> Back to Applications
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{loan.applicant_first_name} {loan.applicant_last_name}</h1>
          <p className="text-slate-500 text-sm mt-1">Loan Request ID: <span className="font-mono">{id}</span></p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={loan.status} />
          {needsApproval && (
            <button
              onClick={() => setShowApprovalForm(true)}
              className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
            >
              Review & Decide
            </button>
          )}
        </div>
      </div>

      {/* Human Approval Form */}
      {showApprovalForm && (
        <div className="mb-6 bg-orange-50 border border-orange-200 rounded-xl p-6">
          <h3 className="font-semibold text-orange-900 mb-3">Human Review Decision</h3>
          <textarea
            value={approvalNotes}
            onChange={(e) => setApprovalNotes(e.target.value)}
            placeholder="Enter your review notes..."
            className="w-full border border-orange-300 rounded-lg p-3 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
            rows={3}
          />
          <div className="flex gap-3">
            <button
              onClick={() => approvalMutation.mutate('APPROVE')}
              disabled={approvalMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" /> Approve
            </button>
            <button
              onClick={() => approvalMutation.mutate('REJECT')}
              disabled={approvalMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" /> Reject
            </button>
            <button onClick={() => setShowApprovalForm(false)} className="px-4 py-2 text-slate-600 text-sm border border-slate-300 rounded-lg hover:bg-slate-50">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Applicant Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><FileText className="w-4 h-4" /> Loan Details</h2>
            <dl className="grid grid-cols-2 gap-4">
              {[
                { label: 'Loan Type', value: loan.loan_type },
                { label: 'Requested Amount', value: `$${parseFloat(loan.requested_amount).toLocaleString()}` },
                { label: 'Term', value: `${loan.requested_term_months} months` },
                { label: 'Purpose', value: loan.purpose },
                { label: 'Credit Score', value: loan.applicant_credit_score },
                { label: 'Annual Income', value: `$${parseFloat(loan.applicant_annual_income ?? 0).toLocaleString()}` },
                { label: 'Employment', value: loan.applicant_employment_status },
                { label: 'KYC Verified', value: loan.applicant_kyc_verified ? '✓ Verified' : '✗ Not Verified' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <dt className="text-xs text-slate-500 mb-0.5">{label}</dt>
                  <dd className="text-sm font-medium text-slate-900">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Workflow State */}
          {workflow && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><Clock className="w-4 h-4" /> Workflow State</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <dt className="text-xs text-slate-500">Status</dt>
                  <dd><StatusBadge status={workflow.status} /></dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Current Step</dt>
                  <dd className="text-sm font-mono text-slate-700">{workflow.current_step ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Workflow ID</dt>
                  <dd className="text-xs font-mono text-slate-500">{workflow.temporal_workflow_id}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Trace ID</dt>
                  <dd className="text-xs font-mono text-slate-500">{workflow.trace_id?.substring(0, 16)}...</dd>
                </div>
              </div>
            </div>
          )}

          {/* Audit Timeline */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Audit Trail</h2>
            {auditEvents.length === 0 ? (
              <p className="text-slate-400 text-sm">No audit events yet</p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {auditEvents.map((event: Record<string, string>) => (
                  <div key={event.id} className="flex gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-slate-800">{event.event_type}</div>
                      <div className="text-xs text-slate-500">{event.service_name} • {new Date(event.created_at).toLocaleString()}</div>
                      <div className="text-xs font-mono text-slate-400">trace: {event.trace_id?.substring(0, 16)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* AI Risk Panel */}
        <div className="space-y-4">
          {loan.risk_score && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><Brain className="w-4 h-4" /> AI Risk Analysis</h2>
              <div className="text-center mb-4">
                <div className="text-4xl font-bold" style={{ color: loan.risk_level === 'LOW' ? '#22c55e' : loan.risk_level === 'MEDIUM' ? '#f59e0b' : '#ef4444' }}>
                  {(parseFloat(loan.risk_score) * 100).toFixed(0)}
                </div>
                <div className="text-sm text-slate-500">Risk Score /100</div>
                <div className="mt-2"><StatusBadge status={loan.risk_level} /></div>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <div className="text-xs text-slate-500 mb-1">AI Recommendation</div>
                <div className="font-semibold text-slate-800">{loan.ai_recommendation}</div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-800 mb-4">External Links</h2>
            <div className="space-y-2">
              {[
                { label: 'Temporal Workflow', href: `${process.env.NEXT_PUBLIC_TEMPORAL_UI_URL ?? 'http://localhost:8088'}/namespaces/loan-governance/workflows/loan-${id}` },
                { label: 'Grafana Trace', href: `${process.env.NEXT_PUBLIC_GRAFANA_URL ?? 'http://localhost:3100'}/explore` },
              ].map(({ label, href }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700">
                  ↗ {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

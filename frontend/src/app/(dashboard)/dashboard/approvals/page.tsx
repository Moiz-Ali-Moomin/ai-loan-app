'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { StatusBadge } from '@/components/ui/StatusBadge';
import Link from 'next/link';
import { useState } from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface ApprovalRecord {
  id: string;
  loan_request_id: string;
  risk_score: number;
  ai_recommendation: string;
  policy_flags: string[];
  status: string;
  reason: string;
  due_at: string;
  assigned_at: string;
  applicant_first_name?: string;
  applicant_last_name?: string;
  requested_amount?: number;
  loan_type?: string;
}

function ApprovalModal({
  record,
  onClose,
}: {
  record: ApprovalRecord;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [notes, setNotes] = useState('');

  const mutation = useMutation({
    mutationFn: (decision: 'APPROVE' | 'REJECT') =>
      api.post(`/loans/${record.loan_request_id}/approval`, { decision, notes }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['approvals'] });
      onClose();
    },
  });

  const hoursLeft = Math.max(
    0,
    Math.floor((new Date(record.due_at).getTime() - Date.now()) / 3_600_000)
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Human Review Required</h2>
            <span className={`text-sm font-medium px-2 py-1 rounded-full ${hoursLeft < 4 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
              {hoursLeft}h remaining
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Loan ID: <span className="font-mono">{record.loan_request_id?.substring(0, 12)}...</span>
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-xs text-slate-500 mb-1">AI Risk Score</div>
              <div className="text-2xl font-bold text-slate-900">
                {(record.risk_score * 100).toFixed(0)}
                <span className="text-sm font-normal text-slate-500">/100</span>
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-xs text-slate-500 mb-1">AI Recommendation</div>
              <StatusBadge status={record.ai_recommendation} />
            </div>
          </div>

          {record.policy_flags && record.policy_flags.length > 0 && (
            <div>
              <div className="text-xs font-medium text-slate-600 mb-2">Policy Flags</div>
              <div className="flex flex-wrap gap-1">
                {record.policy_flags.map((flag: string) => (
                  <span key={flag} className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                    {flag.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="text-xs font-medium text-slate-600 mb-2">Escalation Reason</div>
            <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3">{record.reason}</p>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 block mb-2">
              Review Notes <span className="text-red-500">*</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Document your review rationale for the audit trail..."
              rows={3}
              className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        <div className="p-6 pt-0 flex items-center gap-3">
          <button
            onClick={() => mutation.mutate('APPROVE')}
            disabled={mutation.isPending || !notes.trim()}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-40 transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            Approve
          </button>
          <button
            onClick={() => mutation.mutate('REJECT')}
            disabled={mutation.isPending || !notes.trim()}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-40 transition-colors"
          >
            <XCircle className="w-4 h-4" />
            Reject
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ApprovalsPage() {
  const [selected, setSelected] = useState<ApprovalRecord | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['approvals'],
    queryFn: () =>
      api.get('/loans', { params: { status: 'AWAITING_HUMAN_APPROVAL', limit: 50 } }),
    refetchInterval: 10_000,
  });

  const loans = (data?.data?.data ?? []) as ApprovalRecord[];

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Pending Reviews</h1>
        <p className="text-slate-500 mt-1">Loan applications awaiting human decision</p>
      </div>

      {loans.length > 0 && (
        <div className="mb-4 flex items-center gap-2 text-sm text-orange-700 bg-orange-50 border border-orange-200 rounded-lg px-4 py-3">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{loans.length} application{loans.length !== 1 ? 's' : ''} require your review</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              {['Applicant', 'Amount', 'Risk Score', 'AI Rec.', 'Policy Flags', 'Due', ''].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                  Loading...
                </td>
              </tr>
            )}
            {loans.map((loan) => {
              const dueDate = new Date(loan.due_at ?? Date.now() + 86400_000);
              const hoursLeft = Math.max(0, Math.floor((dueDate.getTime() - Date.now()) / 3_600_000));
              const urgent = hoursLeft < 4;

              return (
                <tr key={loan.id ?? loan.loan_request_id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900 text-sm">
                      {loan.applicant_first_name} {loan.applicant_last_name}
                    </div>
                    <Link
                      href={`/dashboard/loans/${loan.loan_request_id ?? loan.id}`}
                      className="text-xs text-brand-600 hover:underline font-mono"
                    >
                      {(loan.loan_request_id ?? loan.id)?.substring(0, 12)}...
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                    ${parseFloat(String(loan.requested_amount ?? 0)).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-10 h-2 rounded-full bg-slate-200 overflow-hidden"
                        title={`Risk: ${(loan.risk_score * 100).toFixed(0)}%`}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${loan.risk_score * 100}%`,
                            backgroundColor:
                              loan.risk_score > 0.75
                                ? '#ef4444'
                                : loan.risk_score > 0.55
                                ? '#f97316'
                                : '#22c55e',
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-slate-700">
                        {(loan.risk_score * 100).toFixed(0)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={loan.ai_recommendation ?? 'MANUAL_REVIEW'} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {(loan.policy_flags ?? []).slice(0, 2).map((f: string) => (
                        <span key={f} className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">
                          {f.replace(/_/g, ' ')}
                        </span>
                      ))}
                      {(loan.policy_flags ?? []).length > 2 && (
                        <span className="text-xs text-slate-400">+{(loan.policy_flags ?? []).length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <Clock className={`w-3.5 h-3.5 ${urgent ? 'text-red-500' : 'text-slate-400'}`} />
                      <span className={`text-sm ${urgent ? 'text-red-600 font-semibold' : 'text-slate-500'}`}>
                        {hoursLeft}h left
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelected(loan)}
                      className="px-3 py-1.5 bg-brand-600 text-white text-xs font-semibold rounded-lg hover:bg-brand-700 transition-colors"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              );
            })}
            {!isLoading && loans.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center">
                  <div className="text-green-600 font-medium mb-1">All clear!</div>
                  <div className="text-slate-400 text-sm">No applications pending human review</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && <ApprovalModal record={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

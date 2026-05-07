'use client';
import { useQuery } from '@tanstack/react-query';
import { loansApi } from '@/lib/api';
import { StatusBadge } from '@/components/ui/StatusBadge';
import Link from 'next/link';
import { useState } from 'react';

export default function LoansPage() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['loans', page, status],
    queryFn: () => loansApi.list({ page, limit: 20, status: status || undefined }),
    refetchInterval: 15000,
  });

  const loans = data?.data?.data ?? [];
  const total = data?.data?.total ?? 0;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Loan Applications</h1>
          <p className="text-slate-500 text-sm">{total} total applications</p>
        </div>
        <div className="flex items-center gap-3">
        <Link
          href="/dashboard/loans/new"
          className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-lg hover:bg-brand-700 transition-colors"
        >
          + New Application
        </Link>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">All Status</option>
          {['PENDING', 'IN_REVIEW', 'AWAITING_HUMAN_APPROVAL', 'APPROVED', 'REJECTED', 'ESCALATED'].map(s => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              {['Applicant', 'Type', 'Amount', 'Credit Score', 'Status', 'Workflow', 'Submitted', ''].map(h => (
                <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && <tr><td colSpan={8} className="px-6 py-12 text-center text-slate-400">Loading...</td></tr>}
            {loans.map((loan: Record<string, string>) => (
              <tr key={loan.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900 text-sm">{loan.applicant_first_name} {loan.applicant_last_name}</div>
                  <div className="text-xs text-slate-400 font-mono">{loan.id?.substring(0, 8)}...</div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{loan.loan_type}</td>
                <td className="px-6 py-4 text-sm font-semibold text-slate-900">${parseFloat(loan.requested_amount).toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{loan.applicant_credit_score}</td>
                <td className="px-6 py-4"><StatusBadge status={loan.status} /></td>
                <td className="px-6 py-4">{loan.workflow_status ? <StatusBadge status={loan.workflow_status} /> : <span className="text-slate-300">—</span>}</td>
                <td className="px-6 py-4 text-xs text-slate-500">{new Date(loan.submitted_at).toLocaleString()}</td>
                <td className="px-6 py-4">
                  <Link href={`/dashboard/loans/${loan.id}`} className="text-brand-600 hover:underline text-sm font-medium">View →</Link>
                </td>
              </tr>
            ))}
            {!isLoading && loans.length === 0 && (
              <tr><td colSpan={8} className="px-6 py-12 text-center text-slate-400">No applications found</td></tr>
            )}
          </tbody>
        </table>
        {total > 20 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
            <span className="text-sm text-slate-500">Page {page} of {Math.ceil(total / 20)}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1 text-sm border border-slate-300 rounded disabled:opacity-40 hover:bg-slate-50">Prev</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 20)}
                className="px-3 py-1 text-sm border border-slate-300 rounded disabled:opacity-40 hover:bg-slate-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';
import { useQuery } from '@tanstack/react-query';
import { auditApi } from '@/lib/api';
import { useState } from 'react';
import { Shield, Search, CheckCircle, XCircle, ChevronDown, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface AuditRecord {
  id: string;
  event_type: string;
  actor_type: string;
  service_name: string;
  loan_request_id?: string;
  trace_id?: string;
  correlation_id?: string;
  created_at: string;
  payload?: Record<string, unknown>;
}

const EVENT_COLORS: Record<string, string> = {
  LOAN_REQUEST_SUBMITTED: 'bg-blue-100 text-blue-700',
  WORKFLOW_STARTED: 'bg-sky-100 text-sky-700',
  WORKFLOW_STEP_STARTED: 'bg-slate-100 text-slate-600',
  WORKFLOW_STEP_COMPLETED: 'bg-green-100 text-green-700',
  WORKFLOW_STEP_FAILED: 'bg-red-100 text-red-700',
  POLICY_EVALUATED: 'bg-purple-100 text-purple-700',
  FRAUD_ANALYSIS_COMPLETED: 'bg-orange-100 text-orange-700',
  AI_DECISION_MADE: 'bg-violet-100 text-violet-700',
  HUMAN_APPROVAL_REQUESTED: 'bg-amber-100 text-amber-700',
  HUMAN_APPROVAL_RECEIVED: 'bg-teal-100 text-teal-700',
  LOAN_APPROVED: 'bg-green-100 text-green-800',
  LOAN_REJECTED: 'bg-red-100 text-red-800',
  LOAN_ESCALATED: 'bg-orange-100 text-orange-800',
  WORKFLOW_COMPLETED: 'bg-emerald-100 text-emerald-700',
  WORKFLOW_FAILED: 'bg-red-100 text-red-700',
};

function PayloadRow({ record }: { record: AuditRecord }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <tr
        className="hover:bg-slate-50 transition-colors cursor-pointer"
        onClick={() => setOpen((o) => !o)}
      >
        <td className="px-5 py-3">
          <div className="flex items-center gap-1.5">
            {open ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${EVENT_COLORS[record.event_type] ?? 'bg-slate-100 text-slate-600'}`}>
              {record.event_type.replace(/_/g, ' ')}
            </span>
          </div>
        </td>
        <td className="px-5 py-3 text-xs font-medium text-slate-600">{record.actor_type}</td>
        <td className="px-5 py-3 text-xs text-slate-500 font-mono">{record.service_name}</td>
        <td className="px-5 py-3">
          {record.loan_request_id ? (
            <Link
              href={`/dashboard/loans/${record.loan_request_id}`}
              className="text-xs font-mono text-brand-600 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {record.loan_request_id.substring(0, 12)}...
            </Link>
          ) : <span className="text-slate-300">—</span>}
        </td>
        <td className="px-5 py-3 text-xs font-mono text-slate-400">
          {record.trace_id ? record.trace_id.substring(0, 16) + '...' : '—'}
        </td>
        <td className="px-5 py-3 text-xs text-slate-400 whitespace-nowrap">
          {new Date(record.created_at).toLocaleString()}
        </td>
      </tr>
      {open && (
        <tr className="bg-slate-50">
          <td colSpan={6} className="px-8 py-3">
            <pre className="text-xs text-slate-600 bg-slate-100 rounded-lg p-3 overflow-x-auto max-h-40">
              {JSON.stringify(record.payload ?? {}, null, 2)}
            </pre>
          </td>
        </tr>
      )}
    </>
  );
}

export default function AuditPage() {
  const [loanIdFilter, setLoanIdFilter] = useState('');
  const [integrityLoanId, setIntegrityLoanId] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['audit-activity'],
    queryFn: () => auditApi.getActivity({ limit: 200 }),
    refetchInterval: 15_000,
  });

  const { data: integrityData, refetch: checkIntegrity, isFetching: checkingIntegrity } = useQuery({
    queryKey: ['audit-integrity', integrityLoanId],
    queryFn: () => auditApi.checkIntegrity(integrityLoanId),
    enabled: false,
  });

  const allRecords: AuditRecord[] = data?.data?.data ?? [];
  const filtered = loanIdFilter
    ? allRecords.filter((r) => r.loan_request_id?.toLowerCase().includes(loanIdFilter.toLowerCase()) ||
        r.trace_id?.toLowerCase().includes(loanIdFilter.toLowerCase()))
    : allRecords;

  const integrityResult = integrityData?.data?.data as { valid: boolean; brokenAt?: string } | undefined;

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-brand-600" />
            Audit Trail
          </h1>
          <p className="text-slate-500 mt-1">
            Immutable, hash-chained audit records — {allRecords.length} total events
          </p>
        </div>

        {/* Integrity checker */}
        <div className="flex items-center gap-2">
          <input
            value={integrityLoanId}
            onChange={(e) => setIntegrityLoanId(e.target.value)}
            placeholder="Loan ID to verify…"
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            onClick={() => checkIntegrity()}
            disabled={!integrityLoanId || checkingIntegrity}
            className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-40 transition-colors whitespace-nowrap"
          >
            Verify Chain
          </button>
          {integrityResult && (
            <div className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium ${integrityResult.valid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {integrityResult.valid
                ? <><CheckCircle className="w-4 h-4" /> Chain intact</>
                : <><XCircle className="w-4 h-4" /> Broken at {integrityResult.brokenAt?.substring(0, 8)}</>
              }
            </div>
          )}
        </div>
      </div>

      {/* Filter */}
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={loanIdFilter}
          onChange={(e) => setLoanIdFilter(e.target.value)}
          placeholder="Filter by Loan ID or Trace ID…"
          className="pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm w-80 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        {loanIdFilter && (
          <span className="ml-2 text-sm text-slate-500">{filtered.length} results</span>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                {['Event', 'Actor', 'Service', 'Loan ID', 'Trace ID', 'Timestamp'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">Loading audit records…</td></tr>
              )}
              {filtered.map((record) => (
                <PayloadRow key={record.id} record={record} />
              ))}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    {loanIdFilter ? 'No records match your filter' : 'No audit records yet'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-400 text-center">
        Records are SHA-256 hash-chained and protected by SQL-level UPDATE/DELETE prevention.
        Each row links to the previous record&apos;s hash for tamper detection.
      </p>
    </div>
  );
}

'use client';
import { useQuery } from '@tanstack/react-query';
import { policyApi } from '@/lib/api';
import { useState } from 'react';
import { ShieldCheck, CheckCircle, XCircle } from 'lucide-react';

interface PolicyEvaluation {
  id: string;
  loan_request_id: string;
  policy_name: string;
  policy_version: string;
  passed: boolean;
  flags: string[];
  evaluated_at: string;
}

interface PolicyVersion {
  id: string;
  name: string;
  version: string;
  active: boolean;
  created_at: string;
}

export default function PoliciesPage() {
  const [tab, setTab] = useState<'evaluations' | 'versions'>('evaluations');

  const { data: evalData, isLoading: evalLoading } = useQuery({
    queryKey: ['policy-evaluations'],
    queryFn: () => policyApi.getEvaluations({ limit: 100 }),
    refetchInterval: 20_000,
    enabled: tab === 'evaluations',
  });

  const { data: versionData, isLoading: versionLoading } = useQuery({
    queryKey: ['policy-versions'],
    queryFn: () => policyApi.getVersions(),
    enabled: tab === 'versions',
  });

  const evaluations: PolicyEvaluation[] = evalData?.data?.data ?? [];
  const versions: PolicyVersion[] = versionData?.data?.data ?? [];

  const passRate =
    evaluations.length > 0
      ? ((evaluations.filter((e) => e.passed).length / evaluations.length) * 100).toFixed(1)
      : '—';

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center gap-3">
        <ShieldCheck className="w-6 h-6 text-brand-600" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Policy Engine</h1>
          <p className="text-slate-500 mt-0.5">OPA policy evaluations and version history</p>
        </div>
      </div>

      {tab === 'evaluations' && evaluations.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Evaluations', value: evaluations.length },
            { label: 'Pass Rate', value: `${passRate}%` },
            { label: 'Flagged', value: evaluations.filter((e) => !e.passed).length },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="text-xs text-slate-500 font-medium mb-2">{label}</div>
              <div className="text-3xl font-bold text-slate-900">{value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-1 mb-6 bg-slate-100 rounded-lg p-1 w-fit">
        {(['evaluations', 'versions'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
              tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'evaluations' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                {['Result', 'Policy', 'Version', 'Loan ID', 'Flags', 'Evaluated'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {evalLoading && (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">Loading…</td></tr>
              )}
              {evaluations.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3">
                    {e.passed
                      ? <span className="flex items-center gap-1.5 text-green-700 text-xs font-semibold"><CheckCircle className="w-4 h-4" />Pass</span>
                      : <span className="flex items-center gap-1.5 text-red-700 text-xs font-semibold"><XCircle className="w-4 h-4" />Fail</span>
                    }
                  </td>
                  <td className="px-5 py-3 text-sm font-medium text-slate-800">{e.policy_name}</td>
                  <td className="px-5 py-3 text-xs font-mono text-slate-500">v{e.policy_version}</td>
                  <td className="px-5 py-3 text-xs font-mono text-brand-600">
                    {e.loan_request_id?.substring(0, 12)}…
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(e.flags ?? []).map((f) => (
                        <span key={f} className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">
                          {f.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-400 whitespace-nowrap">
                    {new Date(e.evaluated_at).toLocaleString()}
                  </td>
                </tr>
              ))}
              {!evalLoading && evaluations.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">No evaluations yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'versions' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                {['Policy Name', 'Version', 'Status', 'Created'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {versionLoading && (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400">Loading…</td></tr>
              )}
              {versions.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 text-sm font-medium text-slate-800">{v.name}</td>
                  <td className="px-5 py-3 text-xs font-mono text-slate-500">v{v.version}</td>
                  <td className="px-5 py-3">
                    {v.active
                      ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Active</span>
                      : <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Inactive</span>
                    }
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-400 whitespace-nowrap">
                    {new Date(v.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
              {!versionLoading && versions.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400">No policy versions found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

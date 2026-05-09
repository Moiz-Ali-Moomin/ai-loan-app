'use client';
import { useQuery } from '@tanstack/react-query';
import { aiApi } from '@/lib/api';
import { StatusBadge } from '@/components/ui/StatusBadge';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ScatterChart, Scatter, ZAxis, Cell,
} from 'recharts';

interface AIDecision {
  id: string;
  loan_request_id: string;
  risk_score: number;
  risk_level: string;
  recommendation: string;
  confidence: number;
  model_version: string;
  prompt_version: string;
  latency_ms: number;
  decided_at: string;
}

const RISK_COLORS: Record<string, string> = {
  LOW: '#22c55e',
  MEDIUM: '#f59e0b',
  HIGH: '#f97316',
  CRITICAL: '#ef4444',
};

export default function AIDecisionsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['ai-decisions'],
    queryFn: () => aiApi.listDecisions({ limit: 100 }),
    refetchInterval: 20_000,
  });

  const decisions: AIDecision[] = data?.data?.data ?? [];

  // Aggregations
  const byRiskLevel = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((level) => ({
    level,
    count: decisions.filter((d) => d.risk_level === level).length,
    color: RISK_COLORS[level],
  }));

  const byRecommendation = ['APPROVE', 'MANUAL_REVIEW', 'REJECT'].map((rec) => ({
    rec,
    count: decisions.filter((d) => d.recommendation === rec).length,
  }));

  const avgLatency =
    decisions.length > 0
      ? Math.round(decisions.reduce((s, d) => s + d.latency_ms, 0) / decisions.length)
      : 0;

  const avgConfidence =
    decisions.length > 0
      ? (decisions.reduce((s, d) => s + d.confidence, 0) / decisions.length).toFixed(2)
      : '—';

  const avgRiskScore =
    decisions.length > 0
      ? (decisions.reduce((s, d) => s + d.risk_score, 0) / decisions.length).toFixed(3)
      : '—';

  const scatterData = decisions.slice(0, 50).map((d) => ({
    x: d.risk_score,
    y: d.confidence,
    z: d.latency_ms,
    recommendation: d.recommendation,
  }));

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">AI Decisions</h1>
        <p className="text-slate-500 mt-1">Risk scoring history and model analytics</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Decisions', value: decisions.length, unit: '' },
          { label: 'Avg Risk Score', value: avgRiskScore, unit: '/1.0' },
          { label: 'Avg Confidence', value: avgConfidence, unit: '' },
          { label: 'Avg Latency', value: avgLatency, unit: 'ms' },
        ].map(({ label, value, unit }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="text-xs text-slate-500 font-medium mb-2">{label}</div>
            <div className="text-3xl font-bold text-slate-900">
              {value}
              <span className="text-sm font-normal text-slate-400 ml-1">{unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-4">Decisions by Risk Level</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byRiskLevel} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="level" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {byRiskLevel.map((entry) => (
                  <Cell key={entry.level} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-4">Recommendations</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byRecommendation} barSize={50}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="rec" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Risk Score vs Confidence scatter */}
      {scatterData.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-8">
          <h2 className="font-semibold text-slate-800 mb-1">Risk Score vs Confidence</h2>
          <p className="text-xs text-slate-400 mb-4">Bubble size = latency (ms)</p>
          <ResponsiveContainer width="100%" height={240}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" dataKey="x" name="Risk Score" domain={[0, 1]} tick={{ fontSize: 11 }} label={{ value: 'Risk Score', position: 'insideBottom', offset: -5, fontSize: 11 }} />
              <YAxis type="number" dataKey="y" name="Confidence" domain={[0, 1]} tick={{ fontSize: 11 }} label={{ value: 'Confidence', angle: -90, position: 'insideLeft', fontSize: 11 }} />
              <ZAxis type="number" dataKey="z" range={[40, 200]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ payload }) => {
                if (!payload?.length) return null;
                const d = payload[0].payload as typeof scatterData[0];
                return (
                  <div className="bg-white border border-slate-200 rounded-lg p-3 text-xs shadow-lg">
                    <div>Risk: <strong>{d.x.toFixed(3)}</strong></div>
                    <div>Confidence: <strong>{d.y.toFixed(3)}</strong></div>
                    <div>Latency: <strong>{d.z}ms</strong></div>
                    <div>Rec: <strong>{d.recommendation}</strong></div>
                  </div>
                );
              }} />
              <Scatter data={scatterData} fill="#0ea5e9" fillOpacity={0.7} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Decision Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Recent AI Decisions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                {['Loan ID', 'Risk Score', 'Risk Level', 'Recommendation', 'Confidence', 'Model', 'Prompt', 'Latency', 'Decided'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && (
                <tr><td colSpan={9} className="px-6 py-12 text-center text-slate-400">Loading...</td></tr>
              )}
              {decisions.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3">
                    <Link href={`/dashboard/loans/${d.loan_request_id}`} className="text-xs font-mono text-brand-600 hover:underline">
                      {d.loan_request_id?.substring(0, 12)}...
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${d.risk_score * 100}%`, backgroundColor: RISK_COLORS[d.risk_level] }} />
                      </div>
                      <span className="text-sm font-mono">{d.risk_score.toFixed(3)}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3"><StatusBadge status={d.risk_level} /></td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      d.recommendation === 'APPROVE' ? 'bg-green-100 text-green-800' :
                      d.recommendation === 'REJECT' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>{d.recommendation}</span>
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-600">{(d.confidence * 100).toFixed(0)}%</td>
                  <td className="px-5 py-3 text-xs font-mono text-slate-500">{d.model_version}</td>
                  <td className="px-5 py-3 text-xs font-mono text-slate-500">v{d.prompt_version}</td>
                  <td className="px-5 py-3 text-sm text-slate-600">{d.latency_ms}ms</td>
                  <td className="px-5 py-3 text-xs text-slate-400 whitespace-nowrap">
                    {new Date(d.decided_at).toLocaleString()}
                  </td>
                </tr>
              ))}
              {!isLoading && decisions.length === 0 && (
                <tr><td colSpan={9} className="px-6 py-12 text-center text-slate-400">No AI decisions yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

'use client';
import { useQuery } from '@tanstack/react-query';
import { loansApi } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileText, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import Link from 'next/link';


export default function DashboardPage() {
  const { data: loansData } = useQuery({
    queryKey: ['loans', 'recent'],
    queryFn: () => loansApi.list({ limit: 100 }),
    refetchInterval: 15000,
  });

  const loans = loansData?.data?.data ?? [];

  const stats = {
    total: loans.length,
    approved: loans.filter((l: Record<string, string>) => l.status === 'APPROVED').length,
    rejected: loans.filter((l: Record<string, string>) => l.status === 'REJECTED').length,
    pending: loans.filter((l: Record<string, string>) => ['PENDING', 'IN_REVIEW'].includes(l.status)).length,
    awaitingReview: loans.filter((l: Record<string, string>) => l.status === 'AWAITING_HUMAN_APPROVAL').length,
  };

  const statusDistribution = [
    { name: 'Approved', value: stats.approved, color: '#22c55e' },
    { name: 'Rejected', value: stats.rejected, color: '#ef4444' },
    { name: 'Pending', value: stats.pending, color: '#f59e0b' },
    { name: 'Review', value: stats.awaitingReview, color: '#a855f7' },
  ].filter(d => d.value > 0);

  const loanTypeData = Object.entries(
    loans.reduce((acc: Record<string, number>, l: Record<string, string>) => {
      acc[l.loan_type] = (acc[l.loan_type] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([name, count]) => ({ name, count }));

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
        <p className="text-slate-500 mt-1">Loan applications at a glance</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Total Applications', value: stats.total, icon: FileText, color: 'blue' },
          { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'green' },
          { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'red' },
          { label: 'In Progress', value: stats.pending, icon: Clock, color: 'yellow' },
          { label: 'Awaiting Review', value: stats.awaitingReview, icon: AlertTriangle, color: 'orange' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-500 font-medium">{label}</span>
              <Icon className={`w-4 h-4 text-${color}-500`} />
            </div>
            <div className="text-3xl font-bold text-slate-900">{value}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-4">Loan Types Distribution</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={loanTypeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-4">Decision Status</h2>
          {statusDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusDistribution} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {statusDistribution.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-slate-400">No data yet</div>
          )}
        </div>
      </div>

      {/* Recent Applications */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Recent Applications</h2>
          <Link href="/dashboard/loans" className="text-brand-600 hover:text-brand-700 text-sm font-medium">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 text-left">
                {['Applicant', 'Type', 'Amount', 'Status', 'Submitted', ''].map((h) => (
                  <th key={h} className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loans.slice(0, 10).map((loan: Record<string, string>) => (
                <tr key={loan.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900 text-sm">{loan.applicant_first_name} {loan.applicant_last_name}</div>
                    <div className="text-xs text-slate-500">{loan.applicant_email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{loan.loan_type}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">${parseFloat(loan.requested_amount).toLocaleString()}</td>
                  <td className="px-6 py-4"><StatusBadge status={loan.status} /></td>
                  <td className="px-6 py-4 text-sm text-slate-500">{new Date(loan.submitted_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <Link href={`/dashboard/loans/${loan.id}`} className="text-brand-600 hover:underline text-sm">View</Link>
                  </td>
                </tr>
              ))}
              {loans.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">No loan applications yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

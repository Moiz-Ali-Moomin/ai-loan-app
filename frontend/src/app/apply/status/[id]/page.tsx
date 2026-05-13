'use client';
import { useQuery } from '@tanstack/react-query';
import { publicLoansApi } from '@/lib/api';
import { CheckCircle, Clock, XCircle, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface StatusConfig {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  border: string;
  title: string;
  message: string;
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
  APPROVED: {
    icon: CheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    title: 'Congratulations — You\'re Approved!',
    message: 'Your loan application has been approved. A representative will contact you shortly with next steps.',
  },
  REJECTED: {
    icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    title: 'Application Not Approved',
    message: "We're sorry, we weren't able to approve your application at this time. You'll receive a detailed explanation by email.",
  },
  PENDING: {
    icon: Clock,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    title: 'Application Received',
    message: "We've received your application and it's queued for review. This usually takes just a few minutes.",
  },
  IN_REVIEW: {
    icon: Clock,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    title: 'Under Review',
    message: "Your application is actively being reviewed right now. Hang tight — we'll have an answer for you very soon.",
  },
  AWAITING_HUMAN_APPROVAL: {
    icon: AlertCircle,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    title: 'Final Review in Progress',
    message: 'Your application is with one of our loan specialists for a final check. This step typically takes 1–2 business hours.',
  },
  ESCALATED: {
    icon: AlertCircle,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    title: 'Additional Review Required',
    message: 'Your application requires additional review. A specialist will reach out to you within 1 business day.',
  },
  CANCELLED: {
    icon: XCircle,
    color: 'text-slate-500',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    title: 'Application Cancelled',
    message: 'This application has been cancelled. If you believe this is a mistake, please contact support.',
  },
};

function loanTypeLabel(raw: string) {
  const map: Record<string, string> = {
    PERSONAL: 'Personal Loan',
    BUSINESS: 'Business Loan',
    MORTGAGE: 'Mortgage',
    AUTO: 'Auto Loan',
    STUDENT: 'Student Loan',
  };
  return map[raw] ?? raw;
}

export default function ApplicationStatusPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['public-loan-status', id],
    queryFn: () => publicLoansApi.getStatus(id),
    refetchInterval: 30000,
    retry: 1,
  });

  const loan = data?.data?.data;
  const status = loan?.status ?? 'PENDING';
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
  const Icon = config.icon;

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <div className="w-10 h-10 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 text-sm">Looking up your application…</p>
      </div>
    );
  }

  if (isError || !loan) {
    return (
      <div className="text-center py-16">
        <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-7 h-7 text-red-500" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-2">Application Not Found</h2>
        <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">
          We couldn&apos;t find an application with that reference number. Double-check the number and try again.
        </p>
        <Link href="/apply/status" className="inline-flex items-center gap-2 text-sm text-brand-600 hover:underline font-medium">
          <ArrowLeft className="w-4 h-4" /> Try again
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <Link href="/apply/status" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      {/* Status card */}
      <div className={`rounded-2xl border p-6 mb-5 ${config.bg} ${config.border}`}>
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-white`}>
            <Icon className={`w-5 h-5 ${config.color}`} />
          </div>
          <div>
            <h2 className={`font-bold text-base ${config.color} mb-1`}>{config.title}</h2>
            <p className="text-sm text-slate-600 leading-relaxed">{config.message}</p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-4">
        <h3 className="font-semibold text-slate-800 mb-4 text-sm">Application Details</h3>
        <dl className="space-y-3">
          {[
            { label: 'Applicant', value: `${loan.applicant_first_name} ${loan.applicant_last_name}` },
            { label: 'Loan Type', value: loanTypeLabel(loan.loan_type) },
            { label: 'Amount Requested', value: `$${parseFloat(loan.requested_amount).toLocaleString()}` },
            { label: 'Term', value: `${loan.requested_term_months} months` },
            { label: 'Submitted', value: new Date(loan.submitted_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
            { label: 'Reference Number', value: id },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-baseline gap-4">
              <dt className="text-xs text-slate-500 shrink-0">{label}</dt>
              <dd className="text-sm font-medium text-slate-900 text-right font-mono truncate">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>Auto-refreshes every 30 seconds</span>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-1 text-brand-600 hover:text-brand-700 font-medium disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh now
        </button>
      </div>
    </div>
  );
}

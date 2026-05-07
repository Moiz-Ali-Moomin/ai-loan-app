'use client';

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING:                 { label: 'Pending',         className: 'bg-yellow-100 text-yellow-800' },
  IN_REVIEW:               { label: 'In Review',       className: 'bg-blue-100 text-blue-800' },
  AWAITING_HUMAN_APPROVAL: { label: 'Awaiting Review', className: 'bg-orange-100 text-orange-800' },
  APPROVED:                { label: 'Approved',        className: 'bg-green-100 text-green-800' },
  REJECTED:                { label: 'Rejected',        className: 'bg-red-100 text-red-800' },
  ESCALATED:               { label: 'Escalated',       className: 'bg-purple-100 text-purple-800' },
  CANCELLED:               { label: 'Cancelled',       className: 'bg-gray-100 text-gray-600' },
  RUNNING:                 { label: 'Running',         className: 'bg-blue-100 text-blue-800' },
  COMPLETED:               { label: 'Completed',       className: 'bg-green-100 text-green-800' },
  FAILED:                  { label: 'Failed',          className: 'bg-red-100 text-red-800' },
  LOW:                     { label: 'Low Risk',        className: 'bg-green-100 text-green-800' },
  MEDIUM:                  { label: 'Medium Risk',     className: 'bg-yellow-100 text-yellow-800' },
  HIGH:                    { label: 'High Risk',       className: 'bg-orange-100 text-orange-800' },
  CRITICAL:                { label: 'Critical Risk',   className: 'bg-red-100 text-red-800' },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? { label: status, className: 'bg-gray-100 text-gray-700' };
  return (
    <span className={`status-badge ${config.className}`}>
      {config.label}
    </span>
  );
}

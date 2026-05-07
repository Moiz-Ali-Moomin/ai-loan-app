'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, ShieldCheck, Brain, Activity, BookOpen, Settings } from 'lucide-react';
import { clsx } from 'clsx';

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/loans', label: 'Loan Applications', icon: FileText },
  { href: '/dashboard/approvals', label: 'Pending Reviews', icon: ShieldCheck },
  { href: '/dashboard/ai-decisions', label: 'AI Decisions', icon: Brain },
  { href: '/dashboard/audit', label: 'Audit Trail', icon: BookOpen },
  { href: '/dashboard/observability', label: 'Observability', icon: Activity },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col min-h-screen">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-sm">LoanGov AI</div>
            <div className="text-xs text-slate-400">Governance Platform</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
                ? 'bg-brand-600 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-3 px-3 py-2 text-slate-400 text-sm">
          <div className="w-7 h-7 bg-slate-700 rounded-full flex items-center justify-center text-xs font-bold text-white">A</div>
          <div>
            <div className="text-white text-xs font-medium">Admin User</div>
            <div className="text-slate-500 text-xs">admin@fintech.com</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

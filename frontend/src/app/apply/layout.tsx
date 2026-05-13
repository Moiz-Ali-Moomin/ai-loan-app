import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export default function ApplyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-100 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900">LoanGov</span>
          </Link>
          <Link href="/apply/status" className="text-sm text-slate-500 hover:text-slate-700 font-medium">
            Track existing application
          </Link>
        </div>
      </header>
      <main className="flex-1 py-10 px-6">
        <div className="max-w-3xl mx-auto">
          {children}
        </div>
      </main>
      <footer className="px-6 py-4 text-center text-xs text-slate-400 border-t border-slate-100 bg-white">
        Your information is encrypted and handled securely.
      </footer>
    </div>
  );
}

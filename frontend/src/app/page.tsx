import Link from 'next/link';
import { ShieldCheck, Clock, CheckCircle, ArrowRight, Search } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg">LoanGov</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/apply/status" className="text-sm text-slate-600 hover:text-slate-900 font-medium">
              Track Application
            </Link>
            <Link
              href="/login"
              className="text-sm text-slate-600 hover:text-slate-900 font-medium px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Staff Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-brand-100">
            <CheckCircle className="w-3.5 h-3.5" />
            Decisions in minutes, not days
          </div>
          <h1 className="text-5xl font-bold text-slate-900 mb-5 leading-tight">
            Get the loan you need,<br />
            <span className="text-brand-600">fast and fairly.</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto mb-10">
            Apply online in minutes. Our AI-powered review process gives you a decision quickly — with full transparency on why.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/apply"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors shadow-sm"
            >
              Apply Now <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/apply/status"
              className="inline-flex items-center gap-2 px-7 py-3.5 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
            >
              <Search className="w-4 h-4" /> Check Status
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="max-w-5xl mx-auto px-6 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Clock,
                title: 'Fast Decisions',
                description: 'Most applications are reviewed within minutes. No waiting days for a call back.',
              },
              {
                icon: ShieldCheck,
                title: 'Fair & Transparent',
                description: "You'll always know the reason for your decision. No black boxes.",
              },
              {
                icon: CheckCircle,
                title: 'Simple Process',
                description: 'Fill out one form, upload nothing, get a clear answer.',
              },
            ].map(({ icon: Icon, title, description }) => (
              <div key={title} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-brand-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Loan types */}
        <div className="bg-slate-50 border-t border-slate-100 py-14">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-6">We offer</p>
            <div className="flex flex-wrap justify-center gap-3">
              {['Personal Loans', 'Business Loans', 'Mortgages', 'Auto Loans', 'Student Loans'].map((type) => (
                <span key={type} className="px-5 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-700 shadow-sm">
                  {type}
                </span>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 px-6 py-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-slate-400">
          <span>© 2025 LoanGov. All rights reserved.</span>
          <span>Powered by AI — governed by humans.</span>
        </div>
      </footer>
    </div>
  );
}

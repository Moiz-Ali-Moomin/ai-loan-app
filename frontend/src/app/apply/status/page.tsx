'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export default function StatusLookupPage() {
  const [id, setId] = useState('');
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = id.trim();
    if (trimmed) router.push(`/apply/status/${trimmed}`);
  }

  return (
    <div className="max-w-md mx-auto py-8 text-center">
      <div className="w-14 h-14 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
        <Search className="w-7 h-7 text-brand-600" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Track Your Application</h1>
      <p className="text-slate-500 text-sm mb-8">
        Enter the reference number you received after submitting your application.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="Paste your reference number here"
          required
          className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white text-center font-mono"
        />
        <button
          type="submit"
          className="w-full py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors"
        >
          Check Status
        </button>
      </form>

      <p className="text-xs text-slate-400 mt-6">
        Can't find your reference number? Check the confirmation email we sent you, or{' '}
        <a href="mailto:support@loangov.com" className="text-brand-600 hover:underline">contact support</a>.
      </p>
    </div>
  );
}

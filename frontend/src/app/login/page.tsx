'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';

const DEFAULT_TENANT = 'default';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authApi.login(email, password, DEFAULT_TENANT);
      const token = res.data?.token ?? res.data?.access_token;
      if (token) localStorage.setItem('auth_token', token);
      router.push('/dashboard');
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 w-full max-w-sm">
        <div className="mb-7 text-center">
          <div className="w-11 h-11 bg-brand-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Staff Login</h1>
          <p className="text-slate-400 text-sm mt-1">LoanGov Administration</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-brand-600 text-white rounded-lg text-sm font-semibold hover:bg-brand-700 disabled:opacity-50 transition-colors mt-1"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <Link href="/" className="text-xs text-slate-400 hover:text-slate-600">
            ← Back to customer portal
          </Link>
        </div>
      </div>
    </div>
  );
}

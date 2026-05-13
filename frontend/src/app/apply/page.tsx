'use client';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { publicLoansApi } from '@/lib/api';
import { Loader2, CheckCircle, Copy, Check } from 'lucide-react';
import Link from 'next/link';

const DEFAULT_TENANT = '11111111-1111-1111-1111-111111111111';

const LOAN_TYPES = [
  { value: 'PERSONAL', label: 'Personal Loan' },
  { value: 'BUSINESS', label: 'Business Loan' },
  { value: 'MORTGAGE', label: 'Mortgage' },
  { value: 'AUTO', label: 'Auto Loan' },
  { value: 'STUDENT', label: 'Student Loan' },
];

const EMPLOYMENT_STATUSES = [
  { value: 'EMPLOYED', label: 'Employed' },
  { value: 'SELF_EMPLOYED', label: 'Self-Employed' },
  { value: 'UNEMPLOYED', label: 'Unemployed' },
  { value: 'RETIRED', label: 'Retired' },
];

const TERMS = [
  { value: 12, label: '1 year (12 months)' },
  { value: 24, label: '2 years (24 months)' },
  { value: 36, label: '3 years (36 months)' },
  { value: 48, label: '4 years (48 months)' },
  { value: 60, label: '5 years (60 months)' },
  { value: 84, label: '7 years (84 months)' },
  { value: 120, label: '10 years (120 months)' },
  { value: 180, label: '15 years (180 months)' },
  { value: 240, label: '20 years (240 months)' },
  { value: 360, label: '30 years (360 months)' },
];

interface FormState {
  loanType: string;
  requestedAmount: string;
  requestedTermMonths: string;
  purpose: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  ssn: string;
  employmentStatus: string;
  annualIncome: string;
  creditScore: string;
  existingDebt: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
}

const INITIAL: FormState = {
  loanType: 'PERSONAL',
  requestedAmount: '',
  requestedTermMonths: '36',
  purpose: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  ssn: '',
  employmentStatus: 'EMPLOYED',
  annualIncome: '',
  creditScore: '',
  existingDebt: '0',
  street: '',
  city: '',
  state: '',
  postalCode: '',
};

function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

const inputClass =
  'w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white transition-shadow';

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="font-semibold text-slate-900">{title}</h2>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function SuccessScreen({ loanId }: { loanId: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(loanId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
        <CheckCircle className="w-9 h-9 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Application Submitted!</h2>
      <p className="text-slate-500 text-sm mb-8 max-w-sm mx-auto">
        We&apos;ve received your application and it&apos;s being reviewed now. You&apos;ll typically hear back within minutes.
      </p>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 max-w-sm mx-auto mb-8">
        <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">Your Reference Number</p>
        <div className="flex items-center justify-center gap-2">
          <span className="font-mono text-base font-bold text-slate-900">{loanId}</span>
          <button onClick={copy} className="text-slate-400 hover:text-slate-600 transition-colors">
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-3">Save this — you&apos;ll need it to track your application.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href={`/apply/status/${loanId}`}
          className="px-6 py-3 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 transition-colors"
        >
          Track My Application
        </Link>
        <Link
          href="/"
          className="px-6 py-3 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default function ApplyPage() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const set = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const mutation = useMutation({
    mutationFn: () =>
      publicLoansApi.submit({
        tenantId: DEFAULT_TENANT,
        loanType: form.loanType,
        requestedAmount: parseFloat(form.requestedAmount),
        requestedTermMonths: parseInt(form.requestedTermMonths, 10),
        purpose: form.purpose,
        applicant: {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          dateOfBirth: form.dateOfBirth,
          nationalId: form.ssn,
          employmentStatus: form.employmentStatus,
          annualIncome: parseFloat(form.annualIncome),
          creditScore: parseInt(form.creditScore, 10),
          existingDebt: parseFloat(form.existingDebt || '0'),
          kycVerified: true,
          address: {
            street: form.street,
            city: form.city,
            state: form.state,
            postalCode: form.postalCode,
            country: 'US',
          },
        },
      }),
    onSuccess: (res) => {
      const id = res.data?.data?.loanRequestId ?? res.data?.data?.id;
      setSubmittedId(id);
    },
  });

  if (submittedId) return <SuccessScreen loanId={submittedId} />;

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Apply for a Loan</h1>
        <p className="text-slate-500 mt-1 text-sm">Fill in your details below. The whole form takes about 5 minutes.</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-5">
        {/* Loan Details */}
        <Section title="Loan Details" subtitle="Tell us what you need">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Loan Type" required>
              <select value={form.loanType} onChange={set('loanType')} className={inputClass}>
                {LOAN_TYPES.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </Field>
            <Field label="Amount Requested" required>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                <input
                  type="number" min="1000" step="1000"
                  value={form.requestedAmount} onChange={set('requestedAmount')}
                  placeholder="50,000" required
                  className={`${inputClass} pl-7`}
                />
              </div>
            </Field>
            <Field label="Repayment Term" required>
              <select value={form.requestedTermMonths} onChange={set('requestedTermMonths')} className={inputClass}>
                {TERMS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </Field>
            <Field label="What's the loan for?" required>
              <input
                type="text" value={form.purpose} onChange={set('purpose')}
                placeholder="e.g. Home renovation, new car, school fees…"
                required minLength={10}
                className={inputClass}
              />
            </Field>
          </div>
        </Section>

        {/* Personal Info */}
        <Section title="Your Information" subtitle="We keep your personal details secure and private">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="First Name" required>
              <input type="text" value={form.firstName} onChange={set('firstName')} required className={inputClass} />
            </Field>
            <Field label="Last Name" required>
              <input type="text" value={form.lastName} onChange={set('lastName')} required className={inputClass} />
            </Field>
            <Field label="Email Address" required>
              <input type="email" value={form.email} onChange={set('email')} required className={inputClass} placeholder="you@example.com" />
            </Field>
            <Field label="Phone Number" required>
              <input type="tel" value={form.phone} onChange={set('phone')} required className={inputClass} placeholder="+1 (555) 000-0000" />
            </Field>
            <Field label="Date of Birth" required>
              <input type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} required className={inputClass} />
            </Field>
            <Field label="Social Security Number (SSN)" required hint="Used for identity verification only. Never shared.">
              <input type="text" value={form.ssn} onChange={set('ssn')} required className={inputClass} placeholder="XXX-XX-XXXX" />
            </Field>
          </div>
        </Section>

        {/* Financial Info */}
        <Section title="Financial Information" subtitle="Helps us find the right loan terms for you">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Employment Status" required>
              <select value={form.employmentStatus} onChange={set('employmentStatus')} className={inputClass}>
                {EMPLOYMENT_STATUSES.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </Field>
            <Field label="Annual Income" required>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                <input
                  type="number" min="0" step="1000"
                  value={form.annualIncome} onChange={set('annualIncome')}
                  required className={`${inputClass} pl-7`}
                  placeholder="60,000"
                />
              </div>
            </Field>
            <Field
              label="Credit Score"
              required
              hint="Your FICO score, between 300 and 850. Check your bank app or Credit Karma for free."
            >
              <input
                type="number" min="300" max="850"
                value={form.creditScore} onChange={set('creditScore')}
                required className={inputClass}
                placeholder="e.g. 720"
              />
            </Field>
            <Field label="Existing Monthly Debt Payments" hint="Total of any existing loans, credit cards, etc. Enter 0 if none.">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                <input
                  type="number" min="0"
                  value={form.existingDebt} onChange={set('existingDebt')}
                  className={`${inputClass} pl-7`}
                  placeholder="0"
                />
              </div>
            </Field>
          </div>
        </Section>

        {/* Address */}
        <Section title="Home Address">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Field label="Street Address" required>
                <input type="text" value={form.street} onChange={set('street')} required className={inputClass} placeholder="123 Main St" />
              </Field>
            </div>
            <Field label="City" required>
              <input type="text" value={form.city} onChange={set('city')} required className={inputClass} />
            </Field>
            <Field label="State" required>
              <input type="text" value={form.state} onChange={set('state')} required className={inputClass} placeholder="CA" />
            </Field>
            <Field label="ZIP Code" required>
              <input type="text" value={form.postalCode} onChange={set('postalCode')} required className={inputClass} placeholder="90210" />
            </Field>
          </div>
        </Section>

        {mutation.isError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
            Something went wrong while submitting your application. Please try again or contact support.
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="flex items-center justify-center gap-2 px-7 py-3.5 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {mutation.isPending ? 'Submitting…' : 'Submit Application'}
          </button>
          <Link
            href="/"
            className="px-7 py-3.5 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors text-center"
          >
            Cancel
          </Link>
        </div>
      </form>
    </>
  );
}

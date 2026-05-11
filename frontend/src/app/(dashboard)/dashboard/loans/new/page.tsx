'use client';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { loansApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const DEFAULT_TENANT = '11111111-1111-1111-1111-111111111111';

interface FormState {
  tenantId: string;
  loanType: string;
  requestedAmount: string;
  requestedTermMonths: string;
  purpose: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  nationalId: string;
  employmentStatus: string;
  annualIncome: string;
  creditScore: string;
  existingDebt: string;
  kycVerified: boolean;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

const INITIAL: FormState = {
  tenantId: DEFAULT_TENANT,
  loanType: 'PERSONAL',
  requestedAmount: '',
  requestedTermMonths: '36',
  purpose: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  nationalId: '',
  employmentStatus: 'EMPLOYED',
  annualIncome: '',
  creditScore: '',
  existingDebt: '0',
  kycVerified: true,
  street: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'US',
};

function Field({
  label, required, children,
}: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  'w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white';

export default function NewLoanPage() {
  const _router = useRouter();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitted, setSubmitted] = useState<{ loanRequestId: string; workflowId: string } | null>(null);

  const set = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.type === 'checkbox'
      ? (e.target as HTMLInputElement).checked
      : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
  };

  const mutation = useMutation({
    mutationFn: () =>
      loansApi.submit({
        tenantId: form.tenantId,
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
          nationalId: form.nationalId,
          employmentStatus: form.employmentStatus,
          annualIncome: parseFloat(form.annualIncome),
          creditScore: parseInt(form.creditScore, 10),
          existingDebt: parseFloat(form.existingDebt),
          kycVerified: form.kycVerified,
          address: {
            street: form.street,
            city: form.city,
            state: form.state,
            postalCode: form.postalCode,
            country: form.country,
          },
        },
      }),
    onSuccess: (res) => {
      setSubmitted(res.data.data);
    },
  });

  if (submitted) {
    return (
      <div className="p-8 max-w-xl">
        <div className="bg-white rounded-2xl border border-green-200 p-8 text-center shadow-sm">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Application Submitted!</h2>
          <p className="text-slate-500 text-sm mb-6">
            Your loan application has been received and a governance workflow has been started.
          </p>
          <div className="bg-slate-50 rounded-lg p-4 text-left mb-6 space-y-2">
            <div>
              <span className="text-xs text-slate-500">Loan Request ID</span>
              <div className="font-mono text-sm text-slate-800">{submitted.loanRequestId}</div>
            </div>
            <div>
              <span className="text-xs text-slate-500">Temporal Workflow ID</span>
              <div className="font-mono text-sm text-slate-800">{submitted.workflowId}</div>
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <Link
              href={`/dashboard/loans/${submitted.loanRequestId}`}
              className="px-5 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-lg hover:bg-brand-700"
            >
              View Application
            </Link>
            <button
              onClick={() => { setForm(INITIAL); setSubmitted(null); }}
              className="px-5 py-2.5 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50"
            >
              Submit Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl">
      <Link href="/dashboard/loans" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6">
        <ChevronLeft className="w-4 h-4" /> Back to Applications
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">New Loan Application</h1>
        <p className="text-slate-500 mt-1">Submit a loan application for AI governance processing</p>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}
        className="space-y-6"
      >
        {/* Loan Details */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-4">Loan Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Loan Type" required>
              <select value={form.loanType} onChange={set('loanType')} className={inputClass}>
                {['PERSONAL', 'BUSINESS', 'MORTGAGE', 'AUTO', 'STUDENT'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </Field>
            <Field label="Requested Amount ($)" required>
              <input type="number" min="1000" step="1000" value={form.requestedAmount} onChange={set('requestedAmount')} placeholder="50000" required className={inputClass} />
            </Field>
            <Field label="Term (months)" required>
              <select value={form.requestedTermMonths} onChange={set('requestedTermMonths')} className={inputClass}>
                {[12, 24, 36, 48, 60, 84, 120, 180, 240, 360].map((t) => (
                  <option key={t} value={t}>{t} months</option>
                ))}
              </select>
            </Field>
            <Field label="Purpose" required>
              <input type="text" value={form.purpose} onChange={set('purpose')} placeholder="Describe the loan purpose…" required minLength={10} className={inputClass} />
            </Field>
          </div>
        </div>

        {/* Applicant */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-4">Applicant Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="First Name" required>
              <input type="text" value={form.firstName} onChange={set('firstName')} required className={inputClass} />
            </Field>
            <Field label="Last Name" required>
              <input type="text" value={form.lastName} onChange={set('lastName')} required className={inputClass} />
            </Field>
            <Field label="Email" required>
              <input type="email" value={form.email} onChange={set('email')} required className={inputClass} />
            </Field>
            <Field label="Phone" required>
              <input type="tel" value={form.phone} onChange={set('phone')} required className={inputClass} />
            </Field>
            <Field label="Date of Birth" required>
              <input type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} required className={inputClass} />
            </Field>
            <Field label="National ID / SSN" required>
              <input type="text" value={form.nationalId} onChange={set('nationalId')} required className={inputClass} />
            </Field>
            <Field label="Employment Status" required>
              <select value={form.employmentStatus} onChange={set('employmentStatus')} className={inputClass}>
                {['EMPLOYED', 'SELF_EMPLOYED', 'UNEMPLOYED', 'RETIRED'].map((s) => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
            </Field>
            <Field label="Annual Income ($)" required>
              <input type="number" min="0" step="1000" value={form.annualIncome} onChange={set('annualIncome')} required className={inputClass} />
            </Field>
            <Field label="Credit Score (300–850)" required>
              <input type="number" min="300" max="850" value={form.creditScore} onChange={set('creditScore')} required className={inputClass} />
            </Field>
            <Field label="Existing Debt ($)">
              <input type="number" min="0" value={form.existingDebt} onChange={set('existingDebt')} className={inputClass} />
            </Field>
            <div className="col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.kycVerified} onChange={set('kycVerified')} className="w-4 h-4 accent-brand-600" />
                <span className="text-sm text-slate-700 font-medium">KYC Verification Completed</span>
              </label>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-4">Address</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Field label="Street Address" required>
                <input type="text" value={form.street} onChange={set('street')} required className={inputClass} />
              </Field>
            </div>
            <Field label="City" required>
              <input type="text" value={form.city} onChange={set('city')} required className={inputClass} />
            </Field>
            <Field label="State" required>
              <input type="text" value={form.state} onChange={set('state')} required className={inputClass} />
            </Field>
            <Field label="Postal Code" required>
              <input type="text" value={form.postalCode} onChange={set('postalCode')} required className={inputClass} />
            </Field>
            <Field label="Country">
              <input type="text" value={form.country} onChange={set('country')} className={inputClass} />
            </Field>
          </div>
        </div>

        {mutation.isError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
            Submission failed. Check API gateway is running and you are logged in.
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {mutation.isPending ? 'Submitting…' : 'Submit Application'}
          </button>
          <Link
            href="/dashboard/loans"
            className="px-6 py-3 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

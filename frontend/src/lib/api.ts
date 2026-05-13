import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
});

// Unauthenticated client for public-facing pages (apply flow, status tracker)
export const publicApi = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Loans ────────────────────────────────────────────────────
export const loansApi = {
  list: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get('/loans', { params }),
  get: (id: string) => api.get(`/loans/${id}`),
  submit: (data: unknown) => api.post('/loans', data),
  getWorkflow: (id: string) => api.get(`/loans/${id}/workflow`),
  getAudit: (id: string) => api.get(`/loans/${id}/audit`),
  submitApproval: (id: string, data: { decision: 'APPROVE' | 'REJECT'; notes: string }) =>
    api.post(`/loans/${id}/approval`, data),
};

// ── Auth ─────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string, tenantId: string) =>
    api.post('/auth/login', { email, password, tenantId }),
  me: () => api.get('/auth/me'),
};

// ── AI Decisions (proxied via gateway) ──────────────────────
export const aiApi = {
  listDecisions: (params?: { limit?: number }) =>
    api.get('/ai/decisions', { params }),
  getDecisionsForLoan: (loanRequestId: string) =>
    api.get(`/ai/decisions/${loanRequestId}`),
};

// ── Audit (proxied via gateway) ──────────────────────────────
export const auditApi = {
  getActivity: (params?: { limit?: number; tenantId?: string }) =>
    api.get('/audit/activity', { params }),
  getByLoan: (loanRequestId: string) =>
    api.get(`/audit/loans/${loanRequestId}`),
  getLineage: (loanRequestId: string) =>
    api.get(`/audit/loans/${loanRequestId}/lineage`),
  checkIntegrity: (loanRequestId: string) =>
    api.get(`/audit/loans/${loanRequestId}/integrity`),
};

// ── Policy (proxied via gateway) ─────────────────────────────
export const policyApi = {
  getEvaluations: (params?: { limit?: number }) =>
    api.get('/policies/evaluations', { params }),
  getVersions: (params?: { name?: string; active?: string }) =>
    api.get('/policies/versions', { params }),
};

// ── Public (no auth required) ────────────────────────────────
export const publicLoansApi = {
  submit: (data: unknown) => publicApi.post('/loans', data),
  getStatus: (id: string) => publicApi.get(`/loans/${id}`),
};

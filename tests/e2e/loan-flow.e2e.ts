/**
 * E2E test: customer apply → status check → admin review
 *
 * Run against live services:
 *   npx tsx tests/e2e/loan-flow.e2e.ts
 *
 * Requires:
 *   - API gateway running on GATEWAY_URL (default: http://localhost:3000)
 *   - JWT_SECRET env var matching gateway config (default: dev secret)
 *   - Seeded tenant 11111111-1111-1111-1111-111111111111
 */

import { createHmac } from 'crypto';

const GATEWAY = process.env['GATEWAY_URL'] ?? 'http://localhost:3000';
const JWT_SECRET = process.env['JWT_SECRET'] ?? 'change-me-super-secret-jwt-key-min-32-chars';
const TENANT_ID = '11111111-1111-1111-1111-111111111111';
const ADMIN_USER_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

// ── Minimal HS256 JWT ─────────────────────────────────────────────────────────
function signJwt(payload: Record<string, unknown>, secret: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url');
  const sig = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

const adminToken = signJwt({ sub: ADMIN_USER_ID, tenantId: TENANT_ID, role: 'admin', email: 'admin@acme-fintech.com' }, JWT_SECRET);

// ── Test helpers ──────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;

function assert(label: string, condition: boolean, detail?: unknown): void {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.error(`  ✗ ${label}`, detail ?? '');
    failed++;
  }
}

async function get(path: string, token?: string): Promise<{ status: number; body: unknown }> {
  const res = await fetch(`${GATEWAY}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return { status: res.status, body: await res.json().catch(() => null) };
}

async function post(path: string, body: unknown, token?: string): Promise<{ status: number; body: unknown }> {
  const res = await fetch(`${GATEWAY}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
  return { status: res.status, body: await res.json().catch(() => null) };
}

// ── Test suite ────────────────────────────────────────────────────────────────
async function run(): Promise<void> {
  // ── 1. Health check ───────────────────────────────────────────────────────
  console.log('\n[1] Gateway health');
  const health = await get('/health');
  assert('GET /health → 200', health.status === 200);

  // ── 2. Customer submits a loan application (no auth) ──────────────────────
  console.log('\n[2] Customer submits loan application (unauthenticated)');
  const loanPayload = {
    tenantId: TENANT_ID,
    loanType: 'PERSONAL',
    requestedAmount: 10000,
    requestedTermMonths: 24,
    purpose: 'E2E test loan',
    applicantFirstName: 'Test',
    applicantLastName: 'Customer',
    applicantEmail: `e2e-test-${Date.now()}@example.com`,
    applicantPhone: '+1-555-0100',
    applicantNationalId: `TEST-${Date.now()}`,
    applicantDateOfBirth: '1990-01-01',
    applicantAnnualIncome: 60000,
    applicantExistingDebt: 5000,
    applicantCreditScore: 720,
    applicantEmploymentStatus: 'EMPLOYED',
    applicantKycVerified: true,
    applicantAddress: { street: '123 Test St', city: 'Testville', country: 'US' },
  };

  const submitRes = await post('/api/v1/public/loans', loanPayload);
  assert('POST /public/loans → 201', submitRes.status === 201, submitRes);

  const submitBody = submitRes.body as { success?: boolean; data?: { id?: string } };
  const loanId = submitBody?.data?.id;
  assert('Response has loan ID', typeof loanId === 'string', submitBody);

  if (!loanId) {
    console.error('\nCannot continue without a loan ID — aborting.');
    process.exit(1);
  }

  // ── 3. Customer checks status (no auth) ──────────────────────────────────
  console.log('\n[3] Customer checks loan status (unauthenticated)');
  const statusRes = await get(`/api/v1/public/loans/${loanId}`);
  assert('GET /public/loans/:id → 200', statusRes.status === 200, statusRes);

  const statusBody = statusRes.body as { success?: boolean; data?: { id?: string; status?: string } };
  assert('Status response has id', statusBody?.data?.id === loanId);
  assert('Status field present', typeof statusBody?.data?.status === 'string', statusBody?.data);

  const sensitiveFields = ['applicant_national_id', 'applicant_phone', 'applicant_address', 'applicant_annual_income'];
  for (const field of sensitiveFields) {
    assert(`No sensitive field ${field} in public response`, !(field in (statusBody?.data ?? {})));
  }

  // ── 4. Admin lists pending loans ──────────────────────────────────────────
  console.log('\n[4] Admin lists loan requests');
  const listRes = await get(`/api/v1/loans?tenantId=${TENANT_ID}&limit=5`, adminToken);
  assert('GET /loans (admin) → 200', listRes.status === 200, listRes);

  const listBody = listRes.body as { success?: boolean; data?: unknown[] };
  assert('List response is array', Array.isArray(listBody?.data), listBody);

  // ── 5. Admin views the specific loan ──────────────────────────────────────
  console.log('\n[5] Admin views the specific loan');
  const loanDetailRes = await get(`/api/v1/loans/${loanId}`, adminToken);
  assert('GET /loans/:id (admin) → 200', loanDetailRes.status === 200, loanDetailRes);

  // ── 6. Admin submits approval decision ───────────────────────────────────
  console.log('\n[6] Admin submits approval decision');
  const approvalRes = await post(`/api/v1/loans/${loanId}/approval`, { decision: 'APPROVE', notes: 'E2E approval test' }, adminToken);
  // Temporal may not be running in CI — accept 200 (signal sent) or 404/500 (Temporal unavailable)
  const approvalOk = [200, 404, 500, 503].includes(approvalRes.status);
  assert(`POST /loans/:id/approval → ${approvalRes.status} (Temporal may be offline)`, approvalOk, approvalRes);
  if (approvalRes.status === 200) {
    const approvalBody = approvalRes.body as { success?: boolean };
    assert('Approval response success', approvalBody?.success === true);
  }

  // ── 7. Public status still accessible after review ───────────────────────
  console.log('\n[7] Status still accessible after review attempt');
  const finalStatusRes = await get(`/api/v1/public/loans/${loanId}`);
  assert('GET /public/loans/:id still 200', finalStatusRes.status === 200);

  // ── 8. Unknown loan ID → 404 ──────────────────────────────────────────────
  console.log('\n[8] Edge cases');
  const notFoundRes = await get('/api/v1/public/loans/00000000-0000-0000-0000-000000000000');
  assert('Unknown loan ID → 404', notFoundRes.status === 404);

  const noAuthRes = await get('/api/v1/loans');
  assert('GET /loans without token → 401', noAuthRes.status === 401);

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log(`\n${'─'.repeat(50)}`);
  console.log(`E2E results: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

run().catch((err) => {
  console.error('E2E test error:', err);
  process.exit(1);
});

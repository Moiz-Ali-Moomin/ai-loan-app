#!/usr/bin/env bash
# ================================================================
# AI Loan Governance Platform — E2E Smoke Test
# Verifies the full loan workflow runs end-to-end.
# Requires: all services running, jq installed.
# ================================================================
set -euo pipefail

API="http://localhost:3000/api/v1"
TENANT_ID="11111111-1111-1111-1111-111111111111"
PASS=0; FAIL=0

ok()  { echo "  [PASS] $1"; PASS=$((PASS+1)); }
err() { echo "  [FAIL] $1"; FAIL=$((FAIL+1)); }
sep() { echo ""; echo "--- $1 ---"; }

sep "1. Health Checks"
for svc in "3000/health" "3002/health" "3003/health" "3004/health" "3005/health"; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:${svc}")
  [ "$status" = "200" ] && ok "$svc" || err "$svc (HTTP $status)"
done

sep "2. OPA Policy Check"
OPA_RESULT=$(curl -s -X POST http://localhost:8181/v1/data/loan/approval \
  -H 'Content-Type: application/json' \
  -d '{"input":{"loan":{"requestedAmount":25000,"loanType":"PERSONAL","termMonths":36,"purpose":"home reno"},"applicant":{"creditScore":720,"annualIncome":85000,"existingDebt":5000,"kycVerified":true,"employmentStatus":"EMPLOYED","age":35}}}')
ALLOW=$(echo "$OPA_RESULT" | jq -r '.result.allow // false')
[ "$ALLOW" = "true" ] && ok "OPA policy ALLOW for clean applicant" || err "OPA policy returned: $OPA_RESULT"

OPA_KYC=$(curl -s -X POST http://localhost:8181/v1/data/loan/approval \
  -H 'Content-Type: application/json' \
  -d '{"input":{"loan":{"requestedAmount":25000,"loanType":"PERSONAL","termMonths":36,"purpose":"home reno"},"applicant":{"creditScore":720,"annualIncome":85000,"existingDebt":5000,"kycVerified":false,"employmentStatus":"EMPLOYED","age":35}}}')
KYC_DENY=$(echo "$OPA_KYC" | jq -r '.result.deny // false')
[ "$KYC_DENY" = "true" ] && ok "OPA policy DENY for missing KYC" || err "OPA should deny missing KYC: $OPA_KYC"

sep "3. Authentication"
LOGIN=$(curl -s -X POST "$API/auth/login" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"admin@acme-fintech.com\",\"password\":\"password\",\"tenantId\":\"$TENANT_ID\"}")
TOKEN=$(echo "$LOGIN" | jq -r '.data.token // empty')
[ -n "$TOKEN" ] && ok "Login successful, JWT received" || { err "Login failed: $LOGIN"; exit 1; }

sep "4. Submit Loan Application"
LOAN=$(curl -s -X POST "$API/loans" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d "{
    \"tenantId\": \"$TENANT_ID\",
    \"loanType\": \"PERSONAL\",
    \"requestedAmount\": 30000,
    \"requestedTermMonths\": 36,
    \"purpose\": \"E2E test — home improvement\",
    \"applicant\": {
      \"firstName\": \"Test\",
      \"lastName\": \"User\",
      \"email\": \"test-e2e@example.com\",
      \"phone\": \"+1-555-1234\",
      \"dateOfBirth\": \"1990-01-15\",
      \"nationalId\": \"SSN-E2E-TEST\",
      \"employmentStatus\": \"EMPLOYED\",
      \"annualIncome\": 80000,
      \"creditScore\": 710,
      \"existingDebt\": 8000,
      \"kycVerified\": true,
      \"address\": {\"street\":\"1 Test St\",\"city\":\"Austin\",\"state\":\"TX\",\"postalCode\":\"78701\",\"country\":\"US\"}
    }
  }")
LOAN_ID=$(echo "$LOAN" | jq -r '.data.loanRequestId // empty')
WF_ID=$(echo "$LOAN" | jq -r '.data.workflowId // empty')
[ -n "$LOAN_ID" ] && ok "Loan submitted: $LOAN_ID" || { err "Submission failed: $LOAN"; exit 1; }
[ -n "$WF_ID" ] && ok "Workflow started: $WF_ID" || err "No workflow ID returned"

sep "5. Wait for Workflow (up to 30s)"
FINAL_STATUS=""
for i in $(seq 1 10); do
  sleep 3
  DETAIL=$(curl -s -H "Authorization: Bearer $TOKEN" "$API/loans/$LOAN_ID")
  FINAL_STATUS=$(echo "$DETAIL" | jq -r '.data.status // "PENDING"')
  echo "  ... status: $FINAL_STATUS (attempt $i)"
  [[ "$FINAL_STATUS" =~ ^(APPROVED|REJECTED|ESCALATED|AWAITING_HUMAN_APPROVAL)$ ]] && break
done
[[ "$FINAL_STATUS" =~ ^(APPROVED|REJECTED|ESCALATED|AWAITING_HUMAN_APPROVAL)$ ]] && \
  ok "Workflow reached terminal state: $FINAL_STATUS" || \
  err "Workflow still pending after 30s: $FINAL_STATUS"

sep "6. Audit Trail"
AUDIT=$(curl -s -H "Authorization: Bearer $TOKEN" "$API/loans/$LOAN_ID/audit")
AUDIT_COUNT=$(echo "$AUDIT" | jq '.data | length')
[ "$AUDIT_COUNT" -gt 0 ] && ok "$AUDIT_COUNT audit records created" || err "No audit records found"

sep "7. AI Decision"
AI=$(curl -s -H "Authorization: Bearer $TOKEN" "$API/ai/decisions/$LOAN_ID" 2>/dev/null || echo '{"data":[]}')
AI_COUNT=$(echo "$AI" | jq '.data | length')
[ "$AI_COUNT" -gt 0 ] && ok "AI decision recorded (risk_score: $(echo "$AI" | jq -r '.data[0].risk_score'))" || err "No AI decision found"

sep "8. Policy Evaluation"
POLICY=$(curl -s "$API/policies/evaluations" -H "Authorization: Bearer $TOKEN")
POLICY_COUNT=$(echo "$POLICY" | jq '.data | length')
[ "$POLICY_COUNT" -gt 0 ] && ok "$POLICY_COUNT policy evaluations recorded" || err "No policy evaluations found"

# ── Summary ───────────────────────────────────────────────────
echo ""
echo "================================================"
if [ "$FAIL" -eq 0 ]; then
  echo "  ALL TESTS PASSED ($PASS/$((PASS+FAIL)))"
else
  echo "  $FAIL FAILED, $PASS PASSED"
fi
echo "================================================"
echo ""
[ "$FAIL" -eq 0 ] && exit 0 || exit 1

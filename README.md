# AI Loan Governance Platform

> Production-grade AI governance platform for regulated loan approval in fintechs and enterprises.

Demonstrates how AI decisions can be **traceable**, **policy-bound**, **observable**, **reproducible**, **auditable**, **replayable**, and **compliant-ready** using a full microservices architecture.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   AI Loan Governance Platform                    │
│                                                                  │
│  Browser → Next.js Frontend (port 3006)                         │
│               │                                                  │
│               ▼                                                  │
│  API Gateway (Fastify · JWT · Rate Limit · OTel) :3000          │
│       │                                                          │
│       ▼                                                          │
│  Temporal Worker ─── Loan Approval Workflow ────────────────┐   │
│       │              (durable · retryable · replayable)      │   │
│       │                                                      │   │
│       ├──→ Policy Service (OPA · versioned Rego) :3002       │   │
│       ├──→ AI Execution Service (Mock LLM · MinIO) :3003     │   │
│       ├──→ Audit Service (immutable · hash-chained) :3004    │   │
│       └──→ Kafka (5 topics · structured events)              │   │
│                          │                                   │   │
│                          ▼                                   │   │
│  Event Consumer ─→ Redis Cache ─→ Metrics Aggregation        │   │
│                                                              │   │
│  PostgreSQL (partitioned audit_logs · 8 normalized tables)   │   │
│  MinIO (prompts · responses · snapshots · compliance)        │   │
│                                                              │   │
│  Observability: OTel Collector → Loki · Tempo · Prometheus   │   │
│                                  Grafana Dashboards          │   │
└──────────────────────────────────────────────────────────────┘
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| API Gateway | 3000 | Fastify, JWT auth, rate limiting, OTel |
| Workflow Service | — | Temporal worker, loan approval workflow |
| Policy Service | 3002 | OPA integration, policy versioning |
| AI Execution | 3003 | Mock/real LLM, prompt versioning, MinIO |
| Audit Service | 3004 | Immutable hash-chained audit records |
| Event Consumer | 3005 | Kafka consumers, Redis caching |
| Frontend | 3006 | Next.js dashboard |

## Infrastructure

| Tool | Port | Purpose |
|------|------|---------|
| PostgreSQL | 5432 | Primary database |
| Redis | 6379 | Caching & real-time state |
| Kafka | 9092 | Event streaming |
| Kafka UI | 8090 | Topic browser |
| Temporal | 7233 | Workflow engine |
| Temporal UI | 8088 | Workflow inspection |
| OPA | 8181 | Policy evaluation |
| MinIO | 9000/9001 | Object storage |
| OTel Collector | 4318 | Telemetry ingestion |
| Grafana | 3100 | Dashboards |
| Loki | 3200 | Logs |
| Tempo | 3201 | Traces |
| Prometheus | 9091 | Metrics |

---

## Quick Start

### Prerequisites

- Docker Desktop (4GB+ RAM)
- Node.js 20+
- npm 10+

### 1. Clone & configure

```bash
cd "AI Loan App"
cp .env.example .env
# Edit .env — set OPENAI_API_KEY if using real LLM (AI_MOCK_MODE=false)
```

### 2. Start infrastructure

```bash
npm run infra:up
# Wait ~60s for all services to be healthy
docker-compose -f infra/docker/docker-compose.yml ps
```

### 3. Run database migrations

```bash
docker exec loan-postgres psql -U loanapp -d loandb \
  -f /docker-entrypoint-initdb.d/001_initial_schema.sql

docker exec loan-postgres psql -U loanapp -d loandb \
  -f /docker-entrypoint-initdb.d/002_seed_data.sql
```

### 4. Install dependencies & build

```bash
npm install
npm run build
```

### 5. Start all services (development)

```bash
# Terminal 1 — API Gateway
cd services/api-gateway && npm run dev

# Terminal 2 — Workflow Service (Temporal worker)
cd services/workflow-service && npm run dev

# Terminal 3 — Policy Service
cd services/policy-service && npm run dev

# Terminal 4 — AI Execution Service
cd services/ai-execution-service && npm run dev

# Terminal 5 — Audit Service
cd services/audit-service && npm run dev

# Terminal 6 — Event Consumer
cd services/event-consumer && npm run dev

# Terminal 7 — Frontend
cd frontend && npm run dev
```

### 6. Submit a test loan

```bash
# Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "admin@acme-fintech.com",
    "password": "password123",
    "tenantId": "11111111-1111-1111-1111-111111111111"
  }' | jq -r '.data.token')

# Submit loan application
curl -X POST http://localhost:3000/api/v1/loans \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "tenantId": "11111111-1111-1111-1111-111111111111",
    "loanType": "PERSONAL",
    "requestedAmount": 35000,
    "requestedTermMonths": 48,
    "purpose": "Home improvement and debt consolidation",
    "applicant": {
      "firstName": "Alice",
      "lastName": "Thompson",
      "email": "alice.t@example.com",
      "phone": "+1-555-9999",
      "dateOfBirth": "1988-04-20",
      "nationalId": "SSN-999-88-7777",
      "employmentStatus": "EMPLOYED",
      "annualIncome": 85000,
      "creditScore": 720,
      "existingDebt": 15000,
      "kycVerified": true,
      "address": {
        "street": "100 Tech Lane",
        "city": "San Francisco",
        "state": "CA",
        "postalCode": "94105",
        "country": "US"
      }
    }
  }'
```

---

## Workflow

The loan approval workflow runs entirely in Temporal for **durable**, **replayable** execution:

```
Submit → Validate → OPA Policy → Fraud Analysis → AI Risk Score
                                                        │
                                          ┌─────────────┤
                                          │ risk > 0.75 │
                                          ▼             ▼
                                    Human Approval  Auto Decide
                                          │             │
                                          └──────┬──────┘
                                                 ▼
                                    Store Audit · Publish Events
                                    Persist to MinIO · Finalize
```

### Replay a workflow

```bash
# Via Temporal UI at http://localhost:8088
# Navigate to loan-governance namespace → Workflows → loan-<ID>
# Click "Terminate" or inspect event history for full step-by-step replay
```

---

## OPA Policies

Policies live in `infra/opa/policies/` and are loaded as a bundle:

```rego
# Hard violations (auto-reject):
- KYC not verified                → CRITICAL
- Credit score < 580              → HIGH
- DTI ratio > 45%                 → HIGH
- Applicant age < 18              → CRITICAL
- AI risk score > 0.8             → HIGH

# Soft flags (human review required):
- Loan amount > $500k             → MANUAL_REVIEW
- Risk score 0.65–0.80            → MANUAL_REVIEW
- Business loan > $250k           → MANUAL_REVIEW
- Self-employed + amount > $100k  → MANUAL_REVIEW
- Fraud score 0.5–0.9             → MANUAL_REVIEW
```

Test a policy directly:

```bash
curl -X POST http://localhost:8181/v1/data/loan/approval \
  -H 'Content-Type: application/json' \
  -d '{
    "input": {
      "loan": { "requestedAmount": 600000, "loanType": "BUSINESS", "termMonths": 84, "purpose": "expansion" },
      "applicant": { "creditScore": 700, "annualIncome": 200000, "existingDebt": 50000, "kycVerified": true, "employmentStatus": "SELF_EMPLOYED", "age": 42 }
    }
  }'
```

---

## Observability

### Access Grafana dashboards

1. Open **http://localhost:3100** (admin/admin)
2. Navigate to **AI Loan Governance** folder
3. Available dashboards:
   - **Platform Overview** — KPIs, request rate, workflow latency, Kafka throughput
   - **AI Decision Analytics** — risk score distribution, recommendation breakdown, latency percentiles

### Trace a request end-to-end

```bash
# Get trace ID from API response headers or logs
# Open Grafana → Explore → Tempo → paste trace ID
```

### View structured logs

```bash
# Grafana → Explore → Loki → query:
{job=~"loan-platform.*"} | json | loanRequestId="loan0001-..."
```

---

## API Documentation

OpenAPI docs at: **http://localhost:3000/docs**

### Key endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/auth/login` | Obtain JWT token |
| POST | `/api/v1/loans` | Submit loan application |
| GET | `/api/v1/loans` | List applications (paginated) |
| GET | `/api/v1/loans/:id` | Get application detail |
| GET | `/api/v1/loans/:id/workflow` | Get workflow state |
| GET | `/api/v1/loans/:id/audit` | Get full audit trail |
| POST | `/api/v1/loans/:id/approval` | Submit human review decision |
| POST | `/api/v1/policies/evaluate` | Evaluate OPA policy |
| GET | `/api/v1/policies/versions` | List policy versions |
| POST | `/api/v1/ai/analyze` | Run AI risk analysis |
| GET | `/api/v1/ai/decisions/:id` | Get AI decisions for loan |
| GET | `/api/v1/audit/loans/:id/lineage` | Full decision lineage |
| GET | `/api/v1/audit/loans/:id/integrity` | Verify audit chain |

---

## Kafka Topics

| Topic | Events |
|-------|--------|
| `loan.requests` | LOAN_REQUEST_SUBMITTED |
| `workflow.events` | WORKFLOW_STEP_STARTED, WORKFLOW_COMPLETED, etc. |
| `policy.events` | POLICY_EVALUATED |
| `ai.decisions` | AI_DECISION_MADE |
| `audit.events` | All audit records |

---

## Production Deployment

### Kubernetes

```bash
# Apply base manifests
kubectl apply -k infra/k8s/base/

# Verify
kubectl get all -n loan-platform
```

### Production checklist

- [ ] Replace `JWT_SECRET` with a cryptographically random 64-char secret
- [ ] Use Sealed Secrets or Vault for all secrets
- [ ] Set `AI_MOCK_MODE=false` and provide real `OPENAI_API_KEY`
- [ ] Configure Kafka with `replication-factor: 3` and `min-insync-replicas: 2`
- [ ] Enable PostgreSQL connection pooling (PgBouncer)
- [ ] Set up Temporal namespace with retention policy
- [ ] Configure TLS for all inter-service communication
- [ ] Set up cert-manager for ingress TLS
- [ ] Enable Prometheus alerting to PagerDuty/OpsGenie
- [ ] Configure audit log export to cold storage (S3/GCS) after 90 days
- [ ] Enable MinIO versioning and replication for compliance artifacts
- [ ] Set resource limits appropriate for your load
- [ ] Configure network policies to restrict service-to-service traffic

---

## Project Structure

```
ai-loan-governance-platform/
├── packages/
│   ├── shared-types/       # TypeScript types shared across services
│   ├── telemetry/          # OpenTelemetry initialization & utilities
│   ├── logger/             # Structured Pino logger with trace correlation
│   ├── kafka/              # KafkaJS producer/consumer clients
│   └── database/           # PostgreSQL pool factory
├── services/
│   ├── api-gateway/        # Fastify gateway (auth, routing, docs)
│   ├── workflow-service/   # Temporal worker + loan approval workflow
│   ├── policy-service/     # OPA evaluation + policy versioning
│   ├── ai-execution-service/ # LLM integration + prompt management
│   ├── audit-service/      # Immutable hash-chained audit log
│   └── event-consumer/     # Kafka consumers + metrics aggregation
├── frontend/               # Next.js + TailwindCSS dashboard
├── infra/
│   ├── docker/             # Docker Compose + observability configs
│   ├── k8s/                # Kubernetes manifests (Kustomize)
│   ├── opa/policies/       # Rego governance policies
│   ├── postgres/           # SQL migrations + seed data
│   └── grafana/            # Dashboard JSON + provisioning
├── .env.example
├── package.json            # Turbo monorepo root
├── turbo.json
└── tsconfig.base.json
```

---

## Key Engineering Patterns

| Pattern | Implementation |
|---------|---------------|
| **Durable execution** | Temporal workflows — survives crashes, network failures, restarts |
| **Saga / compensation** | Workflow steps with retry + non-retryable error types |
| **Immutable audit log** | Hash-chained records, SQL RULE preventing UPDATE/DELETE |
| **Event sourcing** | All state changes published to Kafka, consumed for projections |
| **Policy as code** | OPA Rego policies versioned separately from application logic |
| **Prompt versioning** | Prompts stored in MinIO with version key, linked to decisions |
| **Distributed tracing** | OTel trace context propagated across all services via HTTP headers |
| **Idempotency** | Workflow activities are retry-safe; Kafka consumers handle duplicates |
| **Zero-trust networking** | Services communicate via internal DNS; JWTs for user auth |

---

## License

MIT — for portfolio and educational demonstration purposes.

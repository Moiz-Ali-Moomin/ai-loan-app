#!/usr/bin/env bash
# ================================================================
# AI Loan Governance Platform — Local Development Startup (Unix)
# Run from the repo root: ./scripts/start-dev.sh
# ================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo ""
echo "=== AI Loan Governance Platform — Dev Bootstrap ==="
echo ""

# 1. Check prerequisites
for tool in docker node npm; do
  if ! command -v "$tool" &>/dev/null; then
    echo "ERROR: '$tool' not found. Please install it first." >&2
    exit 1
  fi
done
echo "[OK] Prerequisites found"

# 2. Create .env if missing
if [ ! -f .env ]; then
  cp .env.example .env
  echo "[OK] Created .env from .env.example — edit it before production use"
else
  echo "[OK] .env already exists"
fi

# 3. Start infrastructure
echo ""
echo "Starting infrastructure..."
pushd infra/docker > /dev/null
docker-compose up -d --remove-orphans
popd > /dev/null
echo "[OK] Infrastructure containers started"

# 4. Wait for Postgres
echo "Waiting for Postgres..."
for i in $(seq 1 20); do
  if docker exec loan-postgres pg_isready -U loanapp -d loandb &>/dev/null; then
    echo "[OK] Postgres ready"
    break
  fi
  sleep 3
  if [ "$i" -eq 20 ]; then
    echo "ERROR: Postgres not ready after 60s" >&2; exit 1
  fi
done

# 5. Install & build
echo ""
echo "Installing dependencies..."
npm install --silent
echo "[OK] Dependencies installed"

echo "Building shared packages..."
npm run build -w packages/shared-types
npm run build -w packages/telemetry
npm run build -w packages/logger
npm run build -w packages/database
npm run build -w packages/kafka
echo "[OK] Shared packages built"

# 6. Print URLs
echo ""
echo "================================================================"
echo "  Infrastructure Ready!"
echo "================================================================"
echo "  Frontend (Next.js)    : http://localhost:3006"
echo "  API Gateway           : http://localhost:3000"
echo "  API Docs (Swagger)    : http://localhost:3000/docs"
echo "  Temporal UI           : http://localhost:8088"
echo "  Grafana               : http://localhost:3100  (admin/admin)"
echo "  Kafka UI              : http://localhost:8090"
echo "  MinIO Console         : http://localhost:9001  (minioadmin/minioadmin)"
echo "  OPA                   : http://localhost:8181"
echo "  Prometheus            : http://localhost:9091"
echo ""
echo "Start services in separate terminals:"
echo "  cd services/api-gateway          && npm run dev"
echo "  cd services/workflow-service     && npm run dev"
echo "  cd services/workflow-service     && npm run dev:api"
echo "  cd services/policy-service       && npm run dev"
echo "  cd services/ai-execution-service && npm run dev"
echo "  cd services/audit-service        && npm run dev"
echo "  cd services/event-consumer       && npm run dev"
echo "  cd frontend                      && npm run dev"
echo "================================================================"

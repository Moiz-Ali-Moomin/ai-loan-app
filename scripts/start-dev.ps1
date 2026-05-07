# ================================================================
# AI Loan Governance Platform — Local Development Startup Script
# Run from the repo root: .\scripts\start-dev.ps1
# ================================================================

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot

Write-Host ""
Write-Host "=== AI Loan Governance Platform — Dev Bootstrap ===" -ForegroundColor Cyan
Write-Host ""

# 1. Check prerequisites
foreach ($tool in @("docker", "node", "npm")) {
    if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) {
        Write-Host "ERROR: '$tool' not found in PATH. Please install it first." -ForegroundColor Red
        exit 1
    }
}
Write-Host "[OK] Prerequisites found" -ForegroundColor Green

# 2. Copy .env if missing
$envFile = Join-Path $Root ".env"
if (-not (Test-Path $envFile)) {
    Copy-Item (Join-Path $Root ".env.example") $envFile
    Write-Host "[OK] Created .env from .env.example — edit it before production use" -ForegroundColor Yellow
} else {
    Write-Host "[OK] .env already exists" -ForegroundColor Green
}

# 3. Start infrastructure
Write-Host ""
Write-Host "Starting infrastructure (Postgres, Kafka, Redis, MinIO, Temporal, OPA, LGTM)..." -ForegroundColor Cyan
Push-Location (Join-Path $Root "infra\docker")
docker-compose up -d --remove-orphans
Pop-Location
Write-Host "[OK] Infrastructure containers started" -ForegroundColor Green

# 4. Wait for Postgres
Write-Host "Waiting for Postgres to be ready..."
$attempts = 0
do {
    Start-Sleep -Seconds 3
    $attempts++
    $result = docker exec loan-postgres pg_isready -U loanapp -d loandb 2>&1
} while ($result -notmatch "accepting connections" -and $attempts -lt 20)

if ($attempts -ge 20) {
    Write-Host "ERROR: Postgres not ready after 60s. Check docker logs loan-postgres" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Postgres ready" -ForegroundColor Green

# 5. Install dependencies
Write-Host ""
Write-Host "Installing npm workspaces..." -ForegroundColor Cyan
Set-Location $Root
npm install --silent
Write-Host "[OK] Dependencies installed" -ForegroundColor Green

# 6. Build shared packages
Write-Host ""
Write-Host "Building shared packages..." -ForegroundColor Cyan
npm run build -w packages/shared-types
npm run build -w packages/telemetry
npm run build -w packages/logger
npm run build -w packages/database
npm run build -w packages/kafka
Write-Host "[OK] Shared packages built" -ForegroundColor Green

# 7. Print access URLs
Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  Infrastructure Ready!" -ForegroundColor Green
Write-Host "================================================================"
Write-Host "  Frontend (Next.js)    : http://localhost:3006" -ForegroundColor White
Write-Host "  API Gateway           : http://localhost:3000" -ForegroundColor White
Write-Host "  API Docs (Swagger)    : http://localhost:3000/docs" -ForegroundColor White
Write-Host "  Temporal UI           : http://localhost:8088" -ForegroundColor White
Write-Host "  Grafana               : http://localhost:3100  (admin/admin)" -ForegroundColor White
Write-Host "  Kafka UI              : http://localhost:8090" -ForegroundColor White
Write-Host "  MinIO Console         : http://localhost:9001  (minioadmin/minioadmin)" -ForegroundColor White
Write-Host "  OPA                   : http://localhost:8181" -ForegroundColor White
Write-Host "  Prometheus            : http://localhost:9091" -ForegroundColor White
Write-Host ""
Write-Host "Now start services in separate terminals:" -ForegroundColor Yellow
Write-Host "  cd services/api-gateway        && npm run dev"
Write-Host "  cd services/workflow-service   && npm run dev"
Write-Host "  cd services/workflow-service   && npm run dev:api"
Write-Host "  cd services/policy-service     && npm run dev"
Write-Host "  cd services/ai-execution-service && npm run dev"
Write-Host "  cd services/audit-service      && npm run dev"
Write-Host "  cd services/event-consumer     && npm run dev"
Write-Host "  cd frontend                    && npm run dev"
Write-Host "================================================================" -ForegroundColor Cyan

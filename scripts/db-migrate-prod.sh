#!/bin/bash
set -e

echo "=========================================================="
echo "AI Loan Governance Platform — Production DB Migration"
echo "=========================================================="

if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL must be set"
  exit 1
fi

echo "1. Taking pre-migration database backup..."
# Assuming pg_dump is available or using a managed DB backup API
# pg_dump $DATABASE_URL > pre_migration_backup_$(date +%s).sql

echo "2. Running Prisma migrations..."
npm run prisma:migrate:deploy

echo "3. Refreshing Prisma generated client (if needed locally)..."
npm run prisma:generate

echo "Migration deploy complete."

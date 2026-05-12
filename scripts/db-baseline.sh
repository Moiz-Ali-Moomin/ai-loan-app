#!/bin/bash
set -e

echo "=========================================================="
echo "AI Loan Governance Platform — DB Baseline Initialization"
echo "=========================================================="
echo "This script tells Prisma that the current production schema"
echo "has already been applied via raw SQL migrations."
echo "It does NOT run any SQL commands other than marking the"
echo "migration '0_init' as applied in _prisma_migrations."
echo "=========================================================="

if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL must be set"
  exit 1
fi

echo "Running prisma migrate resolve..."
npm run db:baseline -w packages/database

echo "Baseline complete! You can now use 'prisma migrate deploy' safely."

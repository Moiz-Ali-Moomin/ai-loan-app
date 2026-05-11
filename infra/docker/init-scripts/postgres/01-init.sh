#!/bin/bash
# Runs inside the postgres container on first startup.
# Applies schema migrations and seed data automatically.
set -e

echo "=== AI Loan Platform — Database Initialization ==="

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";
    CREATE EXTENSION IF NOT EXISTS "vector";
EOSQL

echo "Extensions installed (uuid-ossp, pgcrypto, vector)."

echo "Applying schema migration 001..."
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  -f /migrations/001_initial_schema.sql

echo "Applying seed data 002..."
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  -f /migrations/002_seed_data.sql

echo "Applying audit partition extension 003..."
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  -f /migrations/003_audit_partition_extension.sql

echo "Applying PII encryption and idempotency 004..."
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  -f /migrations/004_pii_encryption_and_idempotency.sql

echo "Applying pgvector RAG infrastructure 005..."
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  -f /migrations/005_pgvector_rag.sql

echo "=== Database initialization complete ==="

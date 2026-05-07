#!/bin/bash
# Runs inside the postgres container on first startup.
# Applies schema migrations and seed data automatically.
set -e

echo "=== AI Loan Platform — Database Initialization ==="

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";
EOSQL

echo "Extensions installed."

echo "Applying schema migration 001..."
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  -f /migrations/001_initial_schema.sql

echo "Applying seed data 002..."
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  -f /migrations/002_seed_data.sql

echo "=== Database initialization complete ==="

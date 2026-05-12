#!/bin/bash
set -e

echo "=========================================================="
echo "AI Loan Governance Platform — Production DB Migration"
echo "=========================================================="

if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL must be set"
  exit 1
fi

echo "1. Checking database state (Fresh vs Existing)..."
node -e "
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });
async function run() {
  await client.connect();
  const res1 = await client.query(\"SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tenants') as exists;\");
  const res2 = await client.query(\"SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '_prisma_migrations') as exists;\");
  
  const hasTenants = res1.rows[0].exists;
  const hasPrisma = res2.rows[0].exists;
  
  if (hasTenants && !hasPrisma) {
    console.log('MARK_BASELINE');
  } else if (!hasTenants) {
    console.log('FRESH_DB');
  } else {
    console.log('NORMAL');
  }
  await client.end();
}
run().catch(e => { console.error(e); process.exit(1); });
" > db_state.txt

DB_STATE=$(cat db_state.txt)
echo "Database state detected as: $DB_STATE"

if [ "$DB_STATE" = "MARK_BASELINE" ]; then
  echo "=> Existing production database detected without Prisma."
  echo "=> Running baseline resolution..."
  npm run db:baseline -w packages/database
elif [ "$DB_STATE" = "FRESH_DB" ]; then
  echo "=> Fresh database detected."
  echo "=> Initializing schema and seed data..."
  # prisma migrate deploy runs migrations. 
  # Then we manually run seed since 'deploy' doesn't auto-seed in prod.
fi

echo "2. Running Prisma migrations..."
npm run prisma:migrate:deploy

if [ "$DB_STATE" = "FRESH_DB" ]; then
  echo "3. Seeding fresh database..."
  # We must build the seed script first if not built
  npm run build -w packages/database
  npx prisma db seed
fi

echo "4. Refreshing Prisma generated client (if needed locally)..."
npm run prisma:generate

echo "Migration deploy complete."

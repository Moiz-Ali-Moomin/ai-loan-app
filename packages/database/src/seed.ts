import { prisma } from './prisma.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log('Starting database seeding...');
  
  // Navigate from dist/seed.js (or src/seed.ts) to the root infra directory
  const rootDir = path.resolve(__dirname, '..', '..', '..');
  const seedFile = path.join(rootDir, 'infra', 'postgres', 'migrations', '002_seed_data.sql');
  
  if (!fs.existsSync(seedFile)) {
    console.error(`Seed file not found at ${seedFile}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(seedFile, 'utf-8');
  
  console.log('Executing seed SQL...');
  // Execute the raw SQL file directly
  await prisma.$executeRawUnsafe(sql);
  
  console.log('Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error('Failed to seed database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

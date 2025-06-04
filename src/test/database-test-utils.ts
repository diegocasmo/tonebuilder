import { prisma } from '@/lib/prisma/index';
import { execSync } from 'child_process';

/**
 * Sets up the test database schema using Prisma migrations
 */
export async function setupTestDatabase(): Promise<void> {
  console.log('📦 Setting up test database schema...');
  try {
    execSync('npx prisma migrate deploy', {
      stdio: 'pipe',
      env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL },
    });
    execSync('npx prisma generate', { stdio: 'pipe' });
    console.log('✅ Test database schema ready');
  } catch (error) {
    console.error('❌ Failed to setup test database:', error);
    throw error;
  }
}

/**
 * Cleans up test data by truncating all tables while preserving schema
 */
export async function cleanupTestDatabase(): Promise<void> {
  // Get all table names and truncate them (handles foreign keys properly)
  const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  `;

  const tableNames = tables
    .map((table) => table.tablename)
    .filter((name) => name !== '_prisma_migrations') // Skip migration table
    .map((name) => `"${name}"`)
    .join(', ');

  if (tableNames) {
    await prisma.$executeRawUnsafe(
      `TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE`
    );
  }
}

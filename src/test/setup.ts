// Test setup file for Jest
// This file runs before each test file

import { prisma } from '@/lib/prisma/index';
import { execSync } from 'child_process';

// Environment validation and database setup
beforeAll(async () => {
  // Check NODE_ENV is set to 'test'
  if (process.env.NODE_ENV !== 'test') {
    throw new Error(
      `Tests must run in test environment. Current NODE_ENV: '${process.env.NODE_ENV}'. ` +
        'Make sure NODE_ENV is set to "test" before running tests.'
    );
  }

  // Check that TEST_DATABASE_URL is defined
  if (!process.env.TEST_DATABASE_URL) {
    throw new Error(
      'TEST_DATABASE_URL environment variable is required for running tests. ' +
        'Please set TEST_DATABASE_URL to point to your test database.'
    );
  }

  // Set up test database schema
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
});

// Clean up test data after each test to ensure isolation
afterEach(async () => {
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
});

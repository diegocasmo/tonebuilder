// Simple script to verify database URL selection
// This can be run to verify the environment-based database URL selection

import { prisma } from '@/lib/prisma/index';

async function verifyDatabaseUrl() {
  console.log('Environment:', process.env.NODE_ENV);
  console.log(
    'DATABASE_URL:',
    process.env.DATABASE_URL ? '[SET]' : '[NOT SET]'
  );
  console.log(
    'TEST_DATABASE_URL:',
    process.env.TEST_DATABASE_URL ? '[SET]' : '[NOT SET]'
  );

  try {
    // Try to connect to the database
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Get database info if possible
    const result = await prisma.$queryRaw`SELECT current_database() as db_name`;
    console.log('Connected to database:', result);
  } catch (error) {
    console.log('❌ Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  verifyDatabaseUrl();
}

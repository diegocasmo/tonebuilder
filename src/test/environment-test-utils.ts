/**
 * Validates that the test environment is properly configured
 */
export function validateTestEnvironment(): void {
  console.log('🔍 Starting test environment validation...');

  if (process.env.NODE_ENV !== 'test') {
    throw new Error(
      `Tests must run in test environment. Current NODE_ENV: '${process.env.NODE_ENV}'. ` +
        'Make sure NODE_ENV is set to "test" before running tests.'
    );
  }

  if (!process.env.TEST_DATABASE_URL) {
    throw new Error(
      'TEST_DATABASE_URL environment variable is required for running tests. ' +
        'Please set TEST_DATABASE_URL to point to your test database.'
    );
  }

  // All validations passed
  console.log('✅ Test environment validation completed successfully');
}

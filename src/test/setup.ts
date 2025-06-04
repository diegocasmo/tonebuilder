import { setupTestDatabase, cleanupTestDatabase } from './database-test-utils';
import { validateTestEnvironment } from './environment-test-utils';

beforeAll(async () => {
  validateTestEnvironment();
  await setupTestDatabase();
});

afterEach(async () => {
  await cleanupTestDatabase();
});

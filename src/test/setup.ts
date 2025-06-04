// Test setup file for Jest
// This file runs before each test file

import { cleanupTestData } from './test-helpers';

// Clean up test data after each test to ensure isolation
afterEach(async () => {
  await cleanupTestData();
});

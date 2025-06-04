# Testing Setup

This directory contains the testing setup and utilities for the tonebuilder project.

## Overview

The project uses Jest with TypeScript support for unit testing. Tests are configured to use a separate test database to ensure complete isolation from development data.

## Test Structure

```
src/test/
├── README.md          # This file
├── jest-setup.ts      # Jest setup file that sets environment variables
├── setup.ts           # Jest setup file that runs before each test
└── test-helpers.ts    # Utility functions for creating test data
```

## Key Features

- **Separate Test Database**: Tests use `TEST_DATABASE_URL` while development uses `DATABASE_URL`
- **Automatic Cleanup**: Test data is automatically cleaned up after each test to ensure isolation
- **TypeScript Support**: Full TypeScript support with proper types
- **Test Helpers**: Utility functions for easily creating test data

## Database Setup

The testing environment uses a separate database from development:

- **Development**: Uses `DATABASE_URL` environment variable
- **Testing**: Uses `TEST_DATABASE_URL` environment variable (falls back to `DATABASE_URL` if not set)

### Setting up Test Database

1. Create a separate test database (recommended naming: `your_app_name_test`)
2. Set the `TEST_DATABASE_URL` environment variable in your `.env` file:

```bash
# Development database
DATABASE_URL="postgresql://user:password@localhost:5432/tonebuilder"

# Test database (separate from development)
TEST_DATABASE_URL="postgresql://user:password@localhost:5432/tonebuilder_test"
```

3. Run migrations on your test database:

```bash
DATABASE_URL=$TEST_DATABASE_URL npx prisma db push
```

## Test Helpers

The `test-helpers.ts` file provides utility functions for creating test data:

- `createTestUser(email?)`: Creates a test user
- `createTestTeam(name?)`: Creates a test team
- `createTestTeamMembership(userId, teamId)`: Creates a team membership
- `cleanupTestData()`: Cleans up all test data (called automatically after each test)

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --testPathPattern=find-or-create-default-team.test.ts
```

## Writing Tests

### Test File Structure

Place test files in `__tests__` directories next to the code they test:

```
src/lib/services/
├── find-or-create-default-team.ts
└── __tests__/
    └── find-or-create-default-team.test.ts
```

### Example Test

```typescript
import { functionToTest } from '../function-to-test';
import { createTestUser, createTestTeam } from '@/test/test-helpers';
import { prisma } from '@/lib/prisma/index';

describe('functionToTest', () => {
  it('should do something', async () => {
    // Arrange
    const user = await createTestUser('test@example.com');

    // Act
    const result = await functionToTest(user.id);

    // Assert
    expect(result).toBeDefined();
    // Add more assertions...
  });
});
```

### Best Practices

1. **Use descriptive test names**: Tests should clearly describe what they're testing
2. **Follow AAA pattern**: Arrange, Act, Assert
3. **Test edge cases**: Include tests for error conditions and edge cases
4. **Use real data**: Prefer real database operations over mocks when possible
5. **Clean isolation**: Each test should be independent and not rely on other tests

## Database Considerations

- Tests use a completely separate database from development
- The test database is automatically selected when `NODE_ENV=test`
- Test data is automatically cleaned up after each test to prevent interference
- The cleanup happens in dependency order (TeamMembership → Team → User)
- Make sure your test database schema is up to date before running tests

## Coverage

The project aims for high test coverage. You can check coverage with:

```bash
npm run test:coverage
```

Target coverage goals:

- Statements: 90%+
- Branches: 90%+
- Functions: 90%+
- Lines: 90%+

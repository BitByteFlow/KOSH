import { execSync } from 'child_process';

/**
 * Global test setup for API v2 tests
 * Runs before all test files
 */

// Mock console.error in tests to reduce noise (optional)
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  // Filter out Prisma informational messages
  if (typeof args[0] === 'string' && args[0].includes('Prisma')) {
    return;
  }
  originalConsoleError(...args);
};

// Global test timeout
jest.setTimeout(30000);

/**
 * Generate a unique ID for test isolation
 */
export function generateTestId(prefix = 'test'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create test user credentials
 */
export function createTestUser(overrides?: Partial<{
  email: string;
  googleId: string;
  username: string;
  image: string;
}>) {
  const id = generateTestId();
  return {
    email: `${id}@test.com`,
    googleId: `google_${id}`,
    username: `testuser_${id}`,
    image: 'https://test.com/image.jpg',
    ...overrides,
  };
}

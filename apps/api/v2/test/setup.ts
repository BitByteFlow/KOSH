/**
 * Jest Test Setup
 */

// Increase timeout for container startup
jest.setTimeout(180000);

// Global setup for all tests
beforeAll(async () => {
	// Set test environment variables
	process.env.NODE_ENV = "test";
	process.env.JWT_SECRET = "test-jwt-secret-key-for-testing-only";
	process.env.JWT_EXPIRES_IN = "7d";
});

// Global teardown
afterAll(async () => {
	// Give time for cleanup
	await new Promise((resolve) => setTimeout(resolve, 1000));
});

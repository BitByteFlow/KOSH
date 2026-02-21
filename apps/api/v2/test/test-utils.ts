import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { DatabaseService } from '../src/database/database.service';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';

/**
 * Test utility class for API v2
 * Provides common test setup, teardown, and helpers
 */
export class TestContext {
  app: INestApplication;
  databaseService: DatabaseService;
  jwtService: JwtService;
  testUserId: string;
  testUserToken: string;

  private constructor(
    app: INestApplication,
    databaseService: DatabaseService,
    jwtService: JwtService,
  ) {
    this.app = app;
    this.databaseService = databaseService;
    this.jwtService = jwtService;
  }

  /**
   * Initialize test application
   */
  static async create(): Promise<TestContext> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('/api/v2');
    await app.init();

    const databaseService = moduleFixture.get<DatabaseService>(DatabaseService);
    const jwtService = moduleFixture.get<JwtService>(JwtService);

    return new TestContext(app, databaseService, jwtService);
  }

  /**
   * Create an authenticated test user
   */
  async createAuthenticatedUser(overrides?: {
    email?: string;
    googleId?: string;
    username?: string;
  }): Promise<{ userId: string; token: string }> {
    const id = `test_${Date.now()}`;
    const email = overrides?.email || `${id}@test.com`;
    const googleId = overrides?.googleId || `google_${id}`;
    const username = overrides?.username || `testuser_${id}`;

    const user = await this.databaseService.user.create({
      data: {
        email,
        googleId,
        username,
        image: 'https://test.com/image.jpg',
      },
    });

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      username: user.username,
    });

    return { userId: user.id, token };
  }

  /**
   * Get GraphQL request helper
   */
  graphqlRequest<T>(query: string, variables?: Record<string, any>, token?: string) {
    return request(this.app.getHttpServer())
      .post('/graphql')
      .set('Content-Type', 'application/json')
      .set(token ? { Authorization: `Bearer ${token}` } : {})
      .send({ query, variables });
  }

  /**
   * Clean up test data
   */
  async cleanup(userId?: string) {
    if (userId) {
      // Delete user and cascade deletes related data
      await this.databaseService.user.delete({ where: { id: userId } });
    }
  }

  /**
   * Close the application
   */
  async close() {
    await this.app.close();
  }
}

/**
 * Create test context with authenticated user
 */
export async function createTestContext(): Promise<TestContext & { userId: string; token: string }> {
  const context = await TestContext.create();
  const { userId, token } = await context.createAuthenticatedUser();
  return Object.assign(context, { userId, token });
}

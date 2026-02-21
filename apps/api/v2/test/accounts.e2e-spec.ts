import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { DatabaseService } from '../src/database/database.service';
import { JwtService } from '@nestjs/jwt';

describe('AccountsResolver (e2e)', () => {
  let app: INestApplication;
  let databaseService: DatabaseService;
  let jwtService: JwtService;
  let authToken: string;
  let testUserId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('/api/v2');
    await app.init();

    databaseService = moduleFixture.get<DatabaseService>(DatabaseService);
    jwtService = moduleFixture.get<JwtService>(JwtService);

    // Create test user
    const user = await databaseService.user.create({
      data: {
        email: `test_${Date.now()}@test.com`,
        googleId: `google_${Date.now()}`,
        username: `testuser_${Date.now()}`,
        image: 'https://test.com/image.jpg',
      },
    });

    testUserId = user.id;
    authToken = jwtService.sign({
      sub: user.id,
      email: user.email,
      username: user.username,
    });
  });

  afterAll(async () => {
    // Cleanup test data
    if (testUserId) {
      await databaseService.user.delete({ where: { id: testUserId } }).catch(() => { });
    }
    await app.close();
  });

  describe('POST /graphql (createTransaction)', () => {
    const createTransactionMutation = `
      mutation CreateTransaction($input: CreateTransactionInput!) {
        createTransaction(createTransactionInput: $input) {
          success
          message
          data {
            id
            type
            amount
            note
            createdAt
          }
        }
      }
    `;

    it('should create INITIAL_CAPITAL transaction', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json')
        .send({
          query: createTransactionMutation,
          variables: {
            input: {
              type: 'INITIAL_CAPITAL',
              amount: 10000,
              note: 'Initial capital for testing',
            },
          },
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
          expect(res.body.data.createTransaction.success).toBe(true);
          expect(res.body.data.createTransaction.data.type).toBe('INITIAL_CAPITAL');
          expect(res.body.data.createTransaction.data.amount).toBe(10000);
        });
    });

    it('should reject negative amount', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json')
        .send({
          query: createTransactionMutation,
          variables: {
            input: {
              type: 'INITIAL_CAPITAL',
              amount: -100,
              note: 'Invalid transaction',
            },
          },
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.errors).toBeDefined();
        });
    });

    it('should reject zero amount', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json')
        .send({
          query: createTransactionMutation,
          variables: {
            input: {
              type: 'INITIAL_CAPITAL',
              amount: 0,
              note: 'Invalid transaction',
            },
          },
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.errors).toBeDefined();
        });
    });

    it('should reject second INITIAL_CAPITAL on same day', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json')
        .send({
          query: createTransactionMutation,
          variables: {
            input: {
              type: 'INITIAL_CAPITAL',
              amount: 5000,
              note: 'Second initial capital',
            },
          },
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.errors).toBeDefined();
        });
    });

    it('should create WITHDRAWAL transaction after INITIAL_CAPITAL', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json')
        .send({
          query: createTransactionMutation,
          variables: {
            input: {
              type: 'WITHDRAWAL',
              amount: 1000,
              note: 'Test withdrawal',
            },
          },
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
          expect(res.body.data.createTransaction.success).toBe(true);
        });
    });

    it('should reject WITHDRAWAL with insufficient funds', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json')
        .send({
          query: createTransactionMutation,
          variables: {
            input: {
              type: 'WITHDRAWAL',
              amount: 100000,
              note: 'Large withdrawal',
            },
          },
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.errors).toBeDefined();
        });
    });
  });

  describe('POST /graphql (getCurrentCashBalance)', () => {
    const getBalanceQuery = `
      query GetCurrentCashBalance {
        getCurrentCashBalance {
          success
          message
          data {
            openingCash
            closingCash
            totalCashIn
            totalCashOut
            totalSales
            totalExpense
          }
        }
      }
    `;

    it('should return current day balance', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ query: getBalanceQuery })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.getCurrentCashBalance.success).toBe(true);
          expect(res.body.data.getCurrentCashBalance.data).toBeDefined();
          expect(typeof res.body.data.getCurrentCashBalance.data.openingCash).toBe('number');
          expect(typeof res.body.data.getCurrentCashBalance.data.closingCash).toBe('number');
        });
    });
  });

  describe('POST /graphql (getAccountTransactions)', () => {
    const getTransactionsQuery = `
      query GetAccountTransactions($page: Int, $limit: Int, $sortBy: String, $sortOrder: String) {
        getAccountTransactions(page: $page, limit: $limit, sortBy: $sortBy, sortOrder: $sortOrder) {
          success
          message
          data {
            id
            type
            amount
            note
            createdAt
          }
          meta {
            total
            page
            limit
            totalPages
            hasNext
            hasPrev
          }
        }
      }
    `;

    it('should return paginated transactions', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: getTransactionsQuery,
          variables: { page: 1, limit: 10 },
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.getAccountTransactions.success).toBe(true);
          expect(res.body.data.getAccountTransactions.data).toBeDefined();
          expect(res.body.data.getAccountTransactions.meta).toBeDefined();
          expect(res.body.data.getAccountTransactions.meta.total).toBeGreaterThan(0);
        });
    });

    it('should return transactions sorted by createdAt desc by default', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: getTransactionsQuery,
          variables: { page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' },
        })
        .expect(200)
        .expect((res) => {
          const transactions = res.body.data.getAccountTransactions.data;
          if (transactions.length > 1) {
            const firstDate = new Date(transactions[0].createdAt);
            const secondDate = new Date(transactions[1].createdAt);
            expect(firstDate.getTime()).toBeGreaterThanOrEqual(secondDate.getTime());
          }
        });
    });
  });
});

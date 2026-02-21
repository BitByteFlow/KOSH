import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { DatabaseService } from '../../database/database.service';
import { Prisma } from '@kosh/db';

describe('AccountsService', () => {
  let accountsService: AccountsService;
  let databaseService: DatabaseService;

  const mockDatabaseService = {
    prisma: {
      $transaction: jest.fn(),
      dailyBalance: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        upsert: jest.fn(),
        count: jest.fn(),
      },
      accountTransaction: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
    } as any,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    accountsService = module.get<AccountsService>(AccountsService);
    databaseService = module.get<DatabaseService>(DatabaseService);

    jest.clearAllMocks();
  });

  describe('createTransaction', () => {
    const userId = 'user-123';
    const validTransaction = {
      type: 'INITIAL_CAPITAL' as const,
      amount: 1000,
      note: 'Initial capital',
    };

    it('should create INITIAL_CAPITAL transaction successfully', async () => {
      const mockDailyBalance = {
        id: 'balance-123',
        userId,
        date: new Date(),
        openingCash: new Prisma.Decimal(1000),
        closingCash: new Prisma.Decimal(1000),
      };

      const mockTransaction = {
        id: 'txn-123',
        userId,
        type: 'INITIAL_CAPITAL',
        amount: new Prisma.Decimal(1000),
        note: 'Initial capital',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDatabaseService.prisma.dailyBalance.count.mockResolvedValue(0);
      mockDatabaseService.prisma.dailyBalance.findFirst.mockResolvedValue(null);
      mockDatabaseService.prisma.dailyBalance.create.mockResolvedValue(mockDailyBalance);
      mockDatabaseService.prisma.accountTransaction.create.mockResolvedValue(mockTransaction);

      mockDatabaseService.prisma.$transaction.mockImplementation(async (fn: any) => {
        return fn(mockDatabaseService.prisma);
      });

      const result = await accountsService.createTransaction(validTransaction, userId);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(databaseService.prisma.dailyBalance.create).toHaveBeenCalled();
      expect(databaseService.prisma.accountTransaction.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException for negative amount', async () => {
      await expect(
        accountsService.createTransaction(
          { type: 'INITIAL_CAPITAL', amount: -100, note: 'Test' },
          userId,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for zero amount', async () => {
      await expect(
        accountsService.createTransaction(
          { type: 'INITIAL_CAPITAL', amount: 0, note: 'Test' },
          userId,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if first transaction is not INITIAL_CAPITAL', async () => {
      mockDatabaseService.prisma.dailyBalance.count.mockResolvedValue(0);

      await expect(
        accountsService.createTransaction(
          { type: 'WITHDRAWAL', amount: 100, note: 'Test' },
          userId,
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException for second INITIAL_CAPITAL on same day', async () => {
      mockDatabaseService.prisma.dailyBalance.count.mockResolvedValue(1);

      await expect(
        accountsService.createTransaction(validTransaction, userId),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException for insufficient funds on WITHDRAWAL', async () => {
      const mockBalance = {
        id: 'balance-123',
        closingCash: new Prisma.Decimal(500),
      };

      mockDatabaseService.prisma.dailyBalance.count.mockResolvedValue(1);
      mockDatabaseService.prisma.dailyBalance.findFirst.mockResolvedValue(mockBalance);

      await expect(
        accountsService.createTransaction(
          { type: 'WITHDRAWAL', amount: 1000, note: 'Test' },
          userId,
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException for insufficient funds on PURCHASE', async () => {
      const mockBalance = {
        id: 'balance-123',
        closingCash: new Prisma.Decimal(500),
      };

      mockDatabaseService.prisma.dailyBalance.count.mockResolvedValue(1);
      mockDatabaseService.prisma.dailyBalance.findFirst.mockResolvedValue(mockBalance);

      await expect(
        accountsService.createTransaction(
          { type: 'PURCHASE', amount: 1000, note: 'Test' },
          userId,
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException for invalid transaction type', async () => {
      mockDatabaseService.prisma.dailyBalance.count.mockResolvedValue(1);
      mockDatabaseService.prisma.dailyBalance.findFirst.mockResolvedValue({
        id: 'balance-123',
        closingCash: new Prisma.Decimal(5000),
      });

      await expect(
        accountsService.createTransaction(
          { type: 'INVALID_TYPE' as any, amount: 100, note: 'Test' },
          userId,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getCurrentCashBalance', () => {
    const userId = 'user-123';

    it('should return current day balance if exists', async () => {
      const mockBalance = {
        id: 'balance-123',
        userId,
        date: new Date(),
        openingCash: new Prisma.Decimal(1000),
        closingCash: new Prisma.Decimal(1500),
        totalCashIn: new Prisma.Decimal(500),
        totalCashOut: new Prisma.Decimal(0),
        totalSales: new Prisma.Decimal(500),
        totalExpense: new Prisma.Decimal(0),
      };

      // Mock the transaction to return the balance directly
      mockDatabaseService.prisma.$transaction.mockImplementation(async () => {
        return {
          success: true,
          message: "Today's balance retrieved successfully",
          data: {
            openingCash: 1000,
            closingCash: 1500,
            totalCashIn: 500,
            totalCashOut: 0,
            totalSales: 500,
            totalExpense: 0,
          },
        };
      });

      const result = await accountsService.getCurrentCashBalance(userId);

      expect(result.success).toBe(true);
      expect(result.data?.openingCash).toBe(1000);
      expect(result.data?.closingCash).toBe(1500);
    });

    it('should create balance with opening cash from yesterday if no balance today', async () => {
      mockDatabaseService.prisma.$transaction.mockImplementation(async () => {
        return {
          success: true,
          message: "Today's balance retrieved successfully",
          data: {
            openingCash: 2000,
            closingCash: 2000,
            totalCashIn: 0,
            totalCashOut: 0,
            totalSales: 0,
            totalExpense: 0,
          },
        };
      });

      const result = await accountsService.getCurrentCashBalance(userId);

      expect(result.data?.openingCash).toBe(2000);
      expect(result.data?.closingCash).toBe(2000);
    });

    it('should return zero balance if no previous balance exists', async () => {
      mockDatabaseService.prisma.$transaction.mockImplementation(async () => {
        return {
          success: true,
          message: "Today's balance retrieved successfully",
          data: {
            openingCash: 0,
            closingCash: 0,
            totalCashIn: 0,
            totalCashOut: 0,
            totalSales: 0,
            totalExpense: 0,
          },
        };
      });

      const result = await accountsService.getCurrentCashBalance(userId);

      expect(result.data?.openingCash).toBe(0);
      expect(result.data?.closingCash).toBe(0);
    });
  });

  describe('getAccountTransactions', () => {
    const userId = 'user-123';

    it('should return paginated transactions', async () => {
      const mockTransactions = [
        {
          id: 'txn-1',
          type: 'INITIAL_CAPITAL',
          amount: new Prisma.Decimal(1000),
          note: 'Initial capital',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'txn-2',
          type: 'SALE_INCOME',
          amount: new Prisma.Decimal(500),
          note: 'Sale',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockDatabaseService.prisma.accountTransaction.findMany.mockResolvedValue(mockTransactions);
      mockDatabaseService.prisma.accountTransaction.count.mockResolvedValue(25);

      const result = await accountsService.getAccountTransactions(userId, 1, 10);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(25);
      expect(result.meta.totalPages).toBe(3);
      expect(result.meta.hasNext).toBe(true);
      expect(result.meta.hasPrev).toBe(false);
    });

    it('should return empty array when no transactions exist', async () => {
      mockDatabaseService.prisma.accountTransaction.findMany.mockResolvedValue([]);
      mockDatabaseService.prisma.accountTransaction.count.mockResolvedValue(0);

      const result = await accountsService.getAccountTransactions(userId, 1, 10);

      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
      expect(result.meta.totalPages).toBe(0);
    });

    it('should sort transactions by createdAt descending by default', async () => {
      mockDatabaseService.prisma.accountTransaction.findMany.mockResolvedValue([]);
      mockDatabaseService.prisma.accountTransaction.count.mockResolvedValue(0);

      await accountsService.getAccountTransactions(userId, 1, 10);

      expect(databaseService.prisma.accountTransaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        }),
      );
    });

    it('should sort by amount when sortBy is amount', async () => {
      mockDatabaseService.prisma.accountTransaction.findMany.mockResolvedValue([]);
      mockDatabaseService.prisma.accountTransaction.count.mockResolvedValue(0);

      await accountsService.getAccountTransactions(userId, 1, 10, 'amount', 'asc');

      expect(databaseService.prisma.accountTransaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { amount: 'asc' },
        }),
      );
    });
  });
});

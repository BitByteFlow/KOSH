import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { DatabaseService } from '../../database/database.service';

describe('AccountsService (Integration)', () => {
  let accountsService: AccountsService;
  let databaseService: DatabaseService;

  const userId = 'user-12345-test';

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccountsService, DatabaseService],
    }).compile();

    accountsService = module.get<AccountsService>(AccountsService);
    databaseService = module.get<DatabaseService>(DatabaseService);

    await databaseService.prisma.$connect();
  });

  afterAll(async () => {
    await databaseService.prisma.accountTransaction.deleteMany({ where: { userId } });
    await databaseService.prisma.dailyBalance.deleteMany({ where: { userId } });
    await databaseService.prisma.$disconnect();
  });

  beforeEach(async () => {
    await databaseService.prisma.accountTransaction.deleteMany({ where: { userId } });
    await databaseService.prisma.dailyBalance.deleteMany({ where: { userId } });
  });


  describe('createTransaction', () => {
    it('should successfully create INITIAL_CAPITAL and initialize daily balance', async () => {
      const dto = {
        type: 'INITIAL_CAPITAL' as const,
        amount: 5000,
        note: 'Starting funds',
      };

      const result = await accountsService.createTransaction(dto, userId);

      expect(result.success).toBe(true);

      const balance = await databaseService.prisma.dailyBalance.findFirst({ where: { userId } });
      const tx = await databaseService.prisma.accountTransaction.findFirst({ where: { userId } });

      expect(Number(balance?.openingCash)).toBe(5000);
      expect(Number(balance?.closingCash)).toBe(5000);
      expect(tx?.type).toBe('INITIAL_CAPITAL');
    });

    it('should block WITHDRAWAL if no INITIAL_CAPITAL exists (First transaction rule)', async () => {
      const dto = { type: 'WITHDRAWAL' as const, amount: 100, note: 'ATM' };

      await expect(
        accountsService.createTransaction(dto, userId)
      ).rejects.toThrow(ConflictException);
    });

    it('should fail when amount is zero or negative', async () => {
      await expect(
        accountsService.createTransaction({ type: 'INITIAL_CAPITAL', amount: 0, note: 'test' }, userId)
      ).rejects.toThrow(BadRequestException);
    });

    it('should correctly update closingCash after multiple transactions', async () => {
      await accountsService.createTransaction({ type: 'INITIAL_CAPITAL', amount: 1000, note: 'seed' }, userId);
      
      await accountsService.createTransaction({ type: 'PURCHASE', amount: 200, note: 'Office supplies' }, userId);

      const balance = await databaseService.prisma.dailyBalance.findFirst({ where: { userId } });
      
      expect(Number(balance?.closingCash)).toBe(800);
    });
  });

  describe('getCurrentCashBalance', () => {
    it('should carry over yesterday’s closing balance to today’s opening balance', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      await databaseService.prisma.dailyBalance.create({
        data: {
          userId,
          date: yesterday,
          openingCash: 500,
          closingCash: 1200, 
        }
      });

      const result = await accountsService.getCurrentCashBalance(userId);

      expect(result.success).toBe(true);
      expect(Number(result.data?.openingCash)).toBe(1200);
      expect(Number(result.data?.closingCash)).toBe(1200);
    });
  });

  describe('getAccountTransactions', () => {
    it('should return transactions in descending order (newest first)', async () => {
      await databaseService.prisma.accountTransaction.createMany({
        data: [
          { userId, type: 'INITIAL_CAPITAL', amount: 100, note: 'First', createdAt: new Date('2025-01-01') },
          { userId, type: 'PURCHASE', amount: 50, note: 'Second', createdAt: new Date('2025-01-02') },
        ]
      });

      const result = await accountsService.getAccountTransactions(userId, 1, 10);

      expect(result.data).toHaveLength(2);
      expect(result.data[0].note).toBe('Second'); 
      expect(result.meta.total).toBe(2);
    });
  });
});
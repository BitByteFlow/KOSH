import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SalesService } from './sale.service';
import { DatabaseService } from '../../database/database.service';
import { Prisma, PaymentStatus } from '@kosh/db';

describe('SalesService', () => {
  let salesService: SalesService;
  let databaseService: DatabaseService;

  const mockDatabaseService = {
    prisma: {
      $transaction: jest.fn(),
      sale: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      productVariant: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      dailyBalance: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      accountTransaction: {
        create: jest.fn(),
      },
      creditAccount: {
        create: jest.fn(),
        update: jest.fn(),
      },
    } as any,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    salesService = module.get<SalesService>(SalesService);
    databaseService = module.get<DatabaseService>(DatabaseService);

    jest.clearAllMocks();
  });

  describe('createSale', () => {
    const userId = 'user-123';
    const validSaleDto = {
      discount: 0,
      paymentType: 'CASH' as const,
      items: [
        {
          variantId: 'var-123',
          quantity: 2,
          sellPrice: 150,
          costPrice: 100,
        },
      ],
      transactionNote: 'Test sale',
    };

    const mockVariant = {
      id: 'var-123',
      productId: 'prod-123',
      stock: 10,
      costPrice: new Prisma.Decimal(100),
      sellingPrice: new Prisma.Decimal(150),
    };

    const mockSale = {
      id: 'sale-123',
      userId,
      total: new Prisma.Decimal(300),
      discount: new Prisma.Decimal(0),
      profit: new Prisma.Decimal(100),
      paymentType: 'CASH',
      creditId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [
        {
          id: 'item-123',
          variantId: 'var-123',
          quantity: 2,
          sellPrice: new Prisma.Decimal(150),
          costPrice: new Prisma.Decimal(100),
        },
      ],
    };

    it('should create sale with CASH payment successfully', async () => {
      mockDatabaseService.prisma.productVariant.findUnique.mockResolvedValue(mockVariant);
      mockDatabaseService.prisma.sale.create.mockResolvedValue(mockSale);

      mockDatabaseService.prisma.$transaction.mockImplementation(async (fn) => {
        return fn(mockDatabaseService.prisma);
      });

      const result = await salesService.createSale(validSaleDto, userId);

      expect(result).toBeDefined();
      expect(databaseService.prisma.sale.create).toHaveBeenCalled();
      expect(databaseService.prisma.productVariant.update).toHaveBeenCalled();
    });

    it('should throw BadRequestException for empty items', async () => {
      await expect(
        salesService.createSale(
          { ...validSaleDto, items: [] },
          userId,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for credit sale without customer', async () => {
      await expect(
        salesService.createSale(
          {
            ...validSaleDto,
            paymentType: 'CREDIT',
            creditId: undefined,
            customerName: undefined,
          },
          userId,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException for non-existent variant', async () => {
      mockDatabaseService.prisma.productVariant.findUnique.mockResolvedValue(null);

      await expect(
        salesService.createSale(validSaleDto, userId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for insufficient stock', async () => {
      const lowStockVariant = { ...mockVariant, stock: 1 };
      mockDatabaseService.prisma.productVariant.findUnique.mockResolvedValue(lowStockVariant);

      await expect(
        salesService.createSale(validSaleDto, userId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for negative total', async () => {
      mockDatabaseService.prisma.productVariant.findUnique.mockResolvedValue(mockVariant);

      await expect(
        salesService.createSale(
          { ...validSaleDto, discount: 500 },
          userId,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should decrement stock after successful sale', async () => {
      mockDatabaseService.prisma.productVariant.findUnique.mockResolvedValue(mockVariant);
      mockDatabaseService.prisma.sale.create.mockResolvedValue(mockSale);

      mockDatabaseService.prisma.$transaction.mockImplementation(async (fn) => {
        return fn(mockDatabaseService.prisma);
      });

      await salesService.createSale(validSaleDto, userId);

      expect(databaseService.prisma.productVariant.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'var-123' },
          data: {
            stock: { decrement: 2 },
          },
        }),
      );
    });

    it('should update daily balance for CASH payment', async () => {
      mockDatabaseService.prisma.productVariant.findUnique.mockResolvedValue(mockVariant);
      mockDatabaseService.prisma.sale.create.mockResolvedValue(mockSale);
      mockDatabaseService.prisma.dailyBalance.findFirst.mockResolvedValue({
        id: 'balance-123',
        closingCash: new Prisma.Decimal(1000),
      });

      mockDatabaseService.prisma.$transaction.mockImplementation(async (fn) => {
        return fn(mockDatabaseService.prisma);
      });

      await salesService.createSale(validSaleDto, userId);

      expect(databaseService.prisma.dailyBalance.update).toHaveBeenCalled();
      expect(databaseService.prisma.accountTransaction.create).toHaveBeenCalled();
    });

    it('should create daily balance if not exists', async () => {
      mockDatabaseService.prisma.productVariant.findUnique.mockResolvedValue(mockVariant);
      mockDatabaseService.prisma.sale.create.mockResolvedValue(mockSale);
      mockDatabaseService.prisma.dailyBalance.findFirst.mockResolvedValue(null);

      mockDatabaseService.prisma.$transaction.mockImplementation(async (fn) => {
        return fn(mockDatabaseService.prisma);
      });

      await salesService.createSale(validSaleDto, userId);

      expect(databaseService.prisma.dailyBalance.create).toHaveBeenCalled();
    });

    it('should create credit account for CREDIT payment', async () => {
      const creditSaleDto = {
        ...validSaleDto,
        paymentType: 'CREDIT' as const,
        customerName: 'Test Customer',
        customerEmail: 'test@example.com',
        customerContact: '9876543210',
      };

      mockDatabaseService.prisma.productVariant.findUnique.mockResolvedValue(mockVariant);
      mockDatabaseService.prisma.sale.create.mockResolvedValue(mockSale);
      mockDatabaseService.prisma.creditAccount.create.mockResolvedValue({
        id: 'credit-123',
        balance: new Prisma.Decimal(300),
      });

      mockDatabaseService.prisma.$transaction.mockImplementation(async (fn) => {
        return fn(mockDatabaseService.prisma);
      });

      await salesService.createSale(creditSaleDto, userId);

      expect(databaseService.prisma.creditAccount.create).toHaveBeenCalled();
    });

    it('should update existing credit account balance', async () => {
      const creditSaleDto = {
        ...validSaleDto,
        paymentType: 'CREDIT' as const,
        creditId: 'credit-123',
      };

      mockDatabaseService.prisma.productVariant.findUnique.mockResolvedValue(mockVariant);
      mockDatabaseService.prisma.sale.create.mockResolvedValue(mockSale);
      mockDatabaseService.prisma.creditAccount.update.mockResolvedValue({
        id: 'credit-123',
        balance: new Prisma.Decimal(600),
      });

      mockDatabaseService.prisma.$transaction.mockImplementation(async (fn) => {
        return fn(mockDatabaseService.prisma);
      });

      await salesService.createSale(creditSaleDto, userId);

      expect(databaseService.prisma.creditAccount.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'credit-123' },
          data: {
            balance: { increment: 300 },
          },
        }),
      );
    });
  });

  describe('getMetrices', () => {
    const userId = 'user-123';

    it('should return today\'s sales metrics', async () => {
      const mockSales = [
        {
          id: 'sale-1',
          total: new Prisma.Decimal(300),
          profit: new Prisma.Decimal(100),
          createdAt: new Date(),
        },
        {
          id: 'sale-2',
          total: new Prisma.Decimal(500),
          profit: new Prisma.Decimal(200),
          createdAt: new Date(),
        },
      ];

      mockDatabaseService.prisma.sale.findMany.mockResolvedValue(mockSales);

      const result = await salesService.getMetrices(userId);

      expect(result.success).toBe(true);
      expect(result.data.totalSales).toBe(800);
      expect(result.data.totalProfit).toBe(300);
      expect(result.data.totalTransactions).toBe(2);
      expect(result.data.avgSaleValue).toBe(400);
    });

    it('should return zero metrics when no sales today', async () => {
      mockDatabaseService.prisma.sale.findMany.mockResolvedValue([]);

      const result = await salesService.getMetrices(userId);

      expect(result.data.totalSales).toBe(0);
      expect(result.data.totalProfit).toBe(0);
      expect(result.data.totalTransactions).toBe(0);
      expect(result.data.avgSaleValue).toBe(0);
    });

    it('should only count today\'s sales', async () => {
      mockDatabaseService.prisma.sale.findMany.mockResolvedValue([]);

      await salesService.getMetrices(userId);

      expect(databaseService.prisma.sale.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: expect.objectContaining({
              gte: expect.any(Date),
            }),
          }),
        }),
      );
    });
  });

  describe('getSales', () => {
    const userId = 'user-123';

    it('should return all sales with items', async () => {
      const mockSales = [
        {
          id: 'sale-123',
          userId,
          total: new Prisma.Decimal(300),
          discount: new Prisma.Decimal(0),
          profit: new Prisma.Decimal(100),
          paymentType: 'CASH',
          creditId: null,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          items: [
            {
              id: 'item-123',
              variantId: 'var-123',
              quantity: 2,
              sellPrice: new Prisma.Decimal(150),
              costPrice: new Prisma.Decimal(100),
            },
          ],
        },
      ];

      mockDatabaseService.prisma.sale.findMany.mockResolvedValue(mockSales);

      const result = await salesService.getSales(userId);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(databaseService.prisma.sale.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId, deletedAt: null },
          include: { items: true },
          orderBy: { createdAt: 'desc' },
        }),
      );
    });

    it('should exclude deleted sales', async () => {
      mockDatabaseService.prisma.sale.findMany.mockResolvedValue([]);

      await salesService.getSales(userId);

      expect(databaseService.prisma.sale.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId,
            deletedAt: null,
          },
        }),
      );
    });
  });
});

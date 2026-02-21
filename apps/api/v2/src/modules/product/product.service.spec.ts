import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { DatabaseService } from '../../database/database.service';
import { Prisma } from '@kosh/db';

describe('ProductService', () => {
  let productService: ProductService;
  let databaseService: DatabaseService;

  const mockDatabaseService = {
    prisma: {
      $transaction: jest.fn(),
      product: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
      category: {
        findUnique: jest.fn(),
      },
      productVariant: {
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
      },
      variantAttribute: {
        create: jest.fn(),
      },
      purchase: {
        create: jest.fn(),
      },
      dailyBalance: {
        upsert: jest.fn(),
        update: jest.fn(),
      },
      accountTransaction: {
        create: jest.fn(),
      },
    } as any,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    productService = module.get<ProductService>(ProductService);
    databaseService = module.get<DatabaseService>(DatabaseService);

    jest.clearAllMocks();
  });

  describe('createProduct', () => {
    const userId = 'user-123';
    const createProductDto = {
      name: 'Test Product',
      categoryId: 'cat-123',
      variants: [
        {
          costPrice: 100,
          sellingPrice: 150,
          stock: 10,
          attributes: [{ name: 'Size', value: 'M' }],
        },
      ],
      keepPurchaseRecord: false,
    };

    const mockCategory = {
      id: 'cat-123',
      name: 'Test Category',
      userId,
    };

    const mockProduct = {
      id: 'prod-123',
      name: 'Test Product',
      categoryId: 'cat-123',
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockVariant = {
      id: 'var-123',
      productId: 'prod-123',
      sku: 'TEST-PRODUCT-0',
      barcode: '1234567890',
      costPrice: new Prisma.Decimal(100),
      sellingPrice: new Prisma.Decimal(150),
      stock: 10,
      status: 'ACTIVE',
    };

    it('should create product successfully', async () => {
      mockDatabaseService.prisma.category.findUnique.mockResolvedValue(mockCategory);
      mockDatabaseService.prisma.product.findFirst.mockResolvedValue(null);
      mockDatabaseService.prisma.product.create.mockResolvedValue(mockProduct);
      mockDatabaseService.prisma.productVariant.create.mockResolvedValue(mockVariant);
      mockDatabaseService.prisma.product.findUnique.mockResolvedValue({
        ...mockProduct,
        category: mockCategory,
        variants: [mockVariant],
      });

      mockDatabaseService.prisma.$transaction.mockImplementation(async (fn) => {
        return fn(mockDatabaseService.prisma);
      });

      const result = await productService.createProduct(userId, createProductDto);

      expect(result.success).toBe(true);
      expect(databaseService.prisma.product.create).toHaveBeenCalled();
      expect(databaseService.prisma.productVariant.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if category does not exist', async () => {
      mockDatabaseService.prisma.category.findUnique.mockResolvedValue(null);

      await expect(
        productService.createProduct(userId, createProductDto),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if active product already exists', async () => {
      const existingProduct = { ...mockProduct, deletedAt: null };
      mockDatabaseService.prisma.category.findUnique.mockResolvedValue(mockCategory);
      mockDatabaseService.prisma.product.findFirst.mockResolvedValue(existingProduct);

      await expect(
        productService.createProduct(userId, createProductDto),
      ).rejects.toThrow(ConflictException);
    });

    it('should reactivate deleted product if same name exists', async () => {
      const deletedProduct = { ...mockProduct, deletedAt: new Date() };
      mockDatabaseService.prisma.category.findUnique.mockResolvedValue(mockCategory);
      mockDatabaseService.prisma.product.findFirst.mockResolvedValue(deletedProduct);
      mockDatabaseService.prisma.product.update.mockResolvedValue({
        ...deletedProduct,
        deletedAt: null,
      });
      mockDatabaseService.prisma.productVariant.create.mockResolvedValue(mockVariant);
      mockDatabaseService.prisma.product.findUnique.mockResolvedValue({
        ...mockProduct,
        deletedAt: null,
        category: mockCategory,
        variants: [mockVariant],
      });

      mockDatabaseService.prisma.$transaction.mockImplementation(async (fn) => {
        return fn(mockDatabaseService.prisma);
      });

      const result = await productService.createProduct(userId, createProductDto);

      expect(result.message).toContain('Reactivated');
      expect(databaseService.prisma.product.update).toHaveBeenCalled();
    });

    it('should create purchase record if keepPurchaseRecord is true', async () => {
      const dtoWithPurchase = { ...createProductDto, keepPurchaseRecord: true };
      mockDatabaseService.prisma.category.findUnique.mockResolvedValue(mockCategory);
      mockDatabaseService.prisma.product.findFirst.mockResolvedValue(null);
      mockDatabaseService.prisma.product.create.mockResolvedValue(mockProduct);
      mockDatabaseService.prisma.productVariant.create.mockResolvedValue(mockVariant);
      mockDatabaseService.prisma.purchase.create.mockResolvedValue({ id: 'purchase-123' });
      mockDatabaseService.prisma.dailyBalance.upsert.mockResolvedValue({ id: 'balance-123' });
      mockDatabaseService.prisma.product.findUnique.mockResolvedValue({
        ...mockProduct,
        category: mockCategory,
        variants: [mockVariant],
      });

      mockDatabaseService.prisma.$transaction.mockImplementation(async (fn) => {
        return fn(mockDatabaseService.prisma);
      });

      await productService.createProduct(userId, dtoWithPurchase);

      expect(databaseService.prisma.purchase.create).toHaveBeenCalled();
      expect(databaseService.prisma.dailyBalance.upsert).toHaveBeenCalled();
      expect(databaseService.prisma.accountTransaction.create).toHaveBeenCalled();
    });
  });

  describe('deleteProduct', () => {
    const userId = 'user-123';
    const productId = 'prod-123';

    const mockProduct = {
      id: productId,
      userId,
      name: 'Test Product',
      categoryId: 'cat-123',
    };

    it('should soft delete product successfully', async () => {
      mockDatabaseService.prisma.product.findUnique.mockResolvedValue(mockProduct);

      mockDatabaseService.prisma.$transaction.mockImplementation(async (fn) => {
        return fn(mockDatabaseService.prisma);
      });

      const result = await productService.deleteProduct(productId, userId);

      expect(result.success).toBe(true);
      expect(databaseService.prisma.product.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: productId },
          data: expect.objectContaining({ deletedAt: expect.any(Date) }),
        }),
      );
    });

    it('should soft delete variants when product is deleted', async () => {
      mockDatabaseService.prisma.product.findUnique.mockResolvedValue(mockProduct);

      mockDatabaseService.prisma.$transaction.mockImplementation(async (fn) => {
        return fn(mockDatabaseService.prisma);
      });

      await productService.deleteProduct(productId, userId);

      expect(databaseService.prisma.productVariant.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { productId },
          data: expect.objectContaining({
            deletedAt: expect.any(Date),
            status: 'IN_ACTIVE',
          }),
        }),
      );
    });

    it('should throw NotFoundException if product does not exist', async () => {
      mockDatabaseService.prisma.product.findUnique.mockResolvedValue(null);

      await expect(
        productService.deleteProduct(productId, userId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if product belongs to different user', async () => {
      mockDatabaseService.prisma.product.findUnique.mockResolvedValue({
        ...mockProduct,
        userId: 'different-user',
      });

      await expect(
        productService.deleteProduct(productId, userId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('listProductsWithVariant', () => {
    const userId = 'user-123';

    it('should return all active products with variants', async () => {
      const mockProducts = [
        {
          id: 'prod-1',
          name: 'Product 1',
          categoryId: 'cat-1',
          userId,
          deletedAt: null,
          category: { name: 'Category 1' },
          variants: [
            {
              id: 'var-1',
              productId: 'prod-1',
              sku: 'PROD1-0',
              barcode: '1234567890',
              costPrice: new Prisma.Decimal(100),
              sellingPrice: new Prisma.Decimal(150),
              stock: 10,
              status: 'ACTIVE',
              deletedAt: null,
              attributes: [],
            },
          ],
        },
      ];

      mockDatabaseService.prisma.product.findMany.mockResolvedValue(mockProducts);

      const result = await productService.listProductsWithVariant(userId);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(databaseService.prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId, deletedAt: null },
        }),
      );
    });

    it('should exclude deleted products', async () => {
      mockDatabaseService.prisma.product.findMany.mockResolvedValue([]);

      await productService.listProductsWithVariant(userId);

      expect(databaseService.prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId,
            deletedAt: null,
          },
        }),
      );
    });
  });

  describe('listProductsWithFilters', () => {
    const userId = 'user-123';

    it('should filter products by search term', async () => {
      mockDatabaseService.prisma.product.count.mockResolvedValue(0);
      mockDatabaseService.prisma.product.findMany.mockResolvedValue([]);

      await productService.listProductsWithFilters(userId, {
        search: 'test',
        page: 1,
        limit: 10,
      });

      expect(databaseService.prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId,
            name: expect.objectContaining({
              contains: 'test',
              mode: 'insensitive',
            }),
          }),
        }),
      );
    });

    it('should filter products by category', async () => {
      mockDatabaseService.prisma.product.count.mockResolvedValue(0);
      mockDatabaseService.prisma.product.findMany.mockResolvedValue([]);

      await productService.listProductsWithFilters(userId, {
        categoryId: 'cat-123',
        page: 1,
        limit: 10,
      });

      expect(databaseService.prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId,
            categoryId: 'cat-123',
          }),
        }),
      );
    });

    it('should filter low stock products', async () => {
      mockDatabaseService.prisma.product.count.mockResolvedValue(0);
      mockDatabaseService.prisma.product.findMany.mockResolvedValue([]);

      await productService.listProductsWithFilters(userId, {
        lowStock: 5,
        page: 1,
        limit: 10,
      });

      expect(databaseService.prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            variants: expect.objectContaining({
              some: expect.objectContaining({
                stock: expect.objectContaining({ lt: 5 }),
              }),
            }),
          }),
        }),
      );
    });

    it('should return paginated results', async () => {
      mockDatabaseService.prisma.product.count.mockResolvedValue(25);
      mockDatabaseService.prisma.product.findMany.mockResolvedValue([]);

      const result = await productService.listProductsWithFilters(userId, {
        page: 2,
        limit: 10,
      });

      expect(result.meta.total).toBe(25);
      expect(result.meta.page).toBe(2);
      expect(result.meta.limit).toBe(10);
      expect(result.meta.totalPages).toBe(3);
    });
  });
});

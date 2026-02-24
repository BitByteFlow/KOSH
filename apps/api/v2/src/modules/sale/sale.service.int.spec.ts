import { Test, TestingModule } from '@nestjs/testing';
import {
	BadRequestException,
	NotFoundException,
} from '@nestjs/common';
import { SalesService } from './sale.service';
import { DatabaseService } from '../../database/database.service';

describe('SalesService', () => {
	let salesService: SalesService;
	let databaseService: DatabaseService;

	const userId = "user-sales-test-id"
	const variantId = "variant-sales-test-id"
	const productId = "product-sales-test-id"

	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				SalesService,
				DatabaseService,
			],
		}).compile();

		salesService = module.get<SalesService>(SalesService);
		databaseService = module.get<DatabaseService>(DatabaseService);

		await databaseService.prisma.$connect()
	})

	beforeEach(async () => {
		await databaseService.prisma.saleItem.deleteMany();
		await databaseService.prisma.sale.deleteMany();
		await databaseService.prisma.dailyBalance.deleteMany();

		await databaseService.prisma.user.upsert({
			where: { id: userId },
			update: {},
			create: { id: userId, email: 'sales@test.com', username: 'sales_tester' },
		});

		// await databaseService.prisma.product.upsert({
		// 	where: { id: productId },
		// 	update: {},
		// 	create: {
		// 		id: productId,
		// 		name: 'Test Product',
		// 		userId,
		// 		category: { create: { name: 'General', userId } },
		// 	},
		// });

		// await databaseService.prisma.productVariant.upsert({
		// 	where: { id: variantId },
		// 	update: { stock: 10 },
		// 	create: {
		// 		id: variantId,
		// 		productId,
		// 		costPrice: 100,
		// 		sellingPrice: 150,
		// 		stock: 10,
		// 	},
		// });
	});

	afterEach(async () => {
		await databaseService.prisma.saleItem.deleteMany({ where: { sale: { userId } } });
		await databaseService.prisma.sale.deleteMany({ where: { userId } });
		await databaseService.prisma.productVariant.deleteMany({ where: { productId } });
		await databaseService.prisma.product.deleteMany({ where: { id: productId } });
		await databaseService.prisma.dailyBalance.deleteMany({ where: { userId } });
		await databaseService.prisma.user.deleteMany({ where: { id: userId } });
		await databaseService.prisma.$disconnect();
	})

	const validSaleDto = {
		discount: 10,
		paymentType: 'CASH' as const,
		items: [{ variantId, quantity: 2, sellPrice: 150, costPrice: 100 }],
		transactionNote: 'Production Test Sale',
	};

	describe('createSale', () => {
		it('should create sale with CASH payment successfully', async () => {
			const result = await salesService.createSale(validSaleDto, userId);

			expect(result).toBeDefined();
			const variant = await databaseService.prisma.productVariant.findUnique({ where: { id: variantId } });
			expect(variant?.stock).toBe(8);

			const balance = await databaseService.prisma.dailyBalance.findFirst({ where: { userId } });
			expect(Number(balance?.closingCash)).toBe(290);

			const sale = await databaseService.prisma.sale.findFirst({
				where: { userId },
				include: { items: true },
			});
			expect(sale?.items).toHaveLength(1);
		});

		// it('should throw BadRequestException for empty items', async () => {
		// 	await expect(
		// 		salesService.createSale(
		// 			{ ...validSaleDto, items: [] },
		// 			userId,
		// 		),
		// 	).rejects.toThrow(BadRequestException);
		// });

		// it('should throw BadRequestException for credit sale without customer', async () => {
		// 	await expect(
		// 		salesService.createSale(
		// 			{
		// 				...validSaleDto,
		// 				paymentType: 'CREDIT',
		// 				creditId: undefined,
		// 				customerName: undefined,
		// 			},
		// 			userId,
		// 		),
		// 	).rejects.toThrow(BadRequestException);
		// });

		// it('should throw NotFoundException for non-existent variant', async () => {
		// 	await expect(
		// 		salesService.createSale(validSaleDto, userId),
		// 	).rejects.toThrow(NotFoundException);
		// });

		// it('should throw BadRequestException for insufficient stock', async () => {
		// 	const overKillDto = 	{...validSaleDto, items:[{...validSaleDto.items[0], quantity: 100}]}
		// 	await expect(
		// 		salesService.createSale(overKillDto, userId),
		// 	).rejects.toThrow(BadRequestException);

		// 	const variant = await databaseService.prisma.productVariant.findUnique({ where: { id: variantId } });
		// 	expect(variant?.stock).toBe(10);
		// });

		// it('should throw BadRequestException for negative total', async () => {
		// 	await expect(
		// 		salesService.createSale(
		// 			{ ...validSaleDto, discount: 500 },
		// 			userId,
		// 		),
		// 	).rejects.toThrow(BadRequestException);
		// });

		// 	it('should decrement stock after successful sale', async () => {
		// 		await salesService.createSale(validSaleDto, userId);
		// 	});

		// 	it('should update daily balance for CASH payment', async () => {
		// 		await salesService.createSale(validSaleDto, userId);

		// 	});

		// 	it('should create daily balance if not exists', async () => {
		// 		await salesService.createSale(validSaleDto, userId);
		// 	});

		// 	it('should create credit account for CREDIT payment', async () => {
		// 		const creditSaleDto = {
		// 			...validSaleDto,
		// 			paymentType: 'CREDIT' as const,
		// 			customerName: 'Test Customer',
		// 			customerEmail: 'test@example.com',
		// 			customerContact: '9876543210',
		// 		};

		// 		await salesService.createSale(creditSaleDto, userId);
		// 	});

		// 	it('should update existing credit account balance', async () => {
		// 		const creditSaleDto = {
		// 			...validSaleDto,
		// 			paymentType: 'CREDIT' as const,
		// 			creditId: 'credit-123',
		// 		};
		// 		await salesService.createSale(creditSaleDto, userId);
		// 	});
		// });

		describe('getMetrices', () => {
			const userId = 'user-123';

			it('should return today\'s sales metrics', async () => {
				await salesService.createSale({ ...validSaleDto, discount: 0 }, userId);
				const result = await salesService.getMetrices(userId);

				expect(result.success).toBe(true);
				expect(result.data?.totalSales).toBe(300);
				expect(result.data?.totalProfit).toBe(100);
				expect(result.data?.totalTransactions).toBe(1);
				expect(result.data?.avgSaleValue).toBe(300);
			});

			// 	it('should return zero metrics when no sales today', async () => {
			// 		const result = await salesService.getMetrices(userId);

			// 		expect(result.data?.totalSales).toBe(0);
			// 		expect(result.data?.totalProfit).toBe(0);
			// 		expect(result.data?.totalTransactions).toBe(0);
			// 		expect(result.data?.avgSaleValue).toBe(0);
			// 	});

			// 	it('should only count today\'s sales', async () => {
			// 		await salesService.getMetrices(userId);
			// 	});
			// });

			// describe('getSales', () => {
			// 	const userId = 'user-123';

			// 	it('should return all sales with items', async () => {
			// 		const result = await salesService.getSales(userId);

			// 		expect(result.success).toBe(true);
			// 		expect(result.data).toHaveLength(1);
			// 	});

			// 	it('should exclude deleted sales', async () => {
			// 		await salesService.getSales(userId);
			// 	});
			// });
		})
	})
})
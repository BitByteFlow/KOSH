import { Test, TestingModule } from '@nestjs/testing';
import { ReportService } from './report.service';
import { DatabaseService } from '../../database/database.service';

describe('ReportService (Integration)', () => {
	let reportService: ReportService;
	let databaseService: DatabaseService;

	const userId = 'user-report-int-test';
	const categoryId = 'cat-report-int-test';
	const productId = 'prod-report-int-test';
	const variantId = 'var-report-int-test';

	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [ReportService, DatabaseService],
		}).compile();

		reportService = module.get<ReportService>(ReportService);
		databaseService = module.get<DatabaseService>(DatabaseService);

		await databaseService.prisma.$connect();
	});

	afterAll(async () => {
		await databaseService.prisma.saleItem.deleteMany({ where: { sale: { userId } } });
		await databaseService.prisma.sale.deleteMany({ where: { userId } });
		await databaseService.prisma.productVariant.deleteMany({ where: { productId } });
		await databaseService.prisma.product.deleteMany({ where: { id: productId } });
		await databaseService.prisma.category.deleteMany({ where: { id: categoryId } });
		await databaseService.prisma.user.deleteMany({ where: { id: userId } });
		await databaseService.prisma.$disconnect();
	});

	beforeEach(async () => {
		await databaseService.prisma.saleItem.deleteMany({ where: { sale: { userId } } });
		await databaseService.prisma.sale.deleteMany({ where: { userId } });

		await databaseService.prisma.user.upsert({
			where: { id: userId },
			update: {},
			create: { id: userId, email: 'report-test@example.com', username: 'report_tester' },
		});

		await databaseService.prisma.category.upsert({
			where: { id: categoryId },
			update: {},
			create: { id: categoryId, name: 'Report Test Category', userId },
		});

		await databaseService.prisma.product.upsert({
			where: { id: productId },
			update: {},
			create: { id: productId, name: 'Report Test Product', userId, categoryId },
		});

		await databaseService.prisma.productVariant.upsert({
			where: { id: variantId },
			update: { stock: 100 },
			create: {
				id: variantId,
				productId,
				costPrice: 100,
				sellingPrice: 200,
				stock: 100,
				sku: "SKU-TEST",
				barcode: "BARCODE-TEST"
			},
		});
	});

	describe('calculateMetrics (via getAnalyticsMetrics)', () => {
		it('should calculate metrics based on persisted sales', async () => {
			await databaseService.prisma.sale.create({
				data: {
					userId,
					total: 200,
					profit: 100,
					paymentType: 'CASH',
					discount: 0,
					items: {
						create: {
							variantId,
							quantity: 1,
							sellPrice: 200,
							costPrice: 100,
						},
					},
				},
			});

			const start = new Date();
			start.setHours(0, 0, 0, 0);
			const end = new Date();
			end.setHours(23, 59, 59, 999);

			const result = await reportService.getAnalyticsMetrics(userId, start, end);

			expect(result.success).toBe(true);
			const salesMetric = result.data?.find(m => m.label === 'TOTAL SALES');
			expect(salesMetric?.value).toBe(200);

			const profitMetric = result.data?.find(m => m.label === 'TOTAL PROFIT');
			expect(profitMetric?.value).toBe(100);
		});
	});

	describe('getTopProducts', () => {
		it('should aggregate sales items into top products', async () => {
			await databaseService.prisma.sale.create({
				data: {
					userId,
					total: 400,
					profit: 200,
					paymentType: 'CASH',
					discount: 0,
					items: {
						create: {
							variantId,
							quantity: 2,
							sellPrice: 200,
							costPrice: 100,
						},
					},
				},
			});

			const start = new Date();
			start.setDate(start.getDate() - 1);
			const end = new Date();
			end.setDate(end.getDate() + 1);

			const result = await reportService.getTopProducts(userId, start, end);

			expect(result.success).toBe(true);
			expect(result.data).toBeDefined();
			expect(result.data?.[0].name).toBe('Report Test Product');
			expect(result.data?.[0].value).toBe(400);
		});
	});
});

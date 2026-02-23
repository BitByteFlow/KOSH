import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { ReportService } from './report.service';
import { DatabaseService } from '../../database/database.service';
import { Prisma } from '@kosh/db';

describe('ReportService (Unit)', () => {
	let reportService: ReportService;
	let databaseService: DatabaseService;

	const mockDatabaseService = {
		prisma: {
			sale: {
				findMany: jest.fn(),
				count: jest.fn(),
			},
			saleItem: {
				findMany: jest.fn(),
			},
			product: {
				findMany: jest.fn(),
			},
		},
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ReportService,
				{
					provide: DatabaseService,
					useValue: mockDatabaseService,
				},
			],
		}).compile();

		reportService = module.get<ReportService>(ReportService);
		databaseService = module.get<DatabaseService>(DatabaseService);

		jest.clearAllMocks();
	});

	const userId = 'user-123';
	const startDate = new Date('2024-01-01');
	const endDate = new Date('2024-01-31');

	describe('getAnalyticsMetrics', () => {
		it('should return metrics with trend data', async () => {
			const mockSales = [
				{ total: new Prisma.Decimal(1000), profit: new Prisma.Decimal(200) },
				{ total: new Prisma.Decimal(500), profit: new Prisma.Decimal(100) },
			];

			(databaseService.prisma.sale.findMany as jest.Mock)
				.mockResolvedValueOnce(mockSales) // current range
				.mockResolvedValueOnce([{ total: new Prisma.Decimal(1000), profit: new Prisma.Decimal(200) }]); 

			const result = await reportService.getAnalyticsMetrics(userId, startDate, endDate);

			expect(result.success).toBe(true);
			expect(result.data).toHaveLength(4);
			expect(result.data?.find(m => m.label === 'TOTAL SALES')?.value).toBe(1500);
			expect(result.data?.find(m => m.label === 'TOTAL PROFIT')?.value).toBe(300);
			expect(result.data?.find(m => m.label === 'TRANSACTIONS')?.value).toBe(2);
		});

		it('should throw InternalServerErrorException on error', async () => {
			(databaseService.prisma.sale.findMany as jest.Mock).mockRejectedValue(new Error('DB Error'));

			await expect(reportService.getAnalyticsMetrics(userId, startDate, endDate))
				.rejects.toThrow(InternalServerErrorException);
		});
	});

	describe('getSalesTrend', () => {
		it('should return daily sales trend', async () => {
			const mockSales = [
				{ total: new Prisma.Decimal(100), createdAt: new Date('2024-01-01T10:00:00Z') },
				{ total: new Prisma.Decimal(200), createdAt: new Date('2024-01-01T15:00:00Z') },
				{ total: new Prisma.Decimal(300), createdAt: new Date('2024-01-02T10:00:00Z') },
			];

			(databaseService.prisma.sale.findMany as jest.Mock).mockResolvedValue(mockSales);

			const result = await reportService.getSalesTrend(userId, new Date('2024-01-01'), new Date('2024-01-02'));

			expect(result.success).toBe(true);
			expect(result.data).toHaveLength(2);
			expect(result.data?.[0].value).toBe(300); 
			expect(result.data?.[1].value).toBe(300);
		});
	});

	describe('getTopProducts', () => {
		it('should return top 5 products by revenue', async () => {
			const mockSaleItems = [
				{
					quantity: 2,
					sellPrice: new Prisma.Decimal(100),
					variant: { product: { name: 'Prod A' } },
				},
				{
					quantity: 1,
					sellPrice: new Prisma.Decimal(500),
					variant: { product: { name: 'Prod B' } },
				},
			];

			(databaseService.prisma.saleItem.findMany as jest.Mock).mockResolvedValue(mockSaleItems);

			const result = await reportService.getTopProducts(userId, startDate, endDate);

			expect(result.success).toBe(true);
			expect(result.data?.[0].name).toBe('Prod B'); 
			expect(result.data?.[1].name).toBe('Prod A'); 
		});
	});

	describe('getSalesReport', () => {
		it('should return sales report with proper mapping', async () => {
			const mockSales = [
				{
					id: 'sale-1',
					createdAt: new Date('2024-01-01'),
					total: new Prisma.Decimal(1000),
					paymentType: 'CASH',
					creditId: null,
					credit: null,
					_count: { items: 2 },
				},
			];

			(databaseService.prisma.sale.findMany as jest.Mock).mockResolvedValue(mockSales);

			const result = await reportService.getSalesReport(userId, { startDate: '2024-01-01', endDate: '2024-01-31' });

			expect(result.success).toBe(true);
			expect(result.data?.[0].customer).toBe('Walk-in Customer');
			expect(result.data?.[0].status).toBe('Completed');
		});
	});

	describe('getInventoryReport', () => {
		it('should return inventory status and value', async () => {
			const mockProducts = [
				{
					id: 'prod-1',
					name: 'Low Stock Prod',
					category: { name: 'Cat A' },
					variants: [
						{ sku: 'SKU-1', stock: 2, costPrice: new Prisma.Decimal(100), lowStock: true },
					],
				},
			];

			(databaseService.prisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts);

			const result = await reportService.getInventoryReport(userId, { skip: 0, take: 10 });

			expect(result.success).toBe(true);
			expect(result.data?.[0].status).toBe('Low Stock');
			expect(result.data?.[0].value).toBe(200);
		});
	});
});

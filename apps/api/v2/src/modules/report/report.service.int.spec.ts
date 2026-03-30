import {
	TestContext,
	createTestContext,
	generateTestId,
} from "test/test-utils";
import { PrismaClient } from "@kosh/db";
import { ReportService } from "./report.service";
import { DatabaseService } from "../../database/database.service";
import { SalesService } from "../sale/sale.service";
import { ProductService } from "../product/product.service";
import { PurchasesService } from "../purchase/purchase.service";
import { NotificationService } from "../notification/notification.service";

describe("ReportService Integration Tests", () => {
	let context: TestContext;
	let reportService: ReportService;
	let prisma: PrismaClient;
	let notificationService: NotificationService;
	let databaseService: DatabaseService;
	let salesService: SalesService;
	let productService: ProductService;
	let purchasesService: PurchasesService;

	let testUserId: string;
	let testStoreId: string;
	let testVariantId: string;
	let testProductId: string;
	let testCategoryId: string;

	beforeAll(async () => {
		context = await createTestContext();
		testUserId = context.userId;
		testStoreId = context.storeId;

		databaseService = context.databaseService;
		prisma = databaseService.prisma;

		notificationService = context.app.get<NotificationService>(NotificationService);
		salesService = context.app.get<SalesService>(SalesService);
		productService = context.app.get<ProductService>(ProductService);
		purchasesService = context.app.get<PurchasesService>(PurchasesService);
		reportService = context.app.get<ReportService>(ReportService);

		const category = await prisma.category.create({
			data: {
				name: generateTestId("Electronics"),
				storeId: testStoreId,
			},
		});
		testCategoryId = category.id;

		const product = await prisma.product.create({
			data: {
				name: generateTestId("Test Product"),
				storeId: testStoreId,
				categoryId: testCategoryId,
			},
		});
		testProductId = product.id;

		const variant = await prisma.productVariant.create({
			data: {
				productId: testProductId,
				storeId: testStoreId,
				sku: generateTestId("SKU"),
				barcode: generateTestId("BARCODE"),
				costPrice: 100,
				sellingPrice: 150,
				stock: 100,
				status: "ACTIVE",
			},
		});
		testVariantId = variant.id;
	});

	afterAll(async () => {
		await context.close();
	});

	beforeEach(async () => {
		await prisma.saleItem.deleteMany();
		await prisma.sale.deleteMany();
		await prisma.purchaseItem.deleteMany();
		await prisma.purchase.deleteMany();
		await prisma.accountTransaction.deleteMany();
		await prisma.dailyBalance.deleteMany();
		await prisma.creditAccount.deleteMany();

		await prisma.productVariant.update({
			where: { id: testVariantId },
			data: { stock: 100 },
		});
	});

	describe("getAnalyticsMetrics", () => {
		it("should return analytics metrics for date range", async () => {
			const today = new Date();
			const startDate = new Date(today);
			startDate.setDate(startDate.getDate() - 7);
			const endDate = new Date(today);
			endDate.setDate(endDate.getDate() + 1); 

			for (let i = 0; i < 5; i++) {
				await salesService.createSale(
					{
						storeId: testStoreId,
						discount: 0,
						paymentType: "CASH" as const,
						items: [
							{
								variantId: testVariantId,
								quantity: 2,
								sellPrice: 150,
								costPrice: 100,
							},
						],
					},
					testUserId,
				);
			}

			const result = await reportService.getAnalyticsMetrics(
				testStoreId,
				startDate,
				endDate,
			);

			expect(result.success).toBe(true);
			expect(result.data).toHaveLength(4);

			const totalSalesMetric = result.data?.find((m) => m.label === "TOTAL SALES");
			expect(totalSalesMetric).toBeDefined();
			expect(totalSalesMetric?.value).toBe(1500); // 5 sales * 300

			const totalProfitMetric = result.data?.find(
				(m) => m.label === "TOTAL PROFIT",
			);
			expect(totalProfitMetric).toBeDefined();
			expect(totalProfitMetric?.value).toBe(500); // 5 sales * 100

			const transactionsMetric = result.data?.find(
				(m) => m.label === "TRANSACTIONS",
			);
			expect(transactionsMetric).toBeDefined();
			expect(transactionsMetric?.value).toBe(5);

			const avgBillValueMetric = result.data?.find(
				(m) => m.label === "AVG BILL VALUE",
			);
			expect(avgBillValueMetric).toBeDefined();
			expect(avgBillValueMetric?.value).toBe(300);
		});

		it("should return zero metrics when no sales exist", async () => {
			const today = new Date();
			const startDate = new Date(today);
			startDate.setDate(startDate.getDate() - 7);
			const endDate = new Date(today);
			endDate.setDate(endDate.getDate() + 1);

			const result = await reportService.getAnalyticsMetrics(
				testStoreId,
				startDate,
				endDate,
			);

			expect(result.success).toBe(true);
			expect(result.data).toHaveLength(4);

			result.data?.forEach((metric) => {
				expect(metric.value).toBe(0);
			});
		});

		it("should calculate trend compared to previous period", async () => {
			const today = new Date();
			const endDate = new Date(today);
			endDate.setDate(endDate.getDate() + 1);
			const startDate = new Date(today);
			startDate.setDate(startDate.getDate() - 7);

			
			for (let i = 0; i < 10; i++) {
				await salesService.createSale(
					{
						storeId: testStoreId,
						discount: 0,
						paymentType: "CASH" as const,
						items: [
							{
								variantId: testVariantId,
								quantity: 1,
								sellPrice: 100,
								costPrice: 50,
							},
						],
					},
					testUserId,
				);
			}

			const result = await reportService.getAnalyticsMetrics(
				testStoreId,
				startDate,
				endDate,
			);

			expect(result.success).toBe(true);
			const totalSalesMetric = result.data?.find((m) => m.label === "TOTAL SALES");
			expect(totalSalesMetric?.value).toBe(1000);
			expect(totalSalesMetric?.trend).toBeDefined();
		});

		it("should handle date range with single day", async () => {
			const today = new Date();
			const startDate = new Date(today);
			const endDate = new Date(today);
			endDate.setDate(endDate.getDate() + 1);

			await salesService.createSale(
				{
					storeId: testStoreId,
					discount: 0,
					paymentType: "CASH" as const,
					items: [
						{
							variantId: testVariantId,
							quantity: 1,
							sellPrice: 200,
							costPrice: 100,
						},
					],
				},
				testUserId,
			);

			const result = await reportService.getAnalyticsMetrics(
				testStoreId,
				startDate,
				endDate,
			);

			expect(result.success).toBe(true);
			const totalSalesMetric = result.data?.find((m) => m.label === "TOTAL SALES");
			expect(totalSalesMetric?.value).toBe(200);
		});
	});

	describe("getSalesTrend", () => {
		it("should return daily sales trend for date range", async () => {
			const today = new Date();
			const startDate = new Date(today);
			startDate.setDate(startDate.getDate() - 6);
			const endDate = new Date(today);
			endDate.setDate(endDate.getDate() + 1);

			await salesService.createSale(
				{
					storeId: testStoreId,
					discount: 0,
					paymentType: "CASH" as const,
					items: [
						{
							variantId: testVariantId,
							quantity: 2,
							sellPrice: 150,
							costPrice: 100,
						},
					],
				},
				testUserId,
			);

			const result = await reportService.getSalesTrend(
				testStoreId,
				startDate,
				endDate,
			);

			expect(result.success).toBe(true);
			expect(result.data!).toHaveLength(8);

			const todayStr = today.toISOString().split("T")[0];
			const todayTrend = result.data!.find((t) => t.label === todayStr);
			expect(todayTrend).toBeDefined();
			expect(todayTrend?.value).toBe(300);
		});

		it("should return zero for days without sales", async () => {
			const today = new Date();
			const startDate = new Date(today);
			startDate.setDate(startDate.getDate() - 6);
			const endDate = new Date(today);
			endDate.setDate(endDate.getDate() + 1);

			const result = await reportService.getSalesTrend(
				testStoreId,
				startDate,
				endDate,
			);

			expect(result.success).toBe(true);
			expect(result.data!).toHaveLength(8);

			const zeroDays = result.data!.filter((t) => t.value === 0);
			expect(zeroDays.length).toBeGreaterThanOrEqual(6);
		});

		it("should aggregate multiple sales per day", async () => {
			const today = new Date();
			const startDate = new Date(today);
			const endDate = new Date(today);
			endDate.setDate(endDate.getDate() + 1);

			for (let i = 0; i < 3; i++) {
				await salesService.createSale(
					{
						storeId: testStoreId,
						discount: 0,
						paymentType: "CASH" as const,
						items: [
							{
								variantId: testVariantId,
								quantity: 1,
								sellPrice: 100,
								costPrice: 50,
							},
						],
					},
					testUserId,
				);
			}

			const result = await reportService.getSalesTrend(
				testStoreId,
				startDate,
				endDate,
			);

			expect(result.success).toBe(true);
			const todayStr = today.toISOString().split("T")[0];
			const todayTrend = result.data!.find((t) => t.label === todayStr);
			expect(todayTrend?.value).toBe(300);
		});
	});

	describe("getTopProducts", () => {
		it("should return top products by revenue", async () => {
			const today = new Date();
			const startDate = new Date(today);
			const endDate = new Date(today);
			endDate.setDate(endDate.getDate() + 1);

			for (let i = 0; i < 5; i++) {
				await salesService.createSale(
					{
						storeId: testStoreId,
						discount: 0,
						paymentType: "CASH" as const,
						items: [
							{
								variantId: testVariantId,
								quantity: 2,
								sellPrice: 150,
								costPrice: 100,
							},
						],
					},
					testUserId,
				);
			}

			const result = await reportService.getTopProducts(
				testStoreId,
				startDate,
				endDate,
			);

			expect(result.success).toBe(true);
			expect(result.data?.length).toBeGreaterThanOrEqual(1);

			const topProduct = result.data![0];
			expect(topProduct.name).toContain("Test Product");
			expect(topProduct.value).toBe(1500); 
			expect(topProduct.revenue).toBe("Rs. 1,500");
		});

		it("should return empty array when no sales exist", async () => {
			const today = new Date();
			const startDate = new Date(today);
			const endDate = new Date(today);
			endDate.setDate(endDate.getDate() + 1);

			const result = await reportService.getTopProducts(
				testStoreId,
				startDate,
				endDate,
			);

			expect(result.success).toBe(true);
			expect(result.data).toHaveLength(0);
		});

		it("should return paginated transactions with total count", async () => {
			const products = [];
			for (let i = 0; i < 15; i++) {
				const product = await prisma.product.create({
					data: {
						name: generateTestId(`Product ${i}`),
						storeId: testStoreId,
						categoryId: testCategoryId,
					},
				});
				products.push(product);
			}

			for (const product of products) {
				const variant = await prisma.productVariant.create({
					data: {
						productId: product.id,
						storeId: testStoreId,
						sku: generateTestId("SKU" + products.indexOf(product)),
						barcode: generateTestId("BARCODE" + products.indexOf(product)),
						costPrice: 100,
						sellingPrice: 150 + products.indexOf(product) * 10,
						stock: 100,
						status: "ACTIVE",
					},
				});

				await salesService.createSale(
					{
						storeId: testStoreId,
						discount: 0,
						paymentType: "CASH" as const,
						items: [
							{
								variantId: variant.id,
								quantity: 1,
								sellPrice: Number(variant.sellingPrice),
								costPrice: Number(variant.costPrice),
							},
						],
					},
					testUserId,
				);
			}

			const today = new Date();
			const startDate = new Date(today);
			startDate.setDate(startDate.getDate() - 2);
			const endDate = new Date(today);
			endDate.setDate(endDate.getDate() + 2);

			const result = await reportService.getAnalyticsTransactions(testStoreId, {
				startDate: startDate,
				endDate: endDate,
				skip: 0,
				take: 10,
			});

			expect(result.data!.length).toBe(10);
			expect(result.totalCount).toBeGreaterThanOrEqual(15);
		});

		it("should sort products by revenue descending", async () => {
			const today = new Date();

			const variant1 = await prisma.productVariant.create({
				data: {
					productId: testProductId,
					storeId: testStoreId,
					sku: generateTestId("SKU1"),
					barcode: generateTestId("BARCODE1"),
					costPrice: 100,
					sellingPrice: 100,
					stock: 100,
					status: "ACTIVE",
				},
			});

			await salesService.createSale(
				{
					storeId: testStoreId,
					discount: 0,
					paymentType: "CASH" as const,
					items: [{ variantId: variant1.id, quantity: 5, sellPrice: 100, costPrice: 100 }],
				},
				testUserId,
			);

			const result = await reportService.getTopProducts(
				testStoreId,
				today,
				today,
			);

			expect(result.success).toBe(true);
			if (result.data!.length > 1) {
				for (let i = 1; i < result.data!.length; i++) {
					expect(result.data![i - 1].value).toBeGreaterThanOrEqual(
						result.data![i].value,
					);
				}
			}
		});
	});

	describe("getSalesReport", () => {
		it("should return sales report with all sales", async () => {
			for (let i = 0; i < 3; i++) {
				await salesService.createSale(
					{
						storeId: testStoreId,
						discount: 0,
						paymentType: "CASH" as const,
						items: [
							{
								variantId: testVariantId,
								quantity: 1,
								sellPrice: 150,
								costPrice: 100,
							},
						],
					},
					testUserId,
				);
			}

			const result = await reportService.getSalesReport(testStoreId, {});

			expect(result.success).toBe(true);
			expect(result.data.length).toBeGreaterThanOrEqual(3);

			result.data.forEach((sale) => {
				expect(sale.id).toBeDefined();
				expect(sale.date).toBeDefined();
				expect(sale.total).toBe(150);
				expect(sale.payment).toBe("CASH");
			});
		});

		it("should filter sales by date range", async () => {
			const today = new Date();
			const yesterday = new Date(today);
			yesterday.setDate(yesterday.getDate() - 1);

			await salesService.createSale(
				{
					storeId: testStoreId,
					discount: 0,
					paymentType: "CASH" as const,
					items: [
						{
							variantId: testVariantId,
							quantity: 1,
							sellPrice: 150,
							costPrice: 100,
						},
					],
				},
				testUserId,
			);

			const result = await reportService.getSalesReport(testStoreId, {
				startDate: today.toISOString(),
				endDate: today.toISOString(),
			});

			expect(result.success).toBe(true);
			result.data.forEach((sale) => {
				expect(sale.date).toBe(today.toISOString().split("T")[0]);
			});
		});

		it("should filter sales by payment method", async () => {
			await salesService.createSale(
				{
					storeId: testStoreId,
					discount: 0,
					paymentType: "CASH" as const,
					items: [
						{
							variantId: testVariantId,
							quantity: 1,
							sellPrice: 150,
							costPrice: 100,
						},
					],
				},
				testUserId,
			);

			await salesService.createSale(
				{
					storeId: testStoreId,
					discount: 0,
					paymentType: "ONLINE" as const,
					items: [
						{
							variantId: testVariantId,
							quantity: 1,
							sellPrice: 200,
							costPrice: 100,
						},
					],
				},
				testUserId,
			);

			const result = await reportService.getSalesReport(testStoreId, {
				paymentMethods: ["CASH"],
			});

			expect(result.success).toBe(true);
			result.data.forEach((sale) => {
				expect(sale.payment).toBe("CASH");
			});
		});

		it("should filter sales by status", async () => {
			await salesService.createSale(
				{
					storeId: testStoreId,
					discount: 0,
					paymentType: "CASH" as const,
					items: [
						{
							variantId: testVariantId,
							quantity: 1,
							sellPrice: 150,
							costPrice: 100,
						},
					],
				},
				testUserId,
			);

			await salesService.createSale(
				{
					storeId: testStoreId,
					discount: 0,
					paymentType: "CREDIT" as const,
					items: [
						{
							variantId: testVariantId,
							quantity: 1,
							sellPrice: 200,
							costPrice: 100,
						},
					],
					customerName: "Credit Customer",
				},
				testUserId,
			);

			const result = await reportService.getSalesReport(testStoreId, {
				statuses: ["Completed"],
			});

			expect(result.success).toBe(true);
			result.data.forEach((sale) => {
				expect(sale.status).toBe("Completed");
			});
		});

		it("should search sales by ID", async () => {
			const sale = await salesService.createSale(
				{
					storeId: testStoreId,
					discount: 0,
					paymentType: "CASH" as const,
					items: [
						{
							variantId: testVariantId,
							quantity: 1,
							sellPrice: 150,
							costPrice: 100,
						},
					],
				},
				testUserId,
			);

			const saleId = sale.data?.[0].id;

			const result = await reportService.getSalesReport(testStoreId, {
				searchQuery: saleId?.substring(0, 8),
			});

			expect(result.success).toBe(true);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
		});

		it("should search sales by customer name", async () => {
			await salesService.createSale(
				{
					storeId: testStoreId,
					discount: 0,
					paymentType: "CREDIT" as const,
					items: [
						{
							variantId: testVariantId,
							quantity: 1,
							sellPrice: 150,
							costPrice: 100,
						},
					],
					customerName: "John Doe",
				},
				testUserId,
			);

			const result = await reportService.getSalesReport(testStoreId, {
				searchQuery: "John",
			});

			expect(result.success).toBe(true);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data[0].customer).toBe("John Doe");
		});

		it("should include item count", async () => {
			await salesService.createSale(
				{
					storeId: testStoreId,
					discount: 0,
					paymentType: "CASH" as const,
					items: [
						{
							variantId: testVariantId,
							quantity: 1,
							sellPrice: 150,
							costPrice: 100,
						},
						{
							variantId: testVariantId,
							quantity: 2,
							sellPrice: 150,
							costPrice: 100,
						},
					],
				},
				testUserId,
			);

			const result = await reportService.getSalesReport(testStoreId, {});

			expect(result.success).toBe(true);
			expect(result.data[0].items).toBe(2);
		});

		it("should show walk-in customer for non-credit sales", async () => {
			await salesService.createSale(
				{
					storeId: testStoreId,
					discount: 0,
					paymentType: "CASH" as const,
					items: [
						{
							variantId: testVariantId,
							quantity: 1,
							sellPrice: 150,
							costPrice: 100,
						},
					],
				},
				testUserId,
			);

			const result = await reportService.getSalesReport(testStoreId, {});

			expect(result.success).toBe(true);
			expect(result.data[0].customer).toBe("Walk-in Customer");
		});
	});

	describe("getProductPerformance", () => {
		it("should return product performance metrics", async () => {
			for (let i = 0; i < 5; i++) {
				await salesService.createSale(
					{
						storeId: testStoreId,
						discount: 0,
						paymentType: "CASH" as const,
						items: [
							{
								variantId: testVariantId,
								quantity: 2,
								sellPrice: 150,
								costPrice: 100,
							},
						],
					},
					testUserId,
				);
			}

			const today = new Date();
			const result = await reportService.getProductPerformance(testStoreId, {
				startDate: today.toISOString(),
				endDate: today.toISOString(),
				skip: 0,
				take: 10,
			});

			expect(result.items).toBeDefined();
			expect(result.totalCount).toBeGreaterThanOrEqual(1);

			const product = result.items.find((p) => p.name === generateTestId("Test Product"));
			if (product) {
				expect(product.sold).toBe(10); // 5 sales * 2 items
				expect(product.revenue).toBe(1500); // 10 * 150
			}
		});

		it("should filter products by category", async () => {
			const today = new Date();
			const result = await reportService.getProductPerformance(testStoreId, {
				startDate: today.toISOString(),
				endDate: today.toISOString(),
				categories: [generateTestId("Electronics")],
				skip: 0,
				take: 10,
			});

			expect(result.items).toBeDefined();
		});

		it("should filter products by minimum sold", async () => {
			for (let i = 0; i < 10; i++) {
				await salesService.createSale(
					{
						storeId: testStoreId,
						discount: 0,
						paymentType: "CASH" as const,
						items: [
							{
								variantId: testVariantId,
								quantity: 1,
								sellPrice: 150,
								costPrice: 100,
							},
						],
					},
					testUserId,
				);
			}

			const today = new Date();
			const result = await reportService.getProductPerformance(testStoreId, {
				startDate: today.toISOString(),
				endDate: today.toISOString(),
				minSold: 5,
				skip: 0,
				take: 10,
			});

			expect(result.items).toBeDefined();
			result.items.forEach((product) => {
				expect(product.sold).toBeGreaterThanOrEqual(5);
			});
		});

		it("should filter products by maximum sold", async () => {
			const today = new Date();
			const result = await reportService.getProductPerformance(testStoreId, {
				startDate: today.toISOString(),
				endDate: today.toISOString(),
				maxSold: 100,
				skip: 0,
				take: 10,
			});

			expect(result.items).toBeDefined();
			result.items.forEach((product) => {
				expect(product.sold).toBeLessThanOrEqual(100);
			});
		});

		it("should search products by name", async () => {
			const today = new Date();
			const result = await reportService.getProductPerformance(testStoreId, {
				startDate: today.toISOString(),
				endDate: today.toISOString(),
				searchQuery: "Test Product",
				skip: 0,
				take: 10,
			});

			expect(result.items).toBeDefined();
			result.items.forEach((product) => {
				expect(product.name).toContain("Test Product");
			});
		});

		it("should paginate results", async () => {
			for (let i = 0; i < 15; i++) {
				const product = await prisma.product.create({
					data: {
						name: generateTestId(`Product ${i}`),
						storeId: testStoreId,
						categoryId: testCategoryId,
					},
				});

				await prisma.productVariant.create({
					data: {
						productId: product.id,
						storeId: testStoreId,
						sku: generateTestId(`SKU${i}`),
						barcode: generateTestId(`BARCODE${i}`),
						costPrice: 100,
						sellingPrice: 150,
						stock: 100,
						status: "ACTIVE",
					},
				});
			}

			const today = new Date();
			const result = await reportService.getProductPerformance(testStoreId, {
				startDate: today.toISOString(),
				endDate: today.toISOString(),
				skip: 0,
				take: 10,
			});

			expect(result.items.length).toBeLessThanOrEqual(10);
			expect(result.totalCount).toBeGreaterThanOrEqual(15);
		});

		it("should calculate margin correctly", async () => {
			for (let i = 0; i < 5; i++) {
				await salesService.createSale(
					{
						storeId: testStoreId,
						discount: 0,
						paymentType: "CASH" as const,
						items: [
							{
								variantId: testVariantId,
								quantity: 1,
								sellPrice: 150,
								costPrice: 100,
							},
						],
					},
					testUserId,
				);
			}

			const today = new Date();
			const result = await reportService.getProductPerformance(testStoreId, {
				startDate: today.toISOString(),
				endDate: today.toISOString(),
				skip: 0,
				take: 10,
			});

			const product = result.items.find((p) => p.name === generateTestId("Test Product"));
			if (product) {
				expect(product.margin).toBeCloseTo(33.33, 2);
			}
		});
	});

	describe("getInventoryReport", () => {
		it("should return inventory report for all products", async () => {
			const result = await reportService.getInventoryReport(testStoreId, {
				skip: 0,
				take: 10,
			});

			expect(result.success).toBe(true);
			expect(result.data).toBeDefined();
			expect(result.totalCount).toBeGreaterThanOrEqual(1);

			result.data?.forEach((item) => {
				expect(item.id).toBeDefined();
				expect(item.name).toBeDefined();
				expect(item.stock).toBeDefined();
				expect(item.status).toBeDefined();
			});
		});

		it("should calculate total stock from variants", async () => {
			const result = await reportService.getInventoryReport(testStoreId, {
				skip: 0,
				take: 10,
			});

			const product = result.data?.find((p) => p.name === generateTestId("Test Product"));
			if (product) {
				expect(product.stock).toBe(100);
			}
		});

		it("should calculate inventory value", async () => {
			const result = await reportService.getInventoryReport(testStoreId, {
				skip: 0,
				take: 10,
			});

			const product = result.data?.find((p) => p.name === generateTestId("Test Product"));
			if (product) {
				expect(product.value).toBe(10000);
			}
		});

		it("should determine stock status correctly", async () => {
			const oosName = generateTestId("Out of Stock Product");
			const product = await prisma.product.create({
				data: {
					name: oosName,
					storeId: testStoreId,
					categoryId: testCategoryId,
				},
			});

			await prisma.productVariant.create({
				data: {
					productId: product.id,
					storeId: testStoreId,
					sku: generateTestId("SKU-OOS"),
					barcode: generateTestId("BARCODE-OOS"),
					costPrice: 100,
					sellingPrice: 150,
					stock: 0,
					status: "ACTIVE",
				},
			});

			const result = await reportService.getInventoryReport(testStoreId, {
				skip: 0,
				take: 10,
			});

			const oosProduct = result.data?.find((p) => p.name === oosName);
			expect(oosProduct).toBeDefined();
			expect(oosProduct?.status).toBe("Out of Stock");
		});

		it("should identify low stock products", async () => {
			const lowStockName = generateTestId("Low Stock Product");
			const product = await prisma.product.create({
				data: {
					name: lowStockName,
					storeId: testStoreId,
					categoryId: testCategoryId,
				},
			});

			await prisma.productVariant.create({
				data: {
					productId: product.id,
					storeId: testStoreId,
					sku: generateTestId("SKU-LOW"),
					barcode: generateTestId("BARCODE-LOW"),
					costPrice: 100,
					sellingPrice: 150,
					stock: 3,
					status: "ACTIVE",
				},
			});

			const result = await reportService.getInventoryReport(testStoreId, {
				skip: 0,
				take: 10,
			});

			const lowStockProduct = result.data!.find(
				(p) => p.name === lowStockName,
			);
			expect(lowStockProduct).toBeDefined();
			expect(lowStockProduct?.status).toBe("Low Stock");
		});

		it("should filter by stock status", async () => {
			const result = await reportService.getInventoryReport(testStoreId, {
				statuses: ["In Stock"],
				skip: 0,
				take: 10,
			});

			expect(result.success).toBe(true);
			result.data?.forEach((item) => {
				expect(item.status).toBe("In Stock");
			});
		});

		it("should filter by minimum stock", async () => {
			const result = await reportService.getInventoryReport(testStoreId, {
				minStock: 50,
				skip: 0,
				take: 10,
			});

			result.data?.forEach((item) => {
				expect(item.stock).toBeGreaterThanOrEqual(50);
			});
		});

		it("should filter by maximum stock", async () => {
			const result = await reportService.getInventoryReport(testStoreId, {
				maxStock: 50,
				skip: 0,
				take: 10,
			});

			result.data?.forEach((item) => {
				expect(item.stock).toBeLessThanOrEqual(50);
			});
		});

		it("should search products by name or SKU", async () => {
			const result = await reportService.getInventoryReport(testStoreId, {
				searchQuery: "Test Product",
				skip: 0,
				take: 10,
			});

			expect(result.success).toBe(true);
			result.data?.forEach((item) => {
				expect(item.name).toContain("Test Product");
			});
		});

		it("should paginate results", async () => {
			for (let i = 0; i < 15; i++) {
				const product = await prisma.product.create({
					data: {
						name: generateTestId(`Product ${i}`),
						storeId: testStoreId,
						categoryId: testCategoryId,
					},
				});

				await prisma.productVariant.create({
					data: {
						productId: product.id,
						storeId: testStoreId,
						sku: generateTestId(`SKU${i}`),
						barcode: generateTestId(`BARCODE${i}`),
						costPrice: 100,
						sellingPrice: 150,
						stock: 100,
						status: "ACTIVE",
					},
				});
			}

			const result = await reportService.getInventoryReport(testStoreId, {
				skip: 0,
				take: 10,
			});

			expect(result.data?.length).toBeLessThanOrEqual(10);
			expect(result.totalCount).toBeGreaterThanOrEqual(15);
		});
	});

	describe("getAnalyticsTransactions", () => {
		it("should return analytics transactions", async () => {
			for (let i = 0; i < 3; i++) {
				await salesService.createSale(
					{
						storeId: testStoreId,
						discount: 0,
						paymentType: "CASH" as const,
						items: [
							{
								variantId: testVariantId,
								quantity: 1,
								sellPrice: 150,
								costPrice: 100,
							},
						],
					},
					testUserId,
				);
			}

			const today = new Date();
			const result = await reportService.getAnalyticsTransactions(testStoreId, {
				startDate: today,
				endDate: today,
				skip: 0,
				take: 10,
			});

			expect(result.success).toBe(true);
			expect(result.data).toBeDefined();
		});

		it("should filter by payment type", async () => {
			await salesService.createSale(
				{
					storeId: testStoreId,
					discount: 0,
					paymentType: "CASH" as const,
					items: [
						{
							variantId: testVariantId,
							quantity: 1,
							sellPrice: 150,
							costPrice: 100,
						},
					],
				},
				testUserId,
			);

			await salesService.createSale(
				{
					storeId: testStoreId,
					discount: 0,
					paymentType: "ONLINE" as const,
					items: [
						{
							variantId: testVariantId,
							quantity: 1,
							sellPrice: 200,
							costPrice: 100,
						},
					],
				},
				testUserId,
			);

			const today = new Date();
			const result = await reportService.getAnalyticsTransactions(testStoreId, {
				startDate: today,
				endDate: today,
				paymentTypes: ["CASH"],
				skip: 0,
				take: 10,
			});

			expect(result.success).toBe(true);
			result.data?.forEach((tx) => {
				expect(tx.paymentType).toBe("CASH");
			});
		});

		it("should filter by status", async () => {
			await salesService.createSale(
				{
					storeId: testStoreId,
					discount: 0,
					paymentType: "CREDIT" as const,
					items: [
						{
							variantId: testVariantId,
							quantity: 1,
							sellPrice: 150,
							costPrice: 100,
						},
					],
					customerName: "Credit Customer",
				},
				testUserId,
			);

			await salesService.createSale(
				{
					storeId: testStoreId,
					discount: 0,
					paymentType: "CASH" as const,
					items: [
						{
							variantId: testVariantId,
							quantity: 1,
							sellPrice: 200,
							costPrice: 100,
						},
					],
				},
				testUserId,
			);

			const today = new Date();
			const result = await reportService.getAnalyticsTransactions(testStoreId, {
				startDate: today,
				endDate: today,
				status: "Completed",
				skip: 0,
				take: 10,
			});

			expect(result.success).toBe(true);
			result.data?.forEach((tx) => {
				expect(tx.status).toBe("Completed");
			});
		});

		it("should filter by amount range", async () => {
			await salesService.createSale(
				{
					storeId: testStoreId,
					discount: 0,
					paymentType: "CASH" as const,
					items: [
						{
							variantId: testVariantId,
							quantity: 1,
							sellPrice: 100,
							costPrice: 50,
						},
					],
				},
				testUserId,
			);

			await salesService.createSale(
				{
					storeId: testStoreId,
					discount: 0,
					paymentType: "CASH" as const,
					items: [
						{
							variantId: testVariantId,
							quantity: 1,
							sellPrice: 500,
							costPrice: 300,
						},
					],
				},
				testUserId,
			);

			const today = new Date();
			const result = await reportService.getAnalyticsTransactions(testStoreId, {
				startDate: today,
				endDate: today,
				minAmount: 200,
				skip: 0,
				take: 10,
			});

			expect(result.success).toBe(true);
			result.data?.forEach((tx) => {
				expect(tx.amount).toBeGreaterThanOrEqual(200);
			});
		});

		it("should calculate profit correctly", async () => {
			await salesService.createSale(
				{
					storeId: testStoreId,
					discount: 0,
					paymentType: "CASH" as const,
					items: [
						{
							variantId: testVariantId,
							quantity: 2,
							sellPrice: 150,
							costPrice: 100,
						},
					],
				},
				testUserId,
			);

			const today = new Date();
			const result = await reportService.getAnalyticsTransactions(testStoreId, {
				startDate: today,
				endDate: today,
				skip: 0,
				take: 10,
			});

			if (result.data && result.data.length > 0) {
				const tx = result.data[0];
				expect(tx.profit).toBe(100);
			}
		});

		it("should paginate results", async () => {
			for (let i = 0; i < 15; i++) {
				await salesService.createSale(
					{
						storeId: testStoreId,
						discount: 0,
						paymentType: "CASH" as const,
						items: [
							{
								variantId: testVariantId,
								quantity: 1,
								sellPrice: 100 + i,
								costPrice: 50,
							},
						],
					},
					testUserId,
				);
			}

			const today = new Date();
			const startDate = new Date(today);
			startDate.setDate(startDate.getDate() - 1);
			const endDate = new Date(today);
			endDate.setDate(endDate.getDate() + 1);

			const result = await reportService.getAnalyticsTransactions(testStoreId, {
				startDate: startDate,
				endDate: endDate,
				skip: 0,
				take: 10,
			});

			expect(result.data?.length).toBeLessThanOrEqual(10);
			expect(result.totalCount).toBeGreaterThanOrEqual(15);
		});

		it("should include date and time", async () => {
			await salesService.createSale(
				{
					storeId: testStoreId,
					discount: 0,
					paymentType: "CASH" as const,
					items: [
						{
							variantId: testVariantId,
							quantity: 1,
							sellPrice: 150,
							costPrice: 100,
						},
					],
				},
				testUserId,
			);

			const today = new Date();
			const result = await reportService.getAnalyticsTransactions(testStoreId, {
				startDate: today,
				endDate: today,
				skip: 0,
				take: 10,
			});

			if (result.data && result.data.length > 0) {
				const tx = result.data[0];
				expect(tx.date).toBeDefined();
				expect(tx.time).toBeDefined();
			}
		});
	});

	describe("Edge Cases", () => {
		it("should handle empty date ranges", async () => {
			const startDate = new Date();
			const endDate = new Date();
			endDate.setDate(endDate.getDate() - 1); // End before start

			const result = await reportService.getAnalyticsMetrics(
				testStoreId,
				startDate,
				endDate,
			);

			expect(result.success).toBe(true);
		});

		it("should handle very large date ranges", async () => {
			const startDate = new Date("2020-01-01");
			const endDate = new Date();

			const result = await reportService.getAnalyticsMetrics(
				testStoreId,
				startDate,
				endDate,
			);

			expect(result.success).toBe(true);
		});

		it("should handle decimal values correctly", async () => {
			await salesService.createSale(
				{
					storeId: testStoreId,
					discount: 0.33,
					paymentType: "CASH" as const,
					items: [
						{
							variantId: testVariantId,
							quantity: 3,
							sellPrice: 99.99,
							costPrice: 66.66,
						},
					],
				},
				testUserId,
			);

			const today = new Date();
			const startDate = new Date(today.getTime() - 60 * 60 * 1000); // 1 hour ago
			const endDate = new Date(today.getTime() + 60 * 60 * 1000); // 1 hour filter

			const result = await reportService.getAnalyticsMetrics(
				testStoreId,
				startDate,
				endDate,
			);

			expect(result.success).toBe(true);
			expect(result.data!.find((m) => m.label === "TOTAL SALES")!.value).toBeCloseTo(299.64, 2);
		});

		it("should handle multiple stores independently", async () => {
			const otherStore = await prisma.store.create({
				data: {
					name: generateTestId("Other Store"),
					creatorId: testUserId,
				},
			});

			await salesService.createSale(
				{
					storeId: testStoreId,
					discount: 0,
					paymentType: "CASH" as const,
					items: [
						{
							variantId: testVariantId,
							quantity: 5,
							sellPrice: 150,
							costPrice: 100,
						},
					],
				},
				testUserId,
			);

			const today = new Date();
			const result = await reportService.getAnalyticsMetrics(
				otherStore.id,
				today,
				today,
			);

			expect(result.success).toBe(true);
			const totalSalesMetric = result.data?.find((m) => m.label === "TOTAL SALES");
			expect(totalSalesMetric?.value).toBe(0); // No sales in other store
		});
	});
});

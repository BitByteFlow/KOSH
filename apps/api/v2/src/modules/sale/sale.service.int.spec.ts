import { createTestContext, generateTestId } from "test/test-utils";
import { PrismaClient } from "@kosh/db";
import { SalesService } from "./sale.service";
import { DatabaseService } from "../../database/database.service";
import { NotificationService } from "../notification/notification.service";

describe("SalesService Integration Tests", () => {
	let context: any;
	let salesService: SalesService;
	let notificationService: NotificationService;
	let databaseService: DatabaseService;
	let prisma: PrismaClient;

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

		notificationService = context.app.get(NotificationService);
		salesService = context.app.get(SalesService);

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
		await prisma.accountTransaction.deleteMany();
		await prisma.dailyBalance.deleteMany();
		await prisma.creditAccount.deleteMany();
		await prisma.notification.deleteMany();

		await prisma.productVariant.update({
			where: { id: testVariantId },
			data: { stock: 100 },
		});
	});

	describe("createSale - Success Scenarios", () => {
		it("should create a cash sale successfully and update inventory", async () => {
			const createSaleDto = {
				storeId: testStoreId,
				discount: 10,
				paymentType: "CASH" as const,
				items: [
					{
						variantId: testVariantId,
						quantity: 2,
						sellPrice: 150,
						costPrice: 100,
					},
				],
				transactionNote: "Test cash sale",
			};

			const result = await salesService.createSale(createSaleDto, testUserId);

			expect(result.success).toBe(true);
			expect(result.message).toBe("Sale created successfully");
			expect(result.data).toHaveLength(1);
			const sale = result.data![0];
			expect(sale.total).toBe(290); 
			expect(sale.profit).toBe(90);
			expect(sale.discount).toBe(10);
			expect(sale.paymentType).toBe("CASH");

			const updatedVariant = await prisma.productVariant.findUnique({
				where: { id: testVariantId },
			});
			expect(updatedVariant?.stock).toBe(98);
		});

		it("should create an online sale successfully", async () => {
			const createSaleDto = {
				storeId: testStoreId,
				discount: 0,
				paymentType: "ONLINE" as const,
				items: [
					{
						variantId: testVariantId,
						quantity: 1,
						sellPrice: 150,
						costPrice: 100,
					},
				],
			};

			const result = await salesService.createSale(createSaleDto, testUserId);

			expect(result.success).toBe(true);
			expect(result.data![0].total).toBe(150);
			expect(result.data![0].paymentType).toBe("ONLINE");

			const todayStr = new Date().toISOString().split("T")[0];
			const dailyBalance = await prisma.dailyBalance.findUnique({
				where: { storeId_date: { storeId: testStoreId, date: todayStr } },
			});

			expect(dailyBalance).toBeDefined();
			expect(Number(dailyBalance?.totalSales)).toBe(150);
			expect(Number(dailyBalance?.closingCash)).toBe(
				Number(dailyBalance?.openingCash) + 150,
			);
		});

		it("should create a credit sale with new customer", async () => {
			const createSaleDto = {
				storeId: testStoreId,
				discount: 0,
				paymentType: "CREDIT" as const,
				items: [
					{
						variantId: testVariantId,
						quantity: 3,
						sellPrice: 150,
						costPrice: 100,
					},
				],
				customerName: "Test Customer",
				customerEmail: "customer@test.com",
				customerContact: "9876543210",
			};

			const result = await salesService.createSale(createSaleDto, testUserId);

			expect(result.success).toBe(true);
			expect(result.data![0].total).toBe(450);
			expect(result.data![0].paymentType).toBe("CREDIT");

			const creditAccount = await prisma.creditAccount.findFirst({
				where: { customerName: "Test Customer" },
			});

			expect(creditAccount).toBeDefined();
			expect(Number(creditAccount?.balance)).toBe(450);
			expect(creditAccount?.email).toBe("customer@test.com");

			const todayStr = new Date().toISOString().split("T")[0];
			const dailyBalance = await prisma.dailyBalance.findUnique({
				where: { storeId_date: { storeId: testStoreId, date: todayStr } },
			});
			expect(dailyBalance).toBeNull();
		});

		it("should update existing credit account balance", async () => {
			const creditAccount = await prisma.creditAccount.create({
				data: {
					storeId: testStoreId,
					customerName: "Existing Customer",
					balance: 100,
				},
			});

			const createSaleDto = {
				storeId: testStoreId,
				discount: 0,
				paymentType: "CREDIT" as const,
				creditId: creditAccount.id,
				items: [
					{
						variantId: testVariantId,
						quantity: 2,
						sellPrice: 150,
						costPrice: 100,
					},
				],
			};

			const result = await salesService.createSale(createSaleDto, testUserId);

			expect(result.success).toBe(true);
			expect(result.data![0].total).toBe(300);

			const updatedAccount = await prisma.creditAccount.findUnique({
				where: { id: creditAccount.id },
			});
			expect(Number(updatedAccount?.balance)).toBe(400);
		});

		it("should create daily balance if it doesn't exist", async () => {
			const createSaleDto = {
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
			};

			await salesService.createSale(createSaleDto, testUserId);

			const todayStr = new Date().toISOString().split("T")[0];
			const dailyBalance = await prisma.dailyBalance.findUnique({
				where: { storeId_date: { storeId: testStoreId, date: todayStr } },
			});

			expect(dailyBalance).toBeDefined();
			expect(Number(dailyBalance?.openingCash)).toBe(0);
			expect(Number(dailyBalance?.closingCash)).toBe(150);
			expect(Number(dailyBalance?.totalSales)).toBe(150);
		});

		it("should carry forward yesterday's closing balance to today's opening balance", async () => {
			const today = new Date();
			const yesterday = new Date(today);
			yesterday.setDate(yesterday.getDate() - 1);
			const yesterdayStr = yesterday.toISOString().split("T")[0];

			await prisma.dailyBalance.create({
				data: {
					storeId: testStoreId,
					date: yesterdayStr,
					openingCash: 1000,
					closingCash: 1500,
					totalSales: 500,
					totalCashIn: 500,
					totalCashOut: 0,
					totalExpense: 0,
				},
			});

			const createSaleDto = {
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
			};

			await salesService.createSale(createSaleDto, testUserId);

			const todayStr = today.toISOString().split("T")[0];
			const todayBalance = await prisma.dailyBalance.findUnique({
				where: { storeId_date: { storeId: testStoreId, date: todayStr } },
			});

			expect(Number(todayBalance?.openingCash)).toBe(1500);
			expect(Number(todayBalance?.closingCash)).toBe(1700);
		});

		it("should create account transaction for cash sale", async () => {
			const createSaleDto = {
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
				transactionNote: "Test transaction note",
			};

			await salesService.createSale(createSaleDto, testUserId);

			const transaction = await prisma.accountTransaction.findFirst({
				where: { storeId: testStoreId },
			});

			expect(transaction).toBeDefined();
			expect(transaction?.type).toBe("SALE_INCOME");
			expect(Number(transaction?.amount)).toBe(150);
			expect(transaction?.note).toBe("Test transaction note");
		});

		it("should handle multiple items in a single sale", async () => {
			const variant2 = await prisma.productVariant.create({
				data: {
					productId: testProductId,
					storeId: testStoreId,
					sku: generateTestId("SKU2"),
					barcode: generateTestId("BARCODE2"),
					costPrice: 80,
					sellingPrice: 120,
					stock: 50,
					status: "ACTIVE",
				},
			});

			const createSaleDto = {
				storeId: testStoreId,
				discount: 20,
				paymentType: "CASH" as const,
				items: [
					{
						variantId: testVariantId,
						quantity: 2,
						sellPrice: 150,
						costPrice: 100,
					},
					{
						variantId: variant2.id,
						quantity: 3,
						sellPrice: 120,
						costPrice: 80,
					},
				],
			};

			const result = await salesService.createSale(createSaleDto, testUserId);

			expect(result.success).toBe(true);
			expect(result.data![0].total).toBe(640);
			expect(result.data![0].profit).toBe(200);
			const variant1Updated = await prisma.productVariant.findUnique({
				where: { id: testVariantId },
			});
			const variant2Updated = await prisma.productVariant.findUnique({
				where: { id: variant2.id },
			});

			expect(variant1Updated?.stock).toBe(98);
			expect(variant2Updated?.stock).toBe(47);
		});
	});

	describe("createSale - Error Scenarios", () => {
		it("should throw BadRequestException for empty items", async () => {
			const createSaleDto = {
				storeId: testStoreId,
				discount: 0,
				paymentType: "CASH" as const,
				items: [],
			};

			await expect(
				salesService.createSale(createSaleDto, testUserId),
			).rejects.toThrow("Sale must have at least one item");
		});

		it("should throw BadRequestException for credit sale without customer or credit account", async () => {
			const createSaleDto = {
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
			};

			await expect(
				salesService.createSale(createSaleDto, testUserId),
			).rejects.toThrow(
				"Credit account or customer details are required for credit sales",
			);
		});

		it("should throw NotFoundException for non-existent variant", async () => {
			const createSaleDto = {
				storeId: testStoreId,
				discount: 0,
				paymentType: "CASH" as const,
				items: [
					{
						variantId: "non-existent-variant-id",
						quantity: 1,
						sellPrice: 150,
						costPrice: 100,
					},
				],
			};

			await expect(
				salesService.createSale(createSaleDto, testUserId),
			).rejects.toThrow("not found");
		});

		it("should throw BadRequestException for insufficient stock", async () => {
			await prisma.productVariant.update({
				where: { id: testVariantId },
				data: { stock: 5 },
			});

			const createSaleDto = {
				storeId: testStoreId,
				discount: 0,
				paymentType: "CASH" as const,
				items: [
					{
						variantId: testVariantId,
						quantity: 10,
						sellPrice: 150,
						costPrice: 100,
					},
				],
			};

			await expect(
				salesService.createSale(createSaleDto, testUserId),
			).rejects.toThrow("Insufficient stock");

			const variant = await prisma.productVariant.findUnique({
				where: { id: testVariantId },
			});
			expect(variant?.stock).toBe(5);
		});

		it("should throw BadRequestException for negative total (high discount)", async () => {
			const createSaleDto = {
				storeId: testStoreId,
				discount: 500,
				paymentType: "CASH" as const,
				items: [
					{
						variantId: testVariantId,
						quantity: 1,
						sellPrice: 150,
						costPrice: 100,
					},
				],
			};

			await expect(
				salesService.createSale(createSaleDto, testUserId),
			).rejects.toThrow("Total cannot be negative");
		});

		it("should handle database transaction rollback on error", async () => {
			const initialVariant = await prisma.productVariant.findUnique({
				where: { id: testVariantId },
			});
			const initialStock = initialVariant?.stock || 100;

			const createSaleDto = {
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
						variantId: "non-existent-variant",
						quantity: 1,
						sellPrice: 100,
						costPrice: 50,
					},
				],
			};

			await expect(
				salesService.createSale(createSaleDto, testUserId),
			).rejects.toThrow();

			const variant = await prisma.productVariant.findUnique({
				where: { id: testVariantId },
			});
			expect(variant?.stock).toBe(initialStock);
		});
	});

	describe("createSale - Low Stock Notifications", () => {
		it("should trigger low stock notification when variant stock falls below threshold", async () => {
			await prisma.settings.upsert({
				where: { storeId: testStoreId },
				update: { lowStockThreshold: 10 },
				create: {
					storeId: testStoreId,
					lowStockThreshold: 10,
				},
			});

			await prisma.productVariant.update({
				where: { id: testVariantId },
				data: { stock: 11 },
			});

			const createSaleDto = {
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
			};

			await salesService.createSale(createSaleDto, testUserId);

			const notification = await prisma.notification.findFirst({
				where: { userId: testUserId },
				orderBy: { createdAt: "desc" },
			});

			expect(notification).toBeDefined();
			expect(notification?.type).toBe("LOW_STOCK");
			expect(notification?.message).toContain("low on stock");
		});

		it("should not trigger notification when stock is above threshold", async () => {
			await prisma.settings.upsert({
				where: { storeId: testStoreId },
				update: { lowStockThreshold: 5 },
				create: {
					storeId: testStoreId,
					lowStockThreshold: 5,
				},
			});

			const createSaleDto = {
				storeId: testStoreId,
				discount: 0,
				paymentType: "CASH" as const,
				items: [
					{
						variantId: testVariantId,
						quantity: 5, // Brings stock to 95
						sellPrice: 150,
						costPrice: 100,
					},
				],
			};

			await salesService.createSale(createSaleDto, testUserId);

			const notification = await prisma.notification.findFirst({
				where: { userId: testUserId, type: "LOW_STOCK" },
				orderBy: { createdAt: "desc" },
			});

			expect(notification).toBeNull();
		});
	});

	describe("getMetrices", () => {
		it("should return today's sales metrics", async () => {
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

			await salesService.createSale(
				{
					storeId: testStoreId,
					discount: 10,
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

			const result = await salesService.getMetrices(testUserId, testStoreId);

			expect(result.success).toBe(true);
			expect(result.data?.totalSales).toBe(440); // 300 + 140
			expect(result.data?.totalProfit).toBe(140); // 100 + 40
			expect(result.data?.totalTransactions).toBe(2);
			expect(result.data?.avgSaleValue).toBe(220); // 440 / 2
		});

		it("should return zero metrics when no sales today", async () => {
			const result = await salesService.getMetrices(testUserId, testStoreId);

			expect(result.success).toBe(true);
			expect(result.data?.totalSales).toBe(0);
			expect(result.data?.totalProfit).toBe(0);
			expect(result.data?.totalTransactions).toBe(0);
			expect(result.data?.avgSaleValue).toBe(0);
		});

		it("should only count today's sales", async () => {
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

			const result = await salesService.getMetrices(testUserId, testStoreId);
			expect(result.data?.totalTransactions).toBe(1);
			expect(result.data?.totalSales).toBe(200);
		});
	});

	describe("getSales", () => {
		it("should return all sales for today with items", async () => {
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

			const result = await salesService.getSales(testUserId, testStoreId);

			expect(result.success).toBe(true);
			expect(result.data).toHaveLength(1);
			expect(result.data?.[0].items).toHaveLength(1);
			expect(Number(result.data?.[0].total)).toBe(150);
		});

		it("should return sales in descending order by creation date", async () => {
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
							quantity: 2,
							sellPrice: 200,
							costPrice: 100,
						},
					],
				},
				testUserId,
			);

			const result = await salesService.getSales(testUserId, testStoreId);

			expect(result.data).toHaveLength(2);
			expect(Number(result.data?.[0].total)).toBe(400);
		});

		it("should return empty array when no sales exist", async () => {
			const result = await salesService.getSales(testUserId, testStoreId);

			expect(result.success).toBe(true);
			expect(result.data).toHaveLength(0);
		});

		it("should format sale items correctly", async () => {
			await salesService.createSale(
				{
					storeId: testStoreId,
					discount: 5,
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

			const result = await salesService.getSales(testUserId, testStoreId);

			const sale = result.data![0];
			expect(sale.items[0].quantity).toBe(2);
			expect(sale.items[0].sellPrice).toBe(150);
			expect(sale.items[0].costPrice).toBe(100);
			expect(sale.items[0].variantId).toBe(testVariantId);
		});
	});

	describe("Data Integrity Tests", () => {
		it("should maintain data integrity with concurrent sales", async () => {
			const initialVariant = await prisma.productVariant.findUnique({
				where: { id: testVariantId },
			});
			const initialStock = initialVariant?.stock || 100;
			const salePromises = Array.from({ length: 5 }).map(() =>
				salesService.createSale(
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
				),
			);

			const results = await Promise.all(salePromises);
			results.forEach((result) => {
				expect(result.success).toBe(true);
			});

			const finalVariant = await prisma.productVariant.findUnique({
				where: { id: testVariantId },
			});
			expect(finalVariant?.stock).toBe(initialStock - 10);
		});

		it("should handle decimal precision correctly", async () => {
			const createSaleDto = {
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
			};

			const result = await salesService.createSale(createSaleDto, testUserId);

			expect(result.success).toBe(true);
			expect(Number(result.data?.[0].total)).toBeCloseTo(299.64, 2); 
		});

		it("should properly link sale items to sale", async () => {
			const createSaleDto = {
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
			};

			const result = await salesService.createSale(createSaleDto, testUserId);
			const saleId = result.data?.[0].id;

			const saleWithItems = await prisma.sale.findUnique({
				where: { id: saleId },
				include: { items: true },
			});

			expect(saleWithItems?.items).toHaveLength(1);
			expect(saleWithItems?.items[0].saleId).toBe(saleId);
		});

		it("should properly link account transaction to sale and daily balance", async () => {
			const createSaleDto = {
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
			};

			await salesService.createSale(createSaleDto, testUserId);

			const transaction = await prisma.accountTransaction.findFirst({
				where: { storeId: testStoreId },
				include: { dailyBalance: true, sale: true },
			});

			expect(transaction).toBeDefined();
			expect(transaction?.saleId).toBeDefined();
			expect(transaction?.dailyBalanceId).toBeDefined();
			expect(transaction?.dailyBalance).toBeDefined();
			expect(transaction?.sale).toBeDefined();
		});
	});

	describe("Edge Cases", () => {
		it("should handle zero discount correctly", async () => {
			const createSaleDto = {
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
			};

			const result = await salesService.createSale(createSaleDto, testUserId);

			expect(Number(result.data?.[0].total)).toBe(150);
			expect(Number(result.data?.[0].profit)).toBe(50);
			expect(Number(result.data?.[0].discount)).toBe(0);
		});

		it("should handle large quantity sales", async () => {
			const createSaleDto = {
				storeId: testStoreId,
				discount: 0,
				paymentType: "CASH" as const,
				items: [
					{
						variantId: testVariantId,
						quantity: 50,
						sellPrice: 150,
						costPrice: 100,
					},
				],
			};

			const result = await salesService.createSale(createSaleDto, testUserId);

			expect(result.success).toBe(true);
			expect(Number(result.data?.[0].total)).toBe(7500); // 150 * 50

			const updatedVariant = await prisma.productVariant.findUnique({
				where: { id: testVariantId },
			});
			expect(updatedVariant?.stock).toBe(50);
		});

		it("should handle sale with exact stock quantity", async () => {
			await prisma.productVariant.update({
				where: { id: testVariantId },
				data: { stock: 5 },
			});

			const createSaleDto = {
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
			};

			const result = await salesService.createSale(createSaleDto, testUserId);

			expect(result.success).toBe(true);

			const updatedVariant = await prisma.productVariant.findUnique({
				where: { id: testVariantId },
			});
			expect(updatedVariant?.stock).toBe(0);
		});

		it("should handle multiple sales reducing stock to zero", async () => {
			await prisma.productVariant.update({
				where: { id: testVariantId },
				data: { stock: 10 },
			});

			await salesService.createSale(
				{
					storeId: testStoreId,
					discount: 0,
					paymentType: "CASH" as const,
					items: [
						{
							variantId: testVariantId,
							quantity: 6,
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
					paymentType: "CASH" as const,
					items: [
						{
							variantId: testVariantId,
							quantity: 4,
							sellPrice: 150,
							costPrice: 100,
						},
					],
				},
				testUserId,
			);

			const updatedVariant = await prisma.productVariant.findUnique({
				where: { id: testVariantId },
			});
			expect(updatedVariant?.stock).toBe(0);
		});
	});
});

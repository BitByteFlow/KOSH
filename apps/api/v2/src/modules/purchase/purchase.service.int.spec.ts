import {
	TestContext,
	createTestContext,
	generateTestId,
} from "test/test-utils";
import { PrismaClient } from "@kosh/db";
import { PurchasesService } from "./purchase.service";
import { DatabaseService } from "../../database/database.service";

describe("PurchasesService Integration Tests", () => {
	let context: TestContext & { userId: string; token: string; storeId: string };
	let purchasesService: PurchasesService;
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
		purchasesService = new PurchasesService(databaseService);

		// Setup test data
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
				stock: 50,
				status: "ACTIVE",
			},
		});
		testVariantId = variant.id;
	});

	afterAll(async () => {
		await context.close();
	});

	beforeEach(async () => {
		await prisma.purchaseItem.deleteMany();
		await prisma.purchase.deleteMany();
		await prisma.accountTransaction.deleteMany();
		await prisma.dailyBalance.deleteMany();
		await prisma.notification.deleteMany();

		// Seed opening cash for tests
		const todayStr = new Date().toISOString().split("T")[0];
		await prisma.dailyBalance.upsert({
			where: { storeId_date: { storeId: testStoreId, date: todayStr } },
			create: {
				storeId: testStoreId,
				date: todayStr,
				openingCash: 2000000,
				closingCash: 2000000,
			},
			update: {
				openingCash: 2000000,
				closingCash: 2000000,
				totalSales: 0,
				totalExpense: 0,
				totalCashIn: 0,
				totalCashOut: 0,
			},
		});

		// Reset variant stock
		await prisma.productVariant.update({
			where: { id: testVariantId },
			data: { stock: 50 },
		});
	});

	describe("createPurchase - Success Scenarios", () => {
		it("should create a fully paid purchase successfully", async () => {
			const createPurchaseDto = {
				supplierName: "Test Supplier",
				email: "supplier@test.com",
				contact: "9876543210",
				variants: [
					{
						variantId: testVariantId,
						quantity: 10,
						price: 100,
					},
				],
				amountPaid: 1000,
				dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
			};

			const result = await purchasesService.createPurchase(
				createPurchaseDto,
				testUserId,
				testStoreId,
			);

			expect(result.success).toBe(true);
			expect(result.message).toBe("Purchase created successfully");

			// Verify purchase was created
			const purchase = await prisma.purchase.findFirst({
				where: { supplierName: "Test Supplier" },
				include: { items: true },
			});

			expect(purchase).toBeDefined();
			expect(Number(purchase?.total)).toBe(1000);
			expect(Number(purchase?.amountPaid)).toBe(1000);
			expect(Number(purchase?.balanceDue)).toBe(0);
			expect(purchase?.status).toBe("PAID");

			// Verify stock was incremented
			const updatedVariant = await prisma.productVariant.findUnique({
				where: { id: testVariantId },
			});
			expect(updatedVariant?.stock).toBe(60); // 50 + 10
		});

		it("should create a pending purchase with no payment", async () => {
			const createPurchaseDto = {
				supplierName: "Test Supplier",
				email: "supplier@test.com",
				contact: "9876543210",
				variants: [
					{
						variantId: testVariantId,
						quantity: 10,
						price: 100,
					},
				],
				amountPaid: 0,
				dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
			};

			const result = await purchasesService.createPurchase(
				createPurchaseDto,
				testUserId,
				testStoreId,
			);

			expect(result.success).toBe(true);

			const purchase = await prisma.purchase.findFirst({
				where: { supplierName: "Test Supplier" },
			});

			expect(purchase).toBeDefined();
			expect(Number(purchase?.total)).toBe(1000);
			expect(Number(purchase?.amountPaid)).toBe(0);
			expect(Number(purchase?.balanceDue)).toBe(1000);
			expect(purchase?.status).toBe("PENDING");

			// Stock should still be incremented
			const updatedVariant = await prisma.productVariant.findUnique({
				where: { id: testVariantId },
			});
			expect(updatedVariant?.stock).toBe(60);
		});

		it("should create a partial payment purchase", async () => {
			const createPurchaseDto = {
				supplierName: "Test Supplier",
				variants: [{ variantId: testVariantId, quantity: 10, price: 100 }],
				amountPaid: 500,
				email: "supplier@test.com",
				contact: "9876543210",
				dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
			};

			const result = await purchasesService.createPurchase(
				createPurchaseDto,
				testUserId,
				testStoreId,
			);

			expect(result.success).toBe(true);

			const purchase = await prisma.purchase.findFirst({
				where: { supplierName: "Test Supplier" },
			});

			expect(purchase).toBeDefined();
			expect(Number(purchase?.total)).toBe(1000);
			expect(Number(purchase?.amountPaid)).toBe(500);
			expect(Number(purchase?.balanceDue)).toBe(500);
			expect(purchase?.status).toBe("PARTIAL");
		});

		it("should update variant cost price", async () => {
			const createPurchaseDto = {
				supplierName: "Test Supplier",
				variants: [
					{
						variantId: testVariantId,
						quantity: 10,
						price: 120, // New cost price
					},
				],
				amountPaid: 1200,
				email: "supplier@test.com",
				contact: "1234567890",
				dueDate: new Date(),
			};

			await purchasesService.createPurchase(
				createPurchaseDto,
				testUserId,
				testStoreId,
			);

			const updatedVariant = await prisma.productVariant.findUnique({
				where: { id: testVariantId },
			});
			expect(Number(updatedVariant?.costPrice)).toBe(120);
		});

		it("should create purchase with multiple variants", async () => {
			// Create another variant
			const variant2 = await prisma.productVariant.create({
				data: {
					productId: testProductId,
					storeId: testStoreId,
					sku: generateTestId("SKU2"),
					barcode: generateTestId("BARCODE2"),
					costPrice: 80,
					sellingPrice: 120,
					stock: 30,
					status: "ACTIVE",
				},
			});

			const createPurchaseDto = {
				supplierName: "Test Supplier",
				variants: [
					{ variantId: testVariantId, quantity: 10, price: 100 },
					{ variantId: variant2.id, quantity: 20, price: 80 },
				],
				amountPaid: 2600,
				email: "supplier@test.com",
				contact: "1234567890",
				dueDate: new Date(),
			};

			const result = await purchasesService.createPurchase(
				createPurchaseDto,
				testUserId,
				testStoreId,
			);

			expect(result.success).toBe(true);

			const purchase = await prisma.purchase.findFirst({
				where: { supplierName: "Test Supplier" },
				include: { items: true },
			});

			expect(Number(purchase?.total)).toBe(2600); // (10*100) + (20*80)
			expect(purchase?.items).toHaveLength(2);

			// Verify both variants' stock was updated
			const variant1Updated = await prisma.productVariant.findUnique({
				where: { id: testVariantId },
			});
			const variant2Updated = await prisma.productVariant.findUnique({
				where: { id: variant2.id },
			});

			expect(variant1Updated?.stock).toBe(60); // 50 + 10
			expect(variant2Updated?.stock).toBe(50); // 30 + 20
		});

		it("should create daily balance and transaction for paid amount", async () => {
			// Create initial capital first
			const initialTx = await prisma.accountTransaction.create({
				data: {
					storeId: testStoreId,
					type: "INITIAL_CAPITAL",
					amount: 10000,
				},
			});

			const todayStr = new Date().toISOString().split("T")[0];
			await prisma.dailyBalance.upsert({
				where: { storeId_date: { storeId: testStoreId, date: todayStr } },
				create: {
					storeId: testStoreId,
					date: todayStr,
					openingCash: 10000,
					closingCash: 10000,
				},
				update: {
					openingCash: 10000,
					closingCash: 10000,
				},
			});

			const createPurchaseDto = {
				supplierName: "Test Supplier",
				variants: [
					{
						variantId: testVariantId,
						quantity: 10,
						price: 100,
					},
				],
				amountPaid: 500,
				email: "supplier@test.com",
				contact: "1234567890",
				dueDate: new Date(),
			};

			await purchasesService.createPurchase(
				createPurchaseDto,
				testUserId,
				testStoreId,
			);

			// Verify daily balance was updated
			const dailyBalance = await prisma.dailyBalance.findUnique({
				where: { storeId_date: { storeId: testStoreId, date: todayStr } },
			});

			expect(Number(dailyBalance?.closingCash)).toBe(9500); // 10000 - 500
			expect(Number(dailyBalance?.totalCashOut)).toBe(500);
			expect(Number(dailyBalance?.totalExpense)).toBe(500);

			// Verify transaction was created
			const transaction = await prisma.accountTransaction.findFirst({
				where: { storeId: testStoreId, type: "PURCHASE" },
			});

			expect(transaction).toBeDefined();
			expect(Number(transaction?.amount)).toBe(500);
		});

		it("should create purchase without optional fields", async () => {
			const createPurchaseDto = {
				supplierName: "Test Supplier",
				variants: [
					{
						variantId: testVariantId,
						quantity: 10,
						price: 100,
					},
				],
				amountPaid: 1000,
			};

			const result = await purchasesService.createPurchase(
				createPurchaseDto as any,
				testUserId,
				testStoreId,
			);

			expect(result.success).toBe(true);

			const purchase = await prisma.purchase.findFirst({
				where: { supplierName: "Test Supplier" },
			});

			expect(purchase?.email).toBeNull();
			expect(purchase?.contact).toBeNull();
			expect(purchase?.dueDate).toBeNull();
		});
	});

	describe("createPurchase - Error Scenarios", () => {
		it("should throw NotFoundException for non-existent variant", async () => {
			const createPurchaseDto = {
				supplierName: "Test Supplier",
				variants: [
					{
						variantId: "non-existent-variant",
						quantity: 10,
						price: 100,
					},
				],
				amountPaid: 1000,
				email: "supplier@test.com",
				contact: "1234567890",
				dueDate: new Date(),
			};

			await expect(
				purchasesService.createPurchase(createPurchaseDto, testUserId, testStoreId),
			).rejects.toThrow("not found");
		});

		it("should throw NotFoundException if variant belongs to different store", async () => {
			// Create variant in different store
			const otherStore = await prisma.store.create({
				data: {
					name: generateTestId("Other Store"),
					creatorId: testUserId,
				},
			});

			const otherVariant = await prisma.productVariant.create({
				data: {
					productId: testProductId,
					storeId: otherStore.id,
					sku: generateTestId("SKU-OTHER"),
					barcode: generateTestId("BARCODE-OTHER"),
					costPrice: 100,
					sellingPrice: 150,
					stock: 50,
					status: "ACTIVE",
				},
			});

			const createPurchaseDto = {
				supplierName: "Test Supplier",
				variants: [
					{
						variantId: otherVariant.id,
						quantity: 10,
						price: 100,
					},
				],
				amountPaid: 1000,
				email: "supplier@test.com",
				contact: "1234567890",
				dueDate: new Date(),
			};

			await expect(
				purchasesService.createPurchase(createPurchaseDto, testUserId, testStoreId),
			).rejects.toThrow("does not belong to this store");
		});

		it("should throw BadRequestException for negative amount paid", async () => {
			const createPurchaseDto = {
				supplierName: "Test Supplier",
				variants: [
					{
						variantId: testVariantId,
						quantity: 10,
						price: 100,
					},
				],
				amountPaid: -100,
				email: "supplier@test.com",
				contact: "1234567890",
				dueDate: new Date(),
			};

			await expect(
				purchasesService.createPurchase(createPurchaseDto, testUserId, testStoreId),
			).rejects.toThrow("Amount paid cannot be negative");
		});

		it("should throw BadRequestException if amount paid exceeds total", async () => {
			const createPurchaseDto = {
				supplierName: "Test Supplier",
				variants: [
					{
						variantId: testVariantId,
						quantity: 10,
						price: 100,
					},
				],
				amountPaid: 1500, // More than total (1000)
				email: "supplier@test.com",
				contact: "1234567890",
				dueDate: new Date(),
			};

			await expect(
				purchasesService.createPurchase(createPurchaseDto, testUserId, testStoreId),
			).rejects.toThrow("Amount paid cannot exceed total amount");
		});
	});

	describe("updatePurchase", () => {
		let purchaseId: string;

		beforeEach(async () => {
			// Create initial purchase
			const createPurchaseDto = {
				supplierName: "Test Supplier",
				variants: [
					{
						variantId: testVariantId,
						quantity: 10,
						price: 100,
					},
				],
				amountPaid: 500,
				email: "supplier@test.com",
				contact: "1234567890",
				dueDate: new Date(),
			};

			const result = await purchasesService.createPurchase(
				createPurchaseDto,
				testUserId,
				testStoreId,
			);

			const purchase = await prisma.purchase.findFirst({
				where: { supplierName: "Test Supplier" },
			});
			purchaseId = purchase?.id || "";
		});

		it("should update purchase supplier details", async () => {
			const updateDto = {
				supplierName: "Updated Supplier",
				email: "updated@test.com",
				contact: "1234567890",
			};

			const result = await purchasesService.updatePurchase(
				updateDto,
				purchaseId,
				testUserId,
				testStoreId,
			);

			expect(result.success).toBe(true);

			const updated = await prisma.purchase.findUnique({
				where: { id: purchaseId },
			});

			expect(updated?.supplierName).toBe("Updated Supplier");
			expect(updated?.email).toBe("updated@test.com");
			expect(updated?.contact).toBe("1234567890");
		});

		it("should update purchase due date", async () => {
			const newDueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
			const updateDto = {
				dueDate: newDueDate,
			};

			const result = await purchasesService.updatePurchase(
				updateDto,
				purchaseId,
				testUserId,
				testStoreId,
			);

			expect(result.success).toBe(true);

			const updated = await prisma.purchase.findUnique({
				where: { id: purchaseId },
			});

			expect(updated?.dueDate?.toISOString()).toBe(newDueDate.toISOString());
		});

		it("should update purchase with additional payment", async () => {
			const updateDto = {
				amountPaid: 800, // Additional 300
			};

			const result = await purchasesService.updatePurchase(
				updateDto,
				purchaseId,
				testUserId,
				testStoreId,
			);

			expect(result.success).toBe(true);

			const updated = await prisma.purchase.findUnique({
				where: { id: purchaseId },
			});

			expect(Number(updated?.amountPaid)).toBe(800);
			expect(Number(updated?.balanceDue)).toBe(200);
			expect(updated?.status).toBe("PARTIAL");
		});

		it("should mark purchase as PAID when fully paid", async () => {
			const updateDto = {
				amountPaid: 1000, // Full payment
			};

			const result = await purchasesService.updatePurchase(
				updateDto,
				purchaseId,
				testUserId,
				testStoreId,
			);

			expect(result.success).toBe(true);

			const updated = await prisma.purchase.findUnique({
				where: { id: purchaseId },
			});

			expect(Number(updated?.amountPaid)).toBe(1000);
			expect(Number(updated?.balanceDue)).toBe(0);
			expect(updated?.status).toBe("PAID");
		});

		it("should update status without payment", async () => {
			const updateDto = {
				status: "OVERDUE" as const,
			};

			const result = await purchasesService.updatePurchase(
				updateDto,
				purchaseId,
				testUserId,
				testStoreId,
			);

			expect(result.success).toBe(true);

			const updated = await prisma.purchase.findUnique({
				where: { id: purchaseId },
			});

			expect(updated?.status).toBe("OVERDUE");
		});

		it("should create daily balance and transaction for additional payment", async () => {
			const todayStr = new Date().toISOString().split("T")[0];
			await prisma.dailyBalance.upsert({
				where: { storeId_date: { storeId: testStoreId, date: todayStr } },
				update: {
					openingCash: 10000,
					closingCash: 10000,
					totalCashIn: 10000,
					totalCashOut: 0,
					totalSales: 0,
					totalExpense: 0,
				},
				create: {
					storeId: testStoreId,
					date: todayStr,
					openingCash: 10000,
					closingCash: 10000,
					totalCashIn: 10000,
					totalCashOut: 0,
					totalSales: 0,
					totalExpense: 0,
				},
			});

			const updateDto = {
				amountPaid: 800, // 500 initial + 300 additional
				email: "supplier@test.com",
				contact: "1234567890",
				dueDate: new Date(),
			};

			await purchasesService.updatePurchase(
				updateDto,
				purchaseId,
				testUserId,
				testStoreId,
			);

			const dailyBalance = await prisma.dailyBalance.findUnique({
				where: { storeId_date: { storeId: testStoreId, date: todayStr } },
			});

			expect(Number(dailyBalance?.closingCash)).toBe(9700); // 10000 - 300
			expect(Number(dailyBalance?.totalCashOut)).toBe(300);
			expect(Number(dailyBalance?.totalExpense)).toBe(300);

			const transaction = await prisma.accountTransaction.findFirst({
				where: { storeId: testStoreId, type: "DEBT_PAID" },
			});

			expect(transaction).toBeDefined();
			expect(Number(transaction?.amount)).toBe(300);
		});

		it("should throw NotFoundException if purchase doesn't exist", async () => {
			const updateDto = {
				supplierName: "Updated Supplier",
			};

			await expect(
				purchasesService.updatePurchase(
					updateDto,
					"non-existent-id",
					testUserId,
					testStoreId,
				),
			).rejects.toThrow("Purchase not found");
		});

		it("should throw BadRequestException if no fields provided", async () => {
			const updateDto = {};

			await expect(
				purchasesService.updatePurchase(
					updateDto as any,
					purchaseId,
					testUserId,
					testStoreId,
				),
			).rejects.toThrow("No fields provided");
		});

		it("should throw BadRequestException if reducing payment", async () => {
			const updateDto = {
				amountPaid: 300, // Less than current 500
			};

			await expect(
				purchasesService.updatePurchase(
					updateDto,
					purchaseId,
					testUserId,
					testStoreId,
				),
			).rejects.toThrow("Cannot reduce payment");
		});

		it("should throw BadRequestException if payment exceeds total", async () => {
			const updateDto = {
				amountPaid: 1200, // More than total 1000
			};

			await expect(
				purchasesService.updatePurchase(
					updateDto,
					purchaseId,
					testUserId,
					testStoreId,
				),
			).rejects.toThrow(/Amount paid .* cannot exceed total purchase/);
		});

		it("should throw BadRequestException if additional payment exceeds balance", async () => {
			const updateDto = {
				amountPaid: 800, // Additional 300, but balance is 500
			};

			// First update to reduce balance
			await purchasesService.updatePurchase(
				{ amountPaid: 700 },
				purchaseId,
				testUserId,
				testStoreId,
			);

			// Now try to pay more than remaining balance
			await expect(
				purchasesService.updatePurchase(
					{ amountPaid: 1200 },
					purchaseId,
					testUserId,
					testStoreId,
				),
			).rejects.toThrow(/cannot exceed total purchase/);
		});
	});

	describe("getPurchasesByDateRange", () => {
		beforeEach(async () => {
			// Create multiple purchases
			const today = new Date();
			const yesterday = new Date(today);
			yesterday.setDate(yesterday.getDate() - 1);
			const twoDaysAgo = new Date(today);
			twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

			await purchasesService.createPurchase(
				{
					supplierName: "Supplier Today",
					variants: [{ variantId: testVariantId, quantity: 5, price: 100 }],
					amountPaid: 500,
					email: "supplier@test.com",
					contact: "1234567890",
					dueDate: new Date(),
				},
				testUserId,
				testStoreId,
			);

			await purchasesService.createPurchase(
				{
					supplierName: "Supplier Yesterday",
					variants: [{ variantId: testVariantId, quantity: 5, price: 100 }],
					amountPaid: 500,
					email: "supplier@test.com",
					contact: "1234567890",
					dueDate: new Date(),
				},
				testUserId,
				testStoreId,
			);

			// Manually set date for one purchase
			await prisma.purchase.updateMany({
				where: { supplierName: "Supplier Yesterday" },
				data: { createdAt: yesterday },
			});
		});

		it("should return all purchases without date filter", async () => {
			const result = await purchasesService.getPurchasesByDateRange(
				testUserId,
				testStoreId,
			);

			expect(result.length).toBeGreaterThanOrEqual(2);
		});

		it("should filter purchases by from date", async () => {
			const yesterday = new Date();
			yesterday.setDate(yesterday.getDate() - 1);

			const result = await purchasesService.getPurchasesByDateRange(
				testUserId,
				testStoreId,
				yesterday.toISOString(),
			);

			// Should include yesterday and today
			expect(result.length).toBeGreaterThanOrEqual(2);
		});

		it("should filter purchases by to date", async () => {
			const yesterday = new Date();
			yesterday.setDate(yesterday.getDate() - 1);

			const result = await purchasesService.getPurchasesByDateRange(
				testUserId,
				testStoreId,
				undefined,
				yesterday.toISOString(),
			);

			// Should include only purchases up to yesterday
			const allBeforeYesterday = result.every(
				(p) => new Date(p.createdAt) <= yesterday,
			);
			expect(allBeforeYesterday).toBe(true);
		});

		it("should filter purchases by date range", async () => {
			const yesterday = new Date();
			yesterday.setDate(yesterday.getDate() - 1);

			const result = await purchasesService.getPurchasesByDateRange(
				testUserId,
				testStoreId,
				yesterday.toISOString(),
				yesterday.toISOString(),
			);

			// Should include only yesterday's purchases
			result.forEach((purchase) => {
				const purchaseDate = new Date(purchase.createdAt).toDateString();
				expect(purchaseDate).toBe(yesterday.toDateString());
			});
		});

		it("should include purchase items", async () => {
			const result = await purchasesService.getPurchasesByDateRange(
				testUserId,
				testStoreId,
			);

			result.forEach((purchase) => {
				expect(purchase.items).toBeDefined();
				expect(purchase.items.length).toBeGreaterThan(0);
			});
		});

		it("should include variant and product details", async () => {
			const result = await purchasesService.getPurchasesByDateRange(
				testUserId,
				testStoreId,
			);

			result.forEach((purchase) => {
				purchase.items.forEach((item) => {
					expect(item.variant).toBeDefined();
					expect(item.variant.product).toBeDefined();
				});
			});
		});

		it("should return purchases in descending order", async () => {
			const result = await purchasesService.getPurchasesByDateRange(
				testUserId,
				testStoreId,
			);

			for (let i = 1; i < result.length; i++) {
				expect(new Date(result[i - 1].createdAt).getTime()).toBeGreaterThanOrEqual(
					new Date(result[i].createdAt).getTime(),
				);
			}
		});

		it("should return empty array for future date range", async () => {
			const tomorrow = new Date();
			tomorrow.setDate(tomorrow.getDate() + 1);
			const nextWeek = new Date();
			nextWeek.setDate(nextWeek.getDate() + 7);

			const result = await purchasesService.getPurchasesByDateRange(
				testUserId,
				testStoreId,
				tomorrow.toISOString(),
				nextWeek.toISOString(),
			);

			expect(result).toHaveLength(0);
		});
	});

	describe("Data Integrity Tests", () => {
		it("should maintain stock consistency after multiple purchases", async () => {
			const initialVariant = await prisma.productVariant.findUnique({
				where: { id: testVariantId },
			});
			const initialStock = initialVariant?.stock || 50;

			// Create multiple purchases
			await purchasesService.createPurchase(
				{
					supplierName: "Supplier 1",
					variants: [{ variantId: testVariantId, quantity: 10, price: 100 }],
					amountPaid: 1000,
					email: "supplier@test.com",
					contact: "1234567890",
					dueDate: new Date(),
				},
				testUserId,
				testStoreId,
			);

			await purchasesService.createPurchase(
				{
					supplierName: "Supplier 2",
					variants: [{ variantId: testVariantId, quantity: 20, price: 90 }],
					amountPaid: 1800,
					email: "supplier@test.com",
					contact: "1234567890",
					dueDate: new Date(),
				},
				testUserId,
				testStoreId,
			);

			const finalVariant = await prisma.productVariant.findUnique({
				where: { id: testVariantId },
			});

			expect(finalVariant?.stock).toBe(initialStock + 30);
		});

		it("should handle concurrent purchases", async () => {
			const purchasePromises = Array.from({ length: 5 }).map((_, i) =>
				purchasesService.createPurchase(
					{
						supplierName: `Supplier ${i}`,
						variants: [{ variantId: testVariantId, quantity: 5, price: 100 }],
						amountPaid: 500,
						email: `supplier${i}@test.com`,
						contact: "1234567890",
						dueDate: new Date(),
					},
					testUserId,
					testStoreId,
				),
			);

			const results = await Promise.all(purchasePromises);

			results.forEach((result) => {
				expect(result.success).toBe(true);
			});

			const finalVariant = await prisma.productVariant.findUnique({
				where: { id: testVariantId },
			});

			expect(finalVariant?.stock).toBe(50 + 25); // 50 + (5 * 5)
		});

		it("should properly link purchase items to purchase", async () => {
			await purchasesService.createPurchase(
				{
					supplierName: "Test Supplier",
					variants: [{ variantId: testVariantId, quantity: 10, price: 100 }],
					amountPaid: 1000,
					email: "supplier@test.com",
					contact: "1234567890",
					dueDate: new Date(),
				},
				testUserId,
				testStoreId,
			);

			const purchase = await prisma.purchase.findFirst({
				where: { supplierName: "Test Supplier" },
				include: { items: true },
			});

			expect(purchase?.items).toHaveLength(1);
			expect(purchase?.items[0].purchaseId).toBe(purchase?.id);
		});

		it("should properly link transaction to purchase and daily balance", async () => {
			// Create initial capital and daily balance
			const todayStr = new Date().toISOString().split("T")[0];
			await prisma.dailyBalance.upsert({
				where: { storeId_date: { storeId: testStoreId, date: todayStr } },
				update: {},
				create: {
					storeId: testStoreId,
					date: todayStr,
					openingCash: 10000,
					closingCash: 10000,
					totalCashIn: 10000,
					totalCashOut: 0,
					totalSales: 0,
					totalExpense: 0,
				},
			});

			await purchasesService.createPurchase(
				{
					supplierName: "Test Supplier",
					contact: "1234567890",
					email: "[EMAIL_ADDRESS]",
					dueDate: new Date(),
					variants: [{ variantId: testVariantId, quantity: 10, price: 100 }],
					amountPaid: 500,

				},
				testUserId,
				testStoreId,
			);

			const transaction = await prisma.accountTransaction.findFirst({
				where: { storeId: testStoreId, type: "PURCHASE" },
				include: { dailyBalance: true, purchase: true },
			});

			expect(transaction).toBeDefined();
			expect(transaction?.purchaseId).toBeDefined();
			expect(transaction?.dailyBalanceId).toBeDefined();
			expect(transaction?.dailyBalance).toBeDefined();
			expect(transaction?.purchase).toBeDefined();
		});
	});

	describe("Edge Cases", () => {
		it("should handle purchase with zero payment", async () => {
			const result = await purchasesService.createPurchase(
				{
					supplierName: "Credit Supplier",
					variants: [{ variantId: testVariantId, quantity: 10, price: 100 }],
					amountPaid: 0,
					email: "supplier@test.com",
					contact: "1234567890",
					dueDate: new Date(),
				},
				testUserId,
				testStoreId,
			);

			expect(result.success).toBe(true);

			const purchase = await prisma.purchase.findFirst({
				where: { supplierName: "Credit Supplier" },
			});

			expect(purchase?.status).toBe("PENDING");
			expect(Number(purchase?.balanceDue)).toBe(1000);
		});

		it("should handle very large purchase quantities", async () => {
			const result = await purchasesService.createPurchase(
				{
					supplierName: "Bulk Supplier",
					variants: [{ variantId: testVariantId, quantity: 10000, price: 100 }],
					amountPaid: 1000000,
					email: "supplier@test.com",
					contact: "1234567890",
					dueDate: new Date(),
				},
				testUserId,
				testStoreId,
			);

			expect(result.success).toBe(true);

			const updatedVariant = await prisma.productVariant.findUnique({
				where: { id: testVariantId },
			});

			expect(updatedVariant?.stock).toBe(50 + 10000);
		});

		it("should handle purchase with decimal prices", async () => {
			const result = await purchasesService.createPurchase(
				{
					supplierName: "Decimal Supplier",
					variants: [
						{ variantId: testVariantId, quantity: 10, price: 99.99 },
					],
					amountPaid: 999.90,
					email: "supplier@test.com",
					contact: "1234567890",
					dueDate: new Date(),
				},
				testUserId,
				testStoreId,
			);

			expect(result.success).toBe(true);

			const purchase = await prisma.purchase.findFirst({
				where: { supplierName: "Decimal Supplier" },
			});

			expect(Number(purchase?.total)).toBeCloseTo(999.9, 2);
		});

		it("should handle purchase with special characters in supplier name", async () => {
			const result = await purchasesService.createPurchase(
				{
					supplierName: "Supplier™ ® © Special!@#$%",
					variants: [{ variantId: testVariantId, quantity: 10, price: 100 }],
					amountPaid: 1000,
					email: "supplier@test.com",
					contact: "1234567890",
					dueDate: new Date(),
				},
				testUserId,
				testStoreId,
			);

			expect(result.success).toBe(true);

			const purchase = await prisma.purchase.findFirst({
				where: { supplierName: "Supplier™ ® © Special!@#$%" },
			});

			expect(purchase).toBeDefined();
		});

		it("should handle purchase update with exact balance payment", async () => {
			const createResult = await purchasesService.createPurchase(
				{
					supplierName: "Test Supplier",
					variants: [{ variantId: testVariantId, quantity: 10, price: 100 }],
					amountPaid: 500,
					dueDate: new Date(),
					contact: "1234567890",
					email: "[EMAIL_ADDRESS]",
				},
				testUserId,
				testStoreId,
			);

			const purchase = await prisma.purchase.findFirst({
				where: { supplierName: "Test Supplier" },
			});

			const updateResult = await purchasesService.updatePurchase(
				{ amountPaid: 1000 },
				purchase?.id || "",
				testUserId,
				testStoreId,
			);

			expect(updateResult.success).toBe(true);

			const updated = await prisma.purchase.findUnique({
				where: { id: purchase?.id },
			});

			expect(Number(updated?.balanceDue)).toBe(0);
			expect(updated?.status).toBe("PAID");
		});
	});
});

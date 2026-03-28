import {
	TestContext,
	createTestContext,
	generateTestId,
} from "test/test-utils";
import { PrismaClient } from "@kosh/db";
import { AccountsService } from "./accounts.service";
import { DatabaseService } from "../../database/database.service";

describe("AccountsService Integration Tests", () => {
	let context: TestContext;
	let accountsService: AccountsService;
	let databaseService: DatabaseService;
	let prisma: PrismaClient;

	let testUserId: string;
	let testStoreId: string;

	beforeAll(async () => {
		// Create test context with isolated PostgreSQL container
		context = await createTestContext();
		testUserId = context.userId;
		testStoreId = context.storeId;

		databaseService = context.databaseService;
		prisma = databaseService.prisma;
		accountsService = new AccountsService(databaseService);
	});

	afterAll(async () => {
		await context.close();
	});

	beforeEach(async () => {
		// Clean up before each test
		await prisma.accountTransaction.deleteMany();
		await prisma.dailyBalance.deleteMany();
	});

	describe("createTransaction - Success Scenarios", () => {
		it("should create INITIAL_CAPITAL transaction as first transaction of the day", async () => {
			const createTransactionDto = {
				type: "INITIAL_CAPITAL" as const,
				amount: 10000,
				note: "Initial capital for the day",
			};

			const result = await accountsService.createTransaction(
				createTransactionDto,
				testUserId,
				testStoreId,
			);

			expect(result.success).toBe(true);
			expect(result.message).toBe("Transaction created successfully");
			expect(result.data?.type).toBe("INITIAL_CAPITAL");
			expect(result.data?.amount).toBe(10000);

			const todayStr = new Date().toISOString().split("T")[0];
			const dailyBalance = await prisma.dailyBalance.findUnique({
				where: { storeId_date: { storeId: testStoreId, date: todayStr } },
			});

			expect(dailyBalance).toBeDefined();
			expect(Number(dailyBalance?.openingCash)).toBe(10000);
			expect(Number(dailyBalance?.closingCash)).toBe(10000);
		});

		it("should create ADDITIONAL_CAPITAL transaction", async () => {
			await accountsService.createTransaction(
				{
					type: "INITIAL_CAPITAL" as const,
					amount: 5000,
					note: "Initial",
				},
				testUserId,
				testStoreId,
			);

			const createTransactionDto = {
				type: "ADDITIONAL_CAPITAL" as const,
				amount: 3000,
				note: "Additional investment",
			};

			const result = await accountsService.createTransaction(
				createTransactionDto,
				testUserId,
				testStoreId,
			);

			expect(result.success).toBe(true);
			expect(result.data?.type).toBe("ADDITIONAL_CAPITAL");
			expect(result.data?.amount).toBe(3000);

			const todayStr = new Date().toISOString().split("T")[0];
			const dailyBalance = await prisma.dailyBalance.findUnique({
				where: { storeId_date: { storeId: testStoreId, date: todayStr } },
			});

			expect(Number(dailyBalance?.closingCash)).toBe(8000);
			expect(Number(dailyBalance?.totalCashIn)).toBe(8000);
		});

		it("should create SALE_INCOME transaction", async () => {
			await accountsService.createTransaction(
				{
					type: "INITIAL_CAPITAL" as const,
					amount: 5000,
					note: "Initial",
				},
				testUserId,
				testStoreId,
			);

			const createTransactionDto = {
				type: "SALE_INCOME" as const,
				amount: 1500,
				note: "Sale income",
			};

			const result = await accountsService.createTransaction(
				createTransactionDto,
				testUserId,
				testStoreId,
			);

			expect(result.success).toBe(true);
			expect(result.data?.type).toBe("SALE_INCOME");

			const todayStr = new Date().toISOString().split("T")[0];
			const dailyBalance = await prisma.dailyBalance.findUnique({
				where: { storeId_date: { storeId: testStoreId, date: todayStr } },
			});

			expect(Number(dailyBalance?.closingCash)).toBe(6500);
			expect(Number(dailyBalance?.totalSales)).toBe(1500);
			expect(Number(dailyBalance?.totalCashIn)).toBe(6500);
		});

		it("should create CREDIT_RECEIVED transaction", async () => {
			await accountsService.createTransaction(
				{
					type: "INITIAL_CAPITAL" as const,
					amount: 5000,
					note: "Initial",
				},
				testUserId,
				testStoreId,
			);

			const createTransactionDto = {
				type: "CREDIT_RECEIVED" as const,
				amount: 2000,
				note: "Credit payment received",
			};

			const result = await accountsService.createTransaction(
				createTransactionDto,
				testUserId,
				testStoreId,
			);

			expect(result.success).toBe(true);
			expect(result.data?.type).toBe("CREDIT_RECEIVED");

			const todayStr = new Date().toISOString().split("T")[0];
			const dailyBalance = await prisma.dailyBalance.findUnique({
				where: { storeId_date: { storeId: testStoreId, date: todayStr } },
			});

			expect(Number(dailyBalance?.closingCash)).toBe(7000);
			expect(Number(dailyBalance?.totalSales)).toBe(2000);
		});

		it("should create WITHDRAWAL transaction", async () => {
			await accountsService.createTransaction(
				{
					type: "INITIAL_CAPITAL" as const,
					amount: 5000,
					note: "Initial",
				},
				testUserId,
				testStoreId,
			);

			const createTransactionDto = {
				type: "WITHDRAWAL" as const,
				amount: 1000,
				note: "Cash withdrawal",
			};

			const result = await accountsService.createTransaction(
				createTransactionDto,
				testUserId,
				testStoreId,
			);

			expect(result.success).toBe(true);
			expect(result.data?.type).toBe("WITHDRAWAL");

			const todayStr = new Date().toISOString().split("T")[0];
			const dailyBalance = await prisma.dailyBalance.findUnique({
				where: { storeId_date: { storeId: testStoreId, date: todayStr } },
			});

			expect(Number(dailyBalance?.closingCash)).toBe(4000);
			expect(Number(dailyBalance?.totalCashOut)).toBe(1000);
		});

		it("should create PURCHASE transaction", async () => {
			await accountsService.createTransaction(
				{
					type: "INITIAL_CAPITAL" as const,
					amount: 10000,
					note: "Initial",
				},
				testUserId,
				testStoreId,
			);

			const createTransactionDto = {
				type: "PURCHASE" as const,
				amount: 3000,
				note: "Stock purchase",
			};

			const result = await accountsService.createTransaction(
				createTransactionDto,
				testUserId,
				testStoreId,
			);

			expect(result.success).toBe(true);
			expect(result.data?.type).toBe("PURCHASE");

			const todayStr = new Date().toISOString().split("T")[0];
			const dailyBalance = await prisma.dailyBalance.findUnique({
				where: { storeId_date: { storeId: testStoreId, date: todayStr } },
			});

			expect(Number(dailyBalance?.closingCash)).toBe(7000);
			expect(Number(dailyBalance?.totalCashOut)).toBe(3000);
			expect(Number(dailyBalance?.totalExpense)).toBe(3000);
		});

		it("should create EXPENSES transaction", async () => {
			await accountsService.createTransaction(
				{
					type: "INITIAL_CAPITAL" as const,
					amount: 5000,
					note: "Initial",
				},
				testUserId,
				testStoreId,
			);

			const createTransactionDto = {
				type: "EXPENSES" as const,
				amount: 500,
				note: "Utility bill payment",
			};

			const result = await accountsService.createTransaction(
				createTransactionDto,
				testUserId,
				testStoreId,
			);

			expect(result.success).toBe(true);
			expect(result.data?.type).toBe("EXPENSES");

			const todayStr = new Date().toISOString().split("T")[0];
			const dailyBalance = await prisma.dailyBalance.findUnique({
				where: { storeId_date: { storeId: testStoreId, date: todayStr } },
			});

			expect(Number(dailyBalance?.closingCash)).toBe(4500);
			expect(Number(dailyBalance?.totalCashOut)).toBe(500);
			expect(Number(dailyBalance?.totalExpense)).toBe(500);
		});

		it("should create DEBT_PAID transaction", async () => {
			await accountsService.createTransaction(
				{
					type: "INITIAL_CAPITAL" as const,
					amount: 10000,
					note: "Initial",
				},
				testUserId,
				testStoreId,
			);

			const createTransactionDto = {
				type: "DEBT_PAID" as const,
				amount: 2000,
				note: "Debt payment",
			};

			const result = await accountsService.createTransaction(
				createTransactionDto,
				testUserId,
				testStoreId,
			);

			expect(result.success).toBe(true);
			expect(result.data?.type).toBe("DEBT_PAID");

			const todayStr = new Date().toISOString().split("T")[0];
			const dailyBalance = await prisma.dailyBalance.findUnique({
				where: { storeId_date: { storeId: testStoreId, date: todayStr } },
			});

			expect(Number(dailyBalance?.closingCash)).toBe(8000);
			expect(Number(dailyBalance?.totalCashOut)).toBe(2000);
			expect(Number(dailyBalance?.totalExpense)).toBe(2000);
		});

		it("should create daily balance with yesterday's closing balance if first transaction is not INITIAL_CAPITAL", async () => {
			const today = new Date();
			const yesterday = new Date(today);
			yesterday.setDate(yesterday.getDate() - 1);
			const yesterdayStr = yesterday.toISOString().split("T")[0];

			await prisma.dailyBalance.create({
				data: {
					storeId: testStoreId,
					date: yesterdayStr,
					openingCash: 5000,
					closingCash: 8000,
					totalCashIn: 5000,
					totalCashOut: 2000,
					totalSales: 3000,
					totalExpense: 1000,
				},
			});

			const createTransactionDto = {
				type: "ADDITIONAL_CAPITAL" as const,
				amount: 2000,
				note: "Additional capital",
			};

			const result = await accountsService.createTransaction(
				createTransactionDto,
				testUserId,
				testStoreId,
			);

			expect(result.success).toBe(true);

			const todayStr = today.toISOString().split("T")[0];
			const dailyBalance = await prisma.dailyBalance.findUnique({
				where: { storeId_date: { storeId: testStoreId, date: todayStr } },
			});

			expect(Number(dailyBalance?.openingCash)).toBe(8000);
			expect(Number(dailyBalance?.closingCash)).toBe(10000);
		});

		it("should create transaction without note", async () => {
			const createTransactionDto = {
				type: "INITIAL_CAPITAL" as const,
				amount: 5000,
			};

			const result = await accountsService.createTransaction(
				createTransactionDto,
				testUserId,
				testStoreId,
			);

			expect(result.success).toBe(true);
			expect(result.data?.note).toBeUndefined();
		});
	});

	describe("createTransaction - Error Scenarios", () => {
		it("should throw ConflictException if first transaction is not INITIAL_CAPITAL", async () => {
			const createTransactionDto = {
				type: "SALE_INCOME" as const,
				amount: 1000,
				note: "Sale income",
			};

			await expect(
				accountsService.createTransaction(
					createTransactionDto,
					testUserId,
					testStoreId,
				),
			).rejects.toThrow("First transaction of the day must be INITIAL_CAPITAL");
		});

		it("should throw ConflictException if multiple INITIAL_CAPITAL transactions on same day", async () => {
			await accountsService.createTransaction(
				{
					type: "INITIAL_CAPITAL" as const,
					amount: 5000,
					note: "First",
				},
				testUserId,
				testStoreId,
			);

			const createTransactionDto = {
				type: "INITIAL_CAPITAL" as const,
				amount: 3000,
				note: "Second",
			};

			await expect(
				accountsService.createTransaction(
					createTransactionDto,
					testUserId,
					testStoreId,
				),
			).rejects.toThrow("INITIAL_CAPITAL can only be recorded once per day");
		});

		it("should throw BadRequestException for negative amount", async () => {
			await accountsService.createTransaction(
				{
					type: "INITIAL_CAPITAL" as const,
					amount: 5000,
					note: "Initial",
				},
				testUserId,
				testStoreId,
			);

			const createTransactionDto = {
				type: "SALE_INCOME" as const,
				amount: -100,
				note: "Negative amount",
			};

			await expect(
				accountsService.createTransaction(
					createTransactionDto,
					testUserId,
					testStoreId,
				),
			).rejects.toThrow("Amount must be positive");
		});

		it("should throw BadRequestException for zero amount", async () => {
			await accountsService.createTransaction(
				{
					type: "INITIAL_CAPITAL" as const,
					amount: 5000,
					note: "Initial",
				},
				testUserId,
				testStoreId,
			);

			const createTransactionDto = {
				type: "SALE_INCOME" as const,
				amount: 0,
				note: "Zero amount",
			};

			await expect(
				accountsService.createTransaction(
					createTransactionDto,
					testUserId,
					testStoreId,
				),
			).rejects.toThrow("Amount must be positive");
		});

		it("should throw ConflictException for WITHDRAWAL exceeding balance", async () => {
			await accountsService.createTransaction(
				{
					type: "INITIAL_CAPITAL" as const,
					amount: 1000,
					note: "Initial",
				},
				testUserId,
				testStoreId,
			);

			const createTransactionDto = {
				type: "WITHDRAWAL" as const,
				amount: 2000,
				note: "Excessive withdrawal",
			};

			await expect(
				accountsService.createTransaction(
					createTransactionDto,
					testUserId,
					testStoreId,
				),
			).rejects.toThrow("Insufficient funds");
		});

		it("should throw ConflictException for PURCHASE exceeding balance", async () => {
			await accountsService.createTransaction(
				{
					type: "INITIAL_CAPITAL" as const,
					amount: 1000,
					note: "Initial",
				},
				testUserId,
				testStoreId,
			);

			const createTransactionDto = {
				type: "PURCHASE" as const,
				amount: 2000,
				note: "Excessive purchase",
			};

			await expect(
				accountsService.createTransaction(
					createTransactionDto,
					testUserId,
					testStoreId,
				),
			).rejects.toThrow("Insufficient funds");
		});

		it("should throw ConflictException for EXPENSES exceeding balance", async () => {
			await accountsService.createTransaction(
				{
					type: "INITIAL_CAPITAL" as const,
					amount: 1000,
					note: "Initial",
				},
				testUserId,
				testStoreId,
			);

			const createTransactionDto = {
				type: "EXPENSES" as const,
				amount: 2000,
				note: "Excessive expense",
			};

			await expect(
				accountsService.createTransaction(
					createTransactionDto,
					testUserId,
					testStoreId,
				),
			).rejects.toThrow("Insufficient funds");
		});

		it("should throw ConflictException for DEBT_PAID exceeding balance", async () => {
			await accountsService.createTransaction(
				{
					type: "INITIAL_CAPITAL" as const,
					amount: 1000,
					note: "Initial",
				},
				testUserId,
				testStoreId,
			);

			const createTransactionDto = {
				type: "DEBT_PAID" as const,
				amount: 2000,
				note: "Excessive debt payment",
			};

			await expect(
				accountsService.createTransaction(
					createTransactionDto,
					testUserId,
					testStoreId,
				),
			).rejects.toThrow("Insufficient funds");
		});

		it("should throw BadRequestException for invalid transaction type", async () => {
			await accountsService.createTransaction(
				{
					type: "INITIAL_CAPITAL" as const,
					amount: 5000,
					note: "Initial",
				},
				testUserId,
				testStoreId,
			);

			const createTransactionDto = {
				type: "INVALID_TYPE" as any,
				amount: 1000,
				note: "Invalid type",
			};

			await expect(
				accountsService.createTransaction(
					createTransactionDto,
					testUserId,
					testStoreId,
				),
			).rejects.toThrow("Invalid transaction type");
		});
	});

	describe("getCurrentCashBalance", () => {
		it("should return today's cash balance", async () => {
			await accountsService.createTransaction(
				{
					type: "INITIAL_CAPITAL" as const,
					amount: 10000,
					note: "Initial",
				},
				testUserId,
				testStoreId,
			);

			await accountsService.createTransaction(
				{
					type: "SALE_INCOME" as const,
					amount: 2000,
					note: "Sale",
				},
				testUserId,
				testStoreId,
			);

			await accountsService.createTransaction(
				{
					type: "EXPENSES" as const,
					amount: 500,
					note: "Expense",
				},
				testUserId,
				testStoreId,
			);

			const result = await accountsService.getCurrentCashBalance(
				testUserId,
				testStoreId,
			);

			expect(result.success).toBe(true);
			expect(result.data?.openingCash).toBe(10000);
			expect(result.data?.closingCash).toBe(11500);
			expect(result.data?.totalCashIn).toBe(12000);
			expect(result.data?.totalCashOut).toBe(500);
			expect(result.data?.totalSales).toBe(2000);
			expect(result.data?.totalExpense).toBe(500);
		});

		it("should return zero balance when no transactions exist", async () => {
			const result = await accountsService.getCurrentCashBalance(
				testUserId,
				testStoreId,
			);

			expect(result.success).toBe(true);
			expect(result.data?.openingCash).toBe(0);
			expect(result.data?.closingCash).toBe(0);
			expect(result.data?.totalCashIn).toBe(0);
			expect(result.data?.totalCashOut).toBe(0);
			expect(result.data?.totalSales).toBe(0);
			expect(result.data?.totalExpense).toBe(0);
		});

		it("should return balance for specific store", async () => {
			const otherStore = await prisma.store.create({
				data: {
					name: generateTestId("Other Store"),
					creatorId: testUserId,
				},
			});

			await accountsService.createTransaction(
				{
					type: "INITIAL_CAPITAL" as const,
					amount: 5000,
					note: "Initial",
				},
				testUserId,
				testStoreId,
			);

			const result = await accountsService.getCurrentCashBalance(
				testUserId,
				testStoreId,
			);

			expect(result.data?.closingCash).toBe(5000);

			const otherStoreBalance = await accountsService.getCurrentCashBalance(
				testUserId,
				otherStore.id,
			);
			expect(otherStoreBalance.data?.closingCash).toBe(0);
		});
	});

	describe("getAccountTransactions", () => {
		beforeEach(async () => {
			await accountsService.createTransaction(
				{
					type: "INITIAL_CAPITAL" as const,
					amount: 10000,
					note: "Initial",
				},
				testUserId,
				testStoreId,
			);

			await accountsService.createTransaction(
				{
					type: "SALE_INCOME" as const,
					amount: 500,
					note: "Sale 1",
				},
				testUserId,
				testStoreId,
			);

			await accountsService.createTransaction(
				{
					type: "SALE_INCOME" as const,
					amount: 300,
					note: "Sale 2",
				},
				testUserId,
				testStoreId,
			);

			await accountsService.createTransaction(
				{
					type: "EXPENSES" as const,
					amount: 200,
					note: "Expense 1",
				},
				testUserId,
				testStoreId,
			);
		});

		it("should return all transactions for today", async () => {
			const result = await accountsService.getAccountTransactions(
				testUserId,
				testStoreId,
				1,
				10,
			);

			expect(result.success).toBe(true);
			expect(result.data.length).toBe(4);
			expect(result.meta.total).toBe(4);
			expect(result.meta.page).toBe(1);
			expect(result.meta.limit).toBe(10);
		});

		it("should return paginated transactions", async () => {
			const result = await accountsService.getAccountTransactions(
				testUserId,
				testStoreId,
				1,
				2,
			);

			expect(result.success).toBe(true);
			expect(result.data.length).toBe(2);
			expect(result.meta.total).toBe(4);
			expect(result.meta.totalPages).toBe(2);
			expect(result.meta.hasNext).toBe(true);
			expect(result.meta.hasPrev).toBe(false);
		});

		it("should return second page of transactions", async () => {
			const result = await accountsService.getAccountTransactions(
				testUserId,
				testStoreId,
				2,
				2,
			);

			expect(result.success).toBe(true);
			expect(result.data.length).toBe(2);
			expect(result.meta.page).toBe(2);
			expect(result.meta.hasNext).toBe(false);
			expect(result.meta.hasPrev).toBe(true);
		});

		it("should sort transactions by createdAt descending by default", async () => {
			const result = await accountsService.getAccountTransactions(
				testUserId,
				testStoreId,
				1,
				10,
				"createdAt",
				"desc",
			);

			expect(result.success).toBe(true);
			expect(result.data[0].createdAt).toBeDefined();
		});

		it("should sort transactions by amount", async () => {
			const result = await accountsService.getAccountTransactions(
				testUserId,
				testStoreId,
				1,
				10,
				"amount",
				"desc",
			);

			expect(result.success).toBe(true);
			expect(result.data[0].amount).toBeGreaterThanOrEqual(
				result.data[result.data.length - 1].amount,
			);
		});

		it("should sort transactions by type", async () => {
			const result = await accountsService.getAccountTransactions(
				testUserId,
				testStoreId,
				1,
				10,
				"type",
				"asc",
			);

			expect(result.success).toBe(true);
			expect(result.data.length).toBe(4);
		});

		it("should return empty array when no transactions exist", async () => {
			const newStore = await prisma.store.create({
				data: {
					name: generateTestId("Empty Store"),
					creatorId: testUserId,
				},
			});

			const result = await accountsService.getAccountTransactions(
				testUserId,
				newStore.id,
				1,
				10,
			);

			expect(result.success).toBe(true);
			expect(result.data).toHaveLength(0);
			expect(result.meta.total).toBe(0);
		});

		it("should only return today's transactions", async () => {
			const result = await accountsService.getAccountTransactions(
				testUserId,
				testStoreId,
				1,
				10,
			);

			expect(
				result.data.every((t) => {
					const txDate = new Date(t.createdAt).toISOString().split("T")[0];
					const today = new Date().toISOString().split("T")[0];
					return txDate === today;
				}),
			).toBe(true);
		});

		it("should format transaction amounts correctly", async () => {
			const result = await accountsService.getAccountTransactions(
				testUserId,
				testStoreId,
				1,
				10,
			);

			result.data.forEach((transaction) => {
				expect(typeof transaction.amount).toBe("number");
				expect(transaction.id).toBeDefined();
				expect(transaction.type).toBeDefined();
				expect(transaction.createdAt).toBeDefined();
				expect(transaction.updatedAt).toBeDefined();
			});
		});
	});

	describe("updateAccountTransaction", () => {
		let transactionId: string;

		beforeEach(async () => {
			await accountsService.createTransaction(
				{
					type: "INITIAL_CAPITAL" as const,
					amount: 5000,
					note: "Initial",
				},
				testUserId,
				testStoreId,
			);

			const result = await accountsService.createTransaction(
				{
					type: "SALE_INCOME" as const,
					amount: 1000,
					note: "Original note",
				},
				testUserId,
				testStoreId,
			);

			transactionId = result.data?.id || "";
		});

		it("should update transaction successfully", async () => {
			const updateDto = {
				type: "ADDITIONAL_CAPITAL" as const,
				amount: 1500,
				note: "Updated note",
			};

			const result = await accountsService.updateAccountTransaction(
				transactionId,
				updateDto,
				testUserId,
				testStoreId,
			);

			expect(result.success).toBe(true);
			expect(result.message).toBe("Transaction updated successfully");
			expect(result.data?.type).toBe("ADDITIONAL_CAPITAL");
			expect(result.data?.amount).toBe(1500);
			expect(result.data?.note).toBe("Updated note");
		});

		it("should update only the note", async () => {
			const updateDto = {
				type: "SALE_INCOME" as const,
				amount: 1000,
				note: "New note",
			};

			const result = await accountsService.updateAccountTransaction(
				transactionId,
				updateDto,
				testUserId,
				testStoreId,
			);

			expect(result.success).toBe(true);
			expect(result.data?.note).toBe("New note");
			expect(result.data?.amount).toBe(1000);
		});

		it("should update only the amount", async () => {
			const updateDto = {
				type: "SALE_INCOME" as const,
				amount: 2000,
				note: "Original note",
			};

			const result = await accountsService.updateAccountTransaction(
				transactionId,
				updateDto,
				testUserId,
				testStoreId,
			);

			expect(result.success).toBe(true);
			expect(result.data?.amount).toBe(2000);
			expect(result.data?.note).toBe("Original note");
		});

		it("should throw NotFoundException if transaction doesn't exist", async () => {
			const updateDto = {
				type: "SALE_INCOME" as const,
				amount: 1000,
				note: "Note",
			};

			await expect(
				accountsService.updateAccountTransaction(
					"non-existent-id",
					updateDto,
					testUserId,
					testStoreId,
				),
			).rejects.toThrow("Transaction not found");
		});

		it("should throw NotFoundException if transaction belongs to different store", async () => {
			const otherStore = await prisma.store.create({
				data: {
					name: generateTestId("Other Store"),
					creatorId: testUserId,
				},
			});

			await accountsService.createTransaction(
				{
					type: "INITIAL_CAPITAL" as const,
					amount: 5000,
					note: "Initial",
				},
				testUserId,
				otherStore.id,
			);

			const otherTx = await accountsService.createTransaction(
				{
					type: "SALE_INCOME" as const,
					amount: 1000,
					note: "Sale",
				},
				testUserId,
				otherStore.id,
			);

			const updateDto = {
				type: "SALE_INCOME" as const,
				amount: 1500,
				note: "Updated",
			};

			await expect(
				accountsService.updateAccountTransaction(
					otherTx.data!.id,
					updateDto,
					testUserId,
					testStoreId,
				),
			).rejects.toThrow("Transaction not found");
		});

		it("should preserve timestamps after update", async () => {
			const originalTx = await prisma.accountTransaction.findUnique({
				where: { id: transactionId },
			});

			const updateDto = {
				type: "ADDITIONAL_CAPITAL" as const,
				amount: 2000,
				note: "Updated",
			};

			const result = await accountsService.updateAccountTransaction(
				transactionId,
				updateDto,
				testUserId,
				testStoreId,
			);

			expect(result.data?.createdAt.toISOString()).toBe(originalTx?.createdAt.toISOString());
			expect(result.data?.updatedAt).toBeDefined();
		});
	});

	describe("Data Integrity Tests", () => {
		it("should maintain transaction order correctly", async () => {
			await accountsService.createTransaction(
				{
					type: "INITIAL_CAPITAL" as const,
					amount: 10000,
					note: "Initial",
				},
				testUserId,
				testStoreId,
			);

			const transactions = [
				{ type: "SALE_INCOME" as const, amount: 500 },
				{ type: "EXPENSES" as const, amount: 200 },
				{ type: "SALE_INCOME" as const, amount: 300 },
				{ type: "WITHDRAWAL" as const, amount: 1000 },
			];

			for (const tx of transactions) {
				await accountsService.createTransaction(
					{ ...tx, note: `Transaction ${tx.amount}` },
					testUserId,
					testStoreId,
				);
			}

			const result = await accountsService.getAccountTransactions(
				testUserId,
				testStoreId,
				1,
				10,
				"createdAt",
				"asc",
			);

			expect(result.data[0].type).toBe("INITIAL_CAPITAL");
			expect(result.data[0].amount).toBe(10000);
		});

		it("should handle concurrent transactions", async () => {
			await accountsService.createTransaction(
				{
					type: "INITIAL_CAPITAL" as const,
					amount: 100000,
					note: "Initial",
				},
				testUserId,
				testStoreId,
			);

			const transactionPromises = Array.from({ length: 10 }).map((_, i) =>
				accountsService.createTransaction(
					{
						type: "SALE_INCOME" as const,
						amount: 100,
						note: `Concurrent sale ${i}`,
					},
					testUserId,
					testStoreId,
				),
			);

			const results = await Promise.all(transactionPromises);

			results.forEach((result) => {
				expect(result.success).toBe(true);
			});

			const allTransactions = await accountsService.getAccountTransactions(
				testUserId,
				testStoreId,
				1,
				20,
			);

			expect(allTransactions.data.length).toBe(11);
		});

		it("should properly link transaction to daily balance", async () => {
			await accountsService.createTransaction(
				{
					type: "INITIAL_CAPITAL" as const,
					amount: 5000,
					note: "Initial",
				},
				testUserId,
				testStoreId,
			);

			const tx = await prisma.accountTransaction.findFirst({
				where: { storeId: testStoreId },
				include: { dailyBalance: true },
			});

			expect(tx?.dailyBalanceId).toBeDefined();
			expect(tx?.dailyBalance).toBeDefined();
			expect(Number(tx?.dailyBalance?.closingCash)).toBe(5000);
		});

		it("should maintain accurate daily balance after multiple transactions", async () => {
			const transactions = [
				{ type: "INITIAL_CAPITAL" as const, amount: 10000 },
				{ type: "SALE_INCOME" as const, amount: 2000 },
				{ type: "EXPENSES" as const, amount: 500 },
				{ type: "WITHDRAWAL" as const, amount: 1000 },
				{ type: "ADDITIONAL_CAPITAL" as const, amount: 3000 },
			];

			for (const tx of transactions) {
				await accountsService.createTransaction(
					{ ...tx, note: `Transaction ${tx.amount}` },
					testUserId,
					testStoreId,
				);
			}

			const balance = await accountsService.getCurrentCashBalance(
				testUserId,
				testStoreId,
			);

			expect(balance.data?.closingCash).toBe(13500);
			expect(balance.data?.totalCashIn).toBe(15000);
			expect(balance.data?.totalCashOut).toBe(1500);
		});
	});

	describe("Edge Cases", () => {
		it("should handle very large transaction amounts", async () => {
			await accountsService.createTransaction(
				{
					type: "INITIAL_CAPITAL" as const,
					amount: 1000000000,
					note: "Large capital",
				},
				testUserId,
				testStoreId,
			);

			const balance = await accountsService.getCurrentCashBalance(
				testUserId,
				testStoreId,
			);

			expect(balance.data?.closingCash).toBe(1000000000);
		});

		it("should handle decimal amounts", async () => {
			await accountsService.createTransaction(
				{
					type: "INITIAL_CAPITAL" as const,
					amount: 10000.99,
					note: "Initial with decimals",
				},
				testUserId,
				testStoreId,
			);

			const result = await accountsService.createTransaction(
				{
					type: "SALE_INCOME" as const,
					amount: 999.99,
					note: "Sale with decimals",
				},
				testUserId,
				testStoreId,
			);

			expect(result.data?.amount).toBe(999.99);

			const balance = await accountsService.getCurrentCashBalance(
				testUserId,
				testStoreId,
			);

			expect(balance.data?.closingCash).toBe(11000.98);
		});

		it("should handle transaction with very long note", async () => {
			const longNote = "A".repeat(500);

			const result = await accountsService.createTransaction(
				{
					type: "INITIAL_CAPITAL" as const,
					amount: 1000,
					note: longNote,
				},
				testUserId,
				testStoreId,
			);

			expect(result.success).toBe(true);
			expect(result.data?.note).toBe(longNote);
		});

		it("should handle multiple stores independently", async () => {
			const store2 = await prisma.store.create({
				data: {
					name: generateTestId("Store 2"),
					creatorId: testUserId,
				},
			});

			await accountsService.createTransaction(
				{
					type: "INITIAL_CAPITAL" as const,
					amount: 5000,
					note: "Store 1",
				},
				testUserId,
				testStoreId,
			);

			await accountsService.createTransaction(
				{
					type: "INITIAL_CAPITAL" as const,
					amount: 3000,
					note: "Store 2",
				},
				testUserId,
				store2.id,
			);

			const balance1 = await accountsService.getCurrentCashBalance(
				testUserId,
				testStoreId,
			);
			const balance2 = await accountsService.getCurrentCashBalance(
				testUserId,
				store2.id,
			);

			expect(balance1.data?.closingCash).toBe(5000);
			expect(balance2.data?.closingCash).toBe(3000);
		});

		it("should handle transaction immediately after midnight", async () => {
			await accountsService.createTransaction(
				{
					type: "INITIAL_CAPITAL" as const,
					amount: 1000,
					note: "Today's first transaction",
				},
				testUserId,
				testStoreId,
			);

			const balance = await accountsService.getCurrentCashBalance(
				testUserId,
				testStoreId,
			);

			expect(balance.data?.closingCash).toBe(1000);

			const todayStr = new Date().toISOString().split("T")[0];
			const dailyBalance = await prisma.dailyBalance.findUnique({
				where: { storeId_date: { storeId: testStoreId, date: todayStr } },
			});

			expect(dailyBalance?.date).toBe(todayStr);
		});
	});
});

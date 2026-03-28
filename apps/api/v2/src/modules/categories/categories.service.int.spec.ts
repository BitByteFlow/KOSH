import {
	TestContext,
	createTestContext,
	generateTestId,
} from "test/test-utils";
import { PrismaClient } from "@kosh/db";
import { CategoriesService } from "./categories.service";
import { DatabaseService } from "../../database/database.service";

describe("CategoriesService Integration Tests", () => {
	let context: TestContext;
	let categoriesService: CategoriesService;
	let databaseService: DatabaseService;
	let prisma: PrismaClient;

	let testStoreId: string;

	beforeAll(async () => {
		console.log("Starting CategoriesService tests...");
		context = await createTestContext();
		testStoreId = context.storeId;

		databaseService = context.databaseService;
		prisma = databaseService.prisma;
		categoriesService = new CategoriesService(databaseService);
		
		console.log("Test setup complete. Store ID:", testStoreId);
	});

	afterAll(async () => {
		console.log("Cleaning up...");
		await context.close();
	});

	beforeEach(async () => {
		await prisma.category.deleteMany();
		console.log("Database cleaned for test");
	});

	describe("createCategory - Success Scenarios", () => {
		it("should create a category successfully", async () => {
			console.log("Running: should create a category successfully");
			const categoryName = generateTestId("Electronics");

			const result = await categoriesService.createCategory(
				{ name: categoryName },
				testStoreId,
			);

			console.log("Result:", result);
			expect(result.success).toBe(true);
			expect(result.message).toContain(categoryName);

			// Verify category was created
			const category = await prisma.category.findFirst({
				where: { name: categoryName },
			});
			expect(category).toBeDefined();
			expect(category?.storeId).toBe(testStoreId);
		});

		it("should create multiple categories", async () => {
			const categories = [
				generateTestId("Electronics"),
				generateTestId("Clothing"),
				generateTestId("Books"),
			];

			for (const name of categories) {
				await categoriesService.createCategory({ name }, testStoreId);
			}

			const allCategories = await prisma.category.findMany({
				where: { storeId: testStoreId },
			});

			expect(allCategories).toHaveLength(3);
		});
	});

	describe("createCategory - Error Scenarios", () => {
		it("should throw ConflictException if category with same name exists", async () => {
			const categoryName = generateTestId("Duplicate Category");

			// Create first category
			await categoriesService.createCategory({ name: categoryName }, testStoreId);

			// Try to create duplicate
			await expect(
				categoriesService.createCategory({ name: categoryName }, testStoreId),
			).rejects.toThrow("already exists");
		});
	});

	describe("getCategories", () => {
		beforeEach(async () => {
			await categoriesService.createCategory(
				{ name: generateTestId("Category 1") },
				testStoreId,
			);
			await categoriesService.createCategory(
				{ name: generateTestId("Category 2") },
				testStoreId,
			);
		});

		it("should return all categories for store", async () => {
			const result = await categoriesService.getCategories(testStoreId);

			expect(result.success).toBe(true);
			expect(result.data).toBeDefined();
			expect(result.data.length).toBeGreaterThanOrEqual(2);
		});
	});

	describe("deleteCategory", () => {
		let categoryId: string;

		beforeEach(async () => {
			const categoryName = generateTestId("Category to Delete");
			await categoriesService.createCategory({ name: categoryName }, testStoreId);
			const category = await prisma.category.findFirst({
				where: { name: categoryName },
			});
			categoryId = category?.id || "";
		});

		it("should delete category successfully", async () => {
			const result = await categoriesService.deleteCategory(
				categoryId,
				testStoreId,
			);

			expect(result.success).toBe(true);
			expect(result.message).toBe("Deleted successfully!");

			const deletedCategory = await prisma.category.findUnique({
				where: { id: categoryId },
			});
			expect(deletedCategory).toBeNull();
		});
	});

	describe("updateCategory", () => {
		let categoryId: string;

		beforeEach(async () => {
			const categoryName = generateTestId("Category to Update");
			await categoriesService.createCategory({ name: categoryName }, testStoreId);
			const category = await prisma.category.findFirst({
				where: { name: categoryName },
			});
			categoryId = category?.id || "";
		});

		it("should update category name successfully", async () => {
			const newName = generateTestId("Updated Category");

			const result = await categoriesService.updateCategory(
				categoryId,
				testStoreId,
				{ name: newName },
			);

			expect(result.success).toBe(true);
			expect(result.message).toBe("Category Updated");

			const updatedCategory = await prisma.category.findUnique({
				where: { id: categoryId },
			});
			expect(updatedCategory?.name).toBe(newName);
		});
	});
});

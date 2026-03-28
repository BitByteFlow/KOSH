import {
	TestContext,
	createTestContext,
	generateTestId,
} from "test/test-utils";
import { PrismaClient } from "@kosh/db";
import { ProductService } from "./product.service";
import { DatabaseService } from "../../database/database.service";

describe("ProductService Integration Tests", () => {
	let context: TestContext & { userId: string; token: string; storeId: string };
	let productService: ProductService;
	let databaseService: DatabaseService;
	let prisma: PrismaClient;

	let testUserId: string;
	let testStoreId: string;
	let testCategoryId: string;

	beforeAll(async () => {
		// Create test context with isolated PostgreSQL container
		context = await createTestContext();
		testUserId = context.userId;
		testStoreId = context.storeId;

		databaseService = context.databaseService;
		prisma = databaseService.prisma;
		productService = new ProductService(databaseService);

		// Setup test category
		const category = await prisma.category.create({
			data: {
				name: generateTestId("Electronics"),
				storeId: testStoreId,
			},
		});
		testCategoryId = category.id;
	});

	afterAll(async () => {
		await context.close();
	});

	beforeEach(async () => {
		// Clean up before each test
		await prisma.saleItem.deleteMany();
		await prisma.sale.deleteMany();
		await prisma.purchaseItem.deleteMany();
		// await prisma.storeJoinRequest.deleteMany();
		await prisma.purchase.deleteMany();
		await prisma.variantAttribute.deleteMany();
		await prisma.productVariant.deleteMany();
		await prisma.product.deleteMany();
		await prisma.accountTransaction.deleteMany();
		await prisma.dailyBalance.deleteMany();
		await prisma.notification.deleteMany();
	});

	describe("createProduct - Success Scenarios", () => {
		it("should create a product with variants successfully", async () => {
			const createProductDto = {
				name: generateTestId("iPhone 15"),
				categoryId: testCategoryId,
				variants: [
					{
						costPrice: 800,
						sellingPrice: 1200,
						stock: 50,
						attributes: [{ name: "Color", value: "Titanium" }],
					},
				],
				keepPurchaseRecord: false,
			};

			const result = await productService.createProduct(
				testUserId,
				testStoreId,
				createProductDto,
			);

			expect(result.success).toBe(true);
			expect(result.message).toBe("Product Created!");
			expect(result.data!).toHaveLength(1);

			const product = result.data![0];
			expect(product.productName).toBe(createProductDto.name);
			expect(product.category.id).toBe(testCategoryId);
			expect(product.variants).toHaveLength(1);

			const variant = product.variants[0];
			expect(variant.price).toBe(1200);
			expect(variant.costPrice).toBe(800);
			expect(variant.stock).toBe(50);
			expect(variant.attributes).toHaveLength(1);
			expect(variant.attributes[0].name).toBe("Color");
			expect(variant.attributes[0].value).toBe("Titanium");
		});

		it("should create product with multiple variants", async () => {
			const createProductDto = {
				name: generateTestId("Samsung Galaxy"),
				categoryId: testCategoryId,
				variants: [
					{
						costPrice: 600,
						sellingPrice: 900,
						stock: 30,
						attributes: [{ name: "Color", value: "Black" }],
					},
					{
						costPrice: 700,
						sellingPrice: 1000,
						stock: 20,
						attributes: [{ name: "Color", value: "White" }],
					},
				],
				keepPurchaseRecord: false,
			};

			const result = await productService.createProduct(
				testUserId,
				testStoreId,
				createProductDto,
			);

			expect(result.success).toBe(true);
			expect(result.data![0].variants).toHaveLength(2);
			expect(result.data![0].totalStock).toBe(50); // 30 + 20
		});

		it("should create product with SKU and barcode", async () => {
			const createProductDto = {
				name: generateTestId("Test Product"),
				categoryId: testCategoryId,
				variants: [
					{
						costPrice: 100,
						sellingPrice: 150,
						stock: 10,
						attributes: [],
					},
				],
				keepPurchaseRecord: false,
			};

			const result = await productService.createProduct(
				testUserId,
				testStoreId,
				createProductDto,
			);

			expect(result.success).toBe(true);
			expect(result.data![0].variants[0].sku).toBeDefined();
			expect(result.data![0].variants[0].barcode).toBeDefined();
			expect(result.data![0].variants[0].sku).toMatch(/^[A-Z]{3}-[A-Z0-9]{4}-\d{6}$/);
		});

		it("should create purchase record when keepPurchaseRecord is true", async () => {
			const createProductDto = {
				name: generateTestId("Product with Stock"),
				categoryId: testCategoryId,
				variants: [
					{
						costPrice: 100,
						sellingPrice: 150,
						stock: 50,
						attributes: [],
					},
				],
				keepPurchaseRecord: true,
				supplierName: "Test Supplier",
			};

			const result = await productService.createProduct(
				testUserId,
				testStoreId,
				createProductDto,
			);

			expect(result.success).toBe(true);

			// Verify purchase was created
			const purchase = await prisma.purchase.findFirst({
				where: { supplierName: "Test Supplier" },
				include: { items: true },
			});

			expect(purchase).toBeDefined();
			expect(Number(purchase?.total)).toBe(5000); // 100 * 50
			expect(purchase?.status).toBe("PAID");
			expect(purchase?.items).toHaveLength(1);
			expect(purchase?.items[0].quantity).toBe(50);

			// Verify daily balance was updated
			const todayStr = new Date().toISOString().split("T")[0];
			const dailyBalance = await prisma.dailyBalance.findUnique({
				where: { storeId_date: { storeId: testStoreId, date: todayStr } },
			});

			expect(dailyBalance).toBeDefined();
			expect(Number(dailyBalance?.closingCash)).toBe(-5000);
			expect(Number(dailyBalance?.totalExpense)).toBe(5000);
		});

		it("should reactivate a deleted product with same name", async () => {
			// Create and delete a product first
			const deletedProduct = await prisma.product.create({
				data: {
					name: generateTestId("Old Product"),
					categoryId: testCategoryId,
					storeId: testStoreId,
					deletedAt: new Date(),
				},
			});

			const createProductDto = {
				name: deletedProduct.name,
				categoryId: testCategoryId,
				variants: [
					{
						costPrice: 100,
						sellingPrice: 150,
						stock: 10,
						attributes: [],
					},
				],
				keepPurchaseRecord: false,
			};

			const result = await productService.createProduct(
				testUserId,
				testStoreId,
				createProductDto,
			);

			expect(result.success).toBe(true);
			expect(result.message).toContain("Reactivated");

			// Verify product was reactivated
			const reactivatedProduct = await prisma.product.findUnique({
				where: { id: deletedProduct.id },
			});
			expect(reactivatedProduct?.deletedAt).toBeNull();
		});

		it("should create product without attributes", async () => {
			const createProductDto = {
				name: generateTestId("Simple Product"),
				categoryId: testCategoryId,
				variants: [
					{
						costPrice: 100,
						sellingPrice: 150,
						stock: 10,
					},
				],
				keepPurchaseRecord: false,
			};

			const result = await productService.createProduct(
				testUserId,
				testStoreId,
				createProductDto,
			);

			expect(result.success).toBe(true);
			expect(result.data![0].variants[0].attributes).toHaveLength(0);
		});
	});

	describe("createProduct - Error Scenarios", () => {
		it("should throw ConflictException if category doesn't exist", async () => {
			const createProductDto = {
				name: generateTestId("Test Product"),
				categoryId: "non-existent-category",
				variants: [
					{
						costPrice: 100,
						sellingPrice: 150,
						stock: 10,
						attributes: [],
					},
				],
				keepPurchaseRecord: false,
			};

			await expect(
				productService.createProduct(testUserId, testStoreId, createProductDto),
			).rejects.toThrow("Category doesn't exist");
		});

		it("should throw ConflictException if active product with same name exists", async () => {
			const productName = generateTestId("Duplicate Product");

			// Create first product
			await productService.createProduct(testUserId, testStoreId, {
				name: productName,
				categoryId: testCategoryId,
				variants: [
					{
						costPrice: 100,
						sellingPrice: 150,
						stock: 10,
						attributes: [],
					},
				],
				keepPurchaseRecord: false,
			});

			// Try to create duplicate
			const duplicateDto = {
				name: productName,
				categoryId: testCategoryId,
				variants: [
					{
						costPrice: 100,
						sellingPrice: 150,
						stock: 10,
						attributes: [],
					},
				],
				keepPurchaseRecord: false,
			};

			await expect(
				productService.createProduct(testUserId, testStoreId, duplicateDto),
			).rejects.toThrow("Product already exists");
		});

		it("should throw ConflictException if product exists in different category", async () => {
			// Create another category
			const category2 = await prisma.category.create({
				data: {
					name: generateTestId("Category 2"),
					storeId: testStoreId,
				},
			});

			const productName = generateTestId("Cross Category Product");

			// Create product in first category
			await productService.createProduct(testUserId, testStoreId, {
				name: productName,
				categoryId: testCategoryId,
				variants: [
					{
						costPrice: 100,
						sellingPrice: 150,
						stock: 10,
						attributes: [],
					},
				],
				keepPurchaseRecord: false,
			});

			// Try to create in second category
			const duplicateDto = {
				name: productName,
				categoryId: category2.id,
				variants: [
					{
						costPrice: 100,
						sellingPrice: 150,
						stock: 10,
						attributes: [],
					},
				],
				keepPurchaseRecord: false,
			};

			await expect(
				productService.createProduct(testUserId, testStoreId, duplicateDto),
			).rejects.toThrow("Product already exists");
		});
	});

	describe("deleteProduct", () => {
		let productId: string;

		beforeEach(async () => {
			const result = await productService.createProduct(testUserId, testStoreId, {
				name: generateTestId("Product to Delete"),
				categoryId: testCategoryId,
				variants: [
					{
						costPrice: 100,
						sellingPrice: 150,
						stock: 10,
						attributes: [],
					},
				],
				keepPurchaseRecord: false,
			});
			productId = result.data[0].id;
		});

		it("should soft delete product successfully", async () => {
			const result = await productService.deleteProduct(productId, testStoreId);

			expect(result.success).toBe(true);
			expect(result.message).toBe("Product Deleted Successfully");

			const deletedProduct = await prisma.product.findUnique({
				where: { id: productId },
			});
			expect(deletedProduct?.deletedAt).toBeDefined();
		});

		it("should soft delete all variants when product is deleted", async () => {
			const product = await prisma.product.findUnique({
				where: { id: productId },
				include: { variants: true },
			});

			const variantIds = product?.variants.map((v) => v.id) || [];

			await productService.deleteProduct(productId, testStoreId);

			// Check all variants are soft deleted
			for (const variantId of variantIds) {
				const variant = await prisma.productVariant.findUnique({
					where: { id: variantId },
				});
				expect(variant?.deletedAt).toBeDefined();
				expect(variant?.status).toBe("IN_ACTIVE");
			}
		});

		it("should throw NotFoundException if product doesn't exist", async () => {
			await expect(
				productService.deleteProduct("non-existent-id", testStoreId),
			).rejects.toThrow("Product Not found for this user");
		});

		it("should throw NotFoundException if product belongs to different store", async () => {
			// Create product in different store
			const otherStore = await prisma.store.create({
				data: {
					name: generateTestId("Other Store"),
					creatorId: testUserId,
				},
			});

			const otherProduct = await prisma.product.create({
				data: {
					name: generateTestId("Other Product"),
					categoryId: testCategoryId,
					storeId: otherStore.id,
				},
			});

			await expect(
				productService.deleteProduct(otherProduct.id, testStoreId),
			).rejects.toThrow("Product Not found for this user");
		});
	});

	describe("updateProduct", () => {
		let productId: string;

		beforeEach(async () => {
			const result = await productService.createProduct(testUserId, testStoreId, {
				name: generateTestId("Product to Update"),
				categoryId: testCategoryId,
				variants: [
					{
						costPrice: 100,
						sellingPrice: 150,
						stock: 10,
						attributes: [{ name: "Color", value: "Red" }],
					},
				],
				keepPurchaseRecord: false,
			});
			productId = result.data[0].id;
		});

		it("should update product name successfully", async () => {
			const newName = generateTestId("Updated Product Name");

			const result = await productService.updateProduct(productId, testStoreId, {
				name: newName,
			});

			expect(result.success).toBe(true);
			expect(result.data[0].productName).toBe(newName);

			const updatedProduct = await prisma.product.findUnique({
				where: { id: productId },
			});
			expect(updatedProduct?.name).toBe(newName);
		});

		it("should update product category successfully", async () => {
			const newCategory = await prisma.category.create({
				data: {
					name: generateTestId("New Category"),
					storeId: testStoreId,
				},
			});

			const result = await productService.updateProduct(productId, testStoreId, {
				categoryId: newCategory.id,
			});

			expect(result.success).toBe(true);
			expect(result.data[0].category.id).toBe(newCategory.id);
		});

		it("should update variant prices and stock", async () => {
			const product = await prisma.product.findUnique({
				where: { id: productId },
				include: { variants: true },
			});

			const variantId = product?.variants[0].id || "";

			const result = await productService.updateProduct(productId, testStoreId, {
				variants: [
					{
						id: variantId,
						costPrice: 120,
						sellingPrice: 180,
						stock: 25,
						attributes: [{ name: "Color", value: "Blue" }],
					},
				],
			});

			expect(result.success).toBe(true);
			expect(result.data[0].variants[0].costPrice).toBe(120);
			expect(result.data[0].variants[0].sellingPrice).toBe(180);
			expect(result.data[0].variants[0].stock).toBe(25);
			expect(result.data[0].variants[0].attributes[0].value).toBe("Blue");
		});

		it("should add new variant to existing product", async () => {
			const product = await prisma.product.findUnique({
				where: { id: productId },
				include: { variants: true },
			});
			const existingVariantId = product?.variants[0].id;

			const result = await productService.updateProduct(productId, testStoreId, {
				variants: [
					{
						id: existingVariantId,
						costPrice: 100,
						sellingPrice: 150,
						stock: 10,
						attributes: [{ name: "Color", value: "Red" }],
					},
					{
						costPrice: 200,
						sellingPrice: 300,
						stock: 15,
						attributes: [{ name: "Size", value: "Large" }],
					},
				],
			});

			expect(result.success).toBe(true);
			expect(result.data[0].variants).toHaveLength(2);
			expect(result.data[0].totalStock).toBe(25); // 10 + 15
		});

		it("should remove variant from product", async () => {
			// Add a second variant first
			const productBefore = await prisma.product.findUnique({
				where: { id: productId },
				include: { variants: true },
			});
			const variant1Id = productBefore?.variants[0].id;

			await productService.updateProduct(productId, testStoreId, {
				variants: [
					{
						id: variant1Id,
						costPrice: 100,
						sellingPrice: 150,
						stock: 10,
						attributes: [],
					},
					{
						costPrice: 200,
						sellingPrice: 300,
						stock: 15,
						attributes: [],
					},
				],
			});

			const product = await prisma.product.findUnique({
				where: { id: productId },
				include: { variants: true },
			});

			// Keep only the first variant
			const firstVariantId = product?.variants[0].id || "";

			const result = await productService.updateProduct(productId, testStoreId, {
				variants: [
					{
						id: firstVariantId,
						costPrice: 100,
						sellingPrice: 150,
						stock: 10,
						attributes: [],
					},
				],
			});

			expect(result.success).toBe(true);
			// Should have 1 active variant (the second is soft deleted)
			expect(result.data[0].variants).toHaveLength(1);
		});

		it("should throw NotFoundException if product doesn't exist", async () => {
			await expect(
				productService.updateProduct("non-existent-id", testStoreId, {
					name: "New Name",
				}),
			).rejects.toThrow("Product not found");
		});

		it("should throw NotFoundException if category doesn't exist", async () => {
			await expect(
				productService.updateProduct(productId, testStoreId, {
					categoryId: "non-existent-category",
				}),
			).rejects.toThrow("Category not found");
		});

		it("should throw ConflictException if new name conflicts with existing product", async () => {
			const existingName = generateTestId("Product 1");
			await productService.createProduct(testUserId, testStoreId, {
				name: existingName,
				categoryId: testCategoryId,
				variants: [
					{
						costPrice: 100,
						sellingPrice: 150,
						stock: 10,
						attributes: [],
					},
				],
				keepPurchaseRecord: false,
			});

			await expect(
				productService.updateProduct(productId, testStoreId, {
					name: existingName,
				}),
			).rejects.toThrow("already exists");
		});
	});

	describe("addVariant", () => {
		let productId: string;

		beforeEach(async () => {
			const result = await productService.createProduct(testUserId, testStoreId, {
				name: generateTestId("Product"),
				categoryId: testCategoryId,
				variants: [
					{
						costPrice: 100,
						sellingPrice: 150,
						stock: 10,
						attributes: [],
					},
				],
				keepPurchaseRecord: false,
			});
			productId = result.data[0].id;
		});

		it("should add variant to product successfully", async () => {
			const result = await productService.addVariant(
				{
					costPrice: 200,
					sellingPrice: 300,
					stock: 20,
					attributes: [{ name: "Size", value: "XL" }],
				},
				productId,
				testStoreId,
			);

			expect(result.success).toBe(true);
			expect(result.message).toBe("Variant added successfully");
			expect(result.data[0].variants).toHaveLength(2);
			expect(result.data[0].totalStock).toBe(30); // 10 + 20
		});

		it("should generate unique SKU for new variant", async () => {
			const result = await productService.addVariant(
				{
					costPrice: 100,
					sellingPrice: 150,
					stock: 10,
					attributes: [],
				},
				productId,
				testStoreId,
			);

			const newVariant = result.data[0].variants.find(
				(v) => v.costPrice === 100 && v.sellingPrice === 150 && v.stock === 10,
			);
			const oldVariant = result.data[0].variants.find(
				(v) => v.costPrice === 200 && v.sellingPrice === 300 && v.stock === 20,
			);

			expect(newVariant?.sku).toBeDefined();
			expect(newVariant?.sku).not.toBe(oldVariant?.sku);
		});

		it("should generate unique barcode for new variant", async () => {
			const result = await productService.addVariant(
				{
					costPrice: 100,
					sellingPrice: 150,
					stock: 10,
					attributes: [],
				},
				productId,
				testStoreId,
			);

			const newVariant = result.data[0].variants.find(
				(v) => v.stock === 10 && v.price === 150,
			);
			expect(newVariant?.barcode).toBeDefined();
		});

		it("should throw NotFoundException if product doesn't exist", async () => {
			await expect(
				productService.addVariant(
					{
						costPrice: 100,
						sellingPrice: 150,
						stock: 10,
						attributes: [],
					},
					"non-existent-id",
					testStoreId,
				),
			).rejects.toThrow("Product not found");
		});
	});

	describe("listProductsWithVariant", () => {
		beforeEach(async () => {
			// Create multiple products
			await productService.createProduct(testUserId, testStoreId, {
				name: generateTestId("Product 1"),
				categoryId: testCategoryId,
				variants: [
					{
						costPrice: 100,
						sellingPrice: 150,
						stock: 10,
						attributes: [],
					},
				],
				keepPurchaseRecord: false,
			});

			await productService.createProduct(testUserId, testStoreId, {
				name: generateTestId("Product 2"),
				categoryId: testCategoryId,
				variants: [
					{
						costPrice: 200,
						sellingPrice: 300,
						stock: 20,
						attributes: [],
					},
				],
				keepPurchaseRecord: false,
			});
		});

		it("should return all active products with variants", async () => {
			const result = await productService.listProductsWithVariant(testStoreId);

			expect(result.success).toBe(true);
			expect(result.message).toBe("Product Returned Successfully");
			expect(result.data.length).toBeGreaterThanOrEqual(2);
		});

		it("should exclude deleted products", async () => {
			const products = await productService.listProductsWithVariant(testStoreId);
			const productId = products.data[0].id;

			await productService.deleteProduct(productId, testStoreId);

			const result = await productService.listProductsWithVariant(testStoreId);

			// Deleted product should not be in the list
			const deletedProduct = result.data.find((p) => p.id === productId);
			expect(deletedProduct).toBeUndefined();
		});

		it("should include variant attributes", async () => {
			const productName = generateTestId("Attributes Product");
			await productService.createProduct(testUserId, testStoreId, {
				name: productName,
				categoryId: testCategoryId,
				variants: [
					{
						costPrice: 100,
						sellingPrice: 150,
						stock: 10,
						attributes: [
							{ name: "Color", value: "Red" },
							{ name: "Size", value: "M" },
						],
					},
				],
				keepPurchaseRecord: false,
			});

			const result = await productService.listProductsWithVariant(testStoreId);

			const productWithAttrs = result.data.find(
				(p) => p.productName === productName,
			);
			expect(productWithAttrs).toBeDefined();
			expect(productWithAttrs?.variants[0].attributes).toHaveLength(2);
		});

		it("should calculate total stock correctly", async () => {
			const result = await productService.createProduct(
				testUserId,
				testStoreId,
				{
					name: generateTestId("Multi Variant Product"),
					categoryId: testCategoryId,
					variants: [
						{ costPrice: 100, sellingPrice: 150, stock: 10, attributes: [] },
						{ costPrice: 200, sellingPrice: 300, stock: 20, attributes: [] },
						{ costPrice: 300, sellingPrice: 450, stock: 30, attributes: [] },
					],
					keepPurchaseRecord: false,
				},
			);

			expect(result.data[0].totalStock).toBe(60);
		});
	});

	describe("updateProductVariant", () => {
		let productId: string;
		let variantId: string;

		beforeEach(async () => {
			const result = await productService.createProduct(testUserId, testStoreId, {
				name: generateTestId("Product"),
				categoryId: testCategoryId,
				variants: [
					{
						costPrice: 100,
						sellingPrice: 150,
						stock: 10,
						attributes: [{ name: "Color", value: "Red" }],
					},
				],
				keepPurchaseRecord: false,
			});
			productId = result.data[0].id;
			variantId = result.data[0].variants[0].id;
		});

		it("should update variant successfully", async () => {
			const result = await productService.updateProductVariant(
				{
					productId,
					costPrice: 120,
					sellingPrice: 180,
					stock: 25,
					status: "ACTIVE",
					attributes: [{ name: "Color", value: "Blue" }],
				},
				testStoreId,
				variantId,
			);

			expect(result.success).toBe(true);
			expect(result.data[0].variants[0].costPrice).toBe(120);
			expect(result.data[0].variants[0].sellingPrice).toBe(180);
			expect(result.data[0].variants[0].stock).toBe(25);
			expect(result.data[0].variants[0].attributes[0].value).toBe("Blue");
		});

		it("should update variant status", async () => {
			const result = await productService.updateProductVariant(
				{
					productId,
					costPrice: 100,
					sellingPrice: 150,
					stock: 10,
					status: "IN_ACTIVE",
					attributes: [],
				},
				testStoreId,
				variantId,
			);

			expect(result.success).toBe(true);
			expect(result.data[0].variants[0].status).toBe("IN_ACTIVE");
		});

		it("should throw NotFoundException if variant doesn't exist", async () => {
			await expect(
				productService.updateProductVariant(
					{
						productId,
						costPrice: 100,
						sellingPrice: 150,
						stock: 10,
						status: "ACTIVE",
						attributes: [],
					},
					testStoreId,
					"non-existent-variant",
				),
			).rejects.toThrow("Variant not found or access denied");
		});

		it("should throw NotFoundException if variant belongs to different product", async () => {
			// Create another product
			const otherProduct = await productService.createProduct(
				testUserId,
				testStoreId,
				{
					name: generateTestId("Other Product"),
					categoryId: testCategoryId,
					variants: [
						{
							costPrice: 100,
							sellingPrice: 150,
							stock: 10,
							attributes: [],
						},
					],
					keepPurchaseRecord: false,
				},
			);

			await expect(
				productService.updateProductVariant(
					{
						productId: otherProduct.data[0].id,
						costPrice: 100,
						sellingPrice: 150,
						stock: 10,
						status: "ACTIVE",
						attributes: [],
					},
					testStoreId,
					variantId,
				),
			).rejects.toThrow("Variant not found or access denied");
		});
	});

	describe("deleteProductVariant", () => {
		let productId: string;
		let variantId: string;

		beforeEach(async () => {
			const result = await productService.createProduct(testUserId, testStoreId, {
				name: generateTestId("Product"),
				categoryId: testCategoryId,
				variants: [
					{
						costPrice: 100,
						sellingPrice: 150,
						stock: 10,
						attributes: [],
					},
				],
				keepPurchaseRecord: false,
			});
			productId = result.data[0].id;
			variantId = result.data[0].variants[0].id;
		});

		it("should soft delete variant successfully", async () => {
			const result = await productService.deleteProductVariant(
				productId,
				testStoreId,
				variantId,
			);

			expect(result.success).toBe(true);
			expect(result.message).toBe("Variant deleted successfully");

			const deletedVariant = await prisma.productVariant.findUnique({
				where: { id: variantId },
			});
			expect(deletedVariant?.deletedAt).toBeDefined();
			expect(deletedVariant?.status).toBe("IN_ACTIVE");
		});

		it("should update product total stock after variant deletion", async () => {
			// Add another variant
			await productService.addVariant(
				{
					costPrice: 200,
					sellingPrice: 300,
					stock: 20,
					attributes: [],
				},
				productId,
				testStoreId,
			);

			const result = await productService.deleteProductVariant(
				productId,
				testStoreId,
				variantId,
			);

			expect(result.success).toBe(true);
			expect(result.data[0].totalStock).toBe(20); // Only second variant's stock
		});

		it("should throw NotFoundException if product doesn't exist", async () => {
			await expect(
				productService.deleteProductVariant(
					"non-existent-id",
					testStoreId,
					variantId,
				),
			).rejects.toThrow("Product not found");
		});
	});

	describe("listProductsWithFilters", () => {
		beforeEach(async () => {
			// Create products with different attributes
			await productService.createProduct(testUserId, testStoreId, {
				name: generateTestId("Cheap Product"),
				categoryId: testCategoryId,
				variants: [
					{
						costPrice: 50,
						sellingPrice: 80,
						stock: 100,
						attributes: [],
					},
				],
				keepPurchaseRecord: false,
			});

			await productService.createProduct(testUserId, testStoreId, {
				name: generateTestId("Expensive Product"),
				categoryId: testCategoryId,
				variants: [
					{
						costPrice: 500,
						sellingPrice: 800,
						stock: 5,
						attributes: [],
					},
				],
				keepPurchaseRecord: false,
			});
		});

		it("should filter products by search term", async () => {
			const result = await productService.listProductsWithFilters(testStoreId, {
				search: "Cheap",
				page: 1,
				limit: 10,
			});

			expect(result.success).toBe(true);
			expect(result.data).toHaveLength(1);
			expect(result.data[0].productName).toContain("Cheap Product");
		});

		it("should filter products by category", async () => {
			const result = await productService.listProductsWithFilters(testStoreId, {
				categoryId: testCategoryId,
				page: 1,
				limit: 10,
			});

			expect(result.success).toBe(true);
			expect(result.data.length).toBeGreaterThanOrEqual(2);
		});

		it("should filter products by low stock", async () => {
			const result = await productService.listProductsWithFilters(testStoreId, {
				lowStock: 10,
				page: 1,
				limit: 10,
			});

			expect(result.success).toBe(true);
			// Should return products with variants having stock < 10
			expect(result.data.length).toBeGreaterThanOrEqual(1);
		});

		it("should filter products by price range", async () => {
			const result = await productService.listProductsWithFilters(testStoreId, {
				minPrice: 100,
				maxPrice: 500,
				page: 1,
				limit: 10,
			});

			expect(result.success).toBe(true);
			// Should filter based on selling price
		});

		it("should return paginated results", async () => {
			// Create more products
			for (let i = 0; i < 15; i++) {
				await productService.createProduct(testUserId, testStoreId, {
					name: generateTestId(`Product ${i}`),
					categoryId: testCategoryId,
					variants: [
						{
							costPrice: 100,
							sellingPrice: 150,
							stock: 10,
							attributes: [],
						},
					],
					keepPurchaseRecord: false,
				});
			}

			const result = await productService.listProductsWithFilters(testStoreId, {
				page: 1,
				limit: 10,
			});

			expect(result.success).toBe(true);
			expect(result.data).toHaveLength(10);
			expect(result.meta?.total).toBeGreaterThanOrEqual(17);
			expect(result.meta?.page).toBe(1);
			expect(result.meta?.limit).toBe(10);
			expect(result.meta?.hasNext).toBe(true);
			expect(result.meta?.hasPrev).toBe(false);
		});

		it("should return second page of results", async () => {
			// Create more products
			for (let i = 0; i < 15; i++) {
				await productService.createProduct(testUserId, testStoreId, {
					name: generateTestId(`Product ${i}`),
					categoryId: testCategoryId,
					variants: [
						{
							costPrice: 100,
							sellingPrice: 150,
							stock: 10,
							attributes: [],
						},
					],
					keepPurchaseRecord: false,
				});
			}

			const result = await productService.listProductsWithFilters(testStoreId, {
				page: 2,
				limit: 10,
			});

			expect(result.success).toBe(true);
			expect(result.meta?.hasPrev).toBe(true);
		});

		it("should exclude deleted products by default", async () => {
			const products = await productService.listProductsWithVariant(testStoreId);
			const productId = products.data[0].id;

			await productService.deleteProduct(productId, testStoreId);

			const result = await productService.listProductsWithFilters(testStoreId, {
				page: 1,
				limit: 10,
			});

			const deletedProduct = result.data.find((p) => p.id === productId);
			expect(deletedProduct).toBeUndefined();
		});

		it("should include deleted products when requested", async () => {
			const products = await productService.listProductsWithVariant(testStoreId);
			const productId = products.data[0].id;

			await productService.deleteProduct(productId, testStoreId);

			const result = await productService.listProductsWithFilters(testStoreId, {
				page: 1,
				limit: 10,
				includeDeleted: true,
			});

			// Deleted product should be included
			const deletedProduct = result.data.find((p) => p.id === productId);
			expect(deletedProduct).toBeDefined();
		});
	});

	describe("Data Integrity Tests", () => {
		it("should maintain unique SKU across variants", async () => {
			const product1 = await productService.createProduct(
				testUserId,
				testStoreId,
				{
					name: generateTestId("Product 1"),
					categoryId: testCategoryId,
					variants: [
						{ costPrice: 100, sellingPrice: 150, stock: 10, attributes: [] },
						{ costPrice: 200, sellingPrice: 300, stock: 20, attributes: [] },
					],
					keepPurchaseRecord: false,
				},
			);

			const product2 = await productService.createProduct(
				testUserId,
				testStoreId,
				{
					name: generateTestId("Product 2"),
					categoryId: testCategoryId,
					variants: [
						{ costPrice: 100, sellingPrice: 150, stock: 10, attributes: [] },
					],
					keepPurchaseRecord: false,
				},
			);

			const skus = [
				...product1.data[0].variants.map((v) => v.sku),
				...product2.data[0].variants.map((v) => v.sku),
			];

			const uniqueSkus = new Set(skus);
			expect(uniqueSkus.size).toBe(skus.length); // All SKUs should be unique
		});

		it("should maintain unique barcode across variants in same store", async () => {
			const product1 = await productService.createProduct(
				testUserId,
				testStoreId,
				{
					name: generateTestId("Product 1"),
					categoryId: testCategoryId,
					variants: [
						{ costPrice: 100, sellingPrice: 150, stock: 10, attributes: [] },
					],
					keepPurchaseRecord: false,
				},
			);

			const product2 = await productService.createProduct(
				testUserId,
				testStoreId,
				{
					name: generateTestId("Product 2"),
					categoryId: testCategoryId,
					variants: [
						{ costPrice: 100, sellingPrice: 150, stock: 10, attributes: [] },
					],
					keepPurchaseRecord: false,
				},
			);

			const barcodes = [
				product1.data[0].variants[0].barcode,
				product2.data[0].variants[0].barcode,
			];

			const uniqueBarcodes = new Set(barcodes);
			expect(uniqueBarcodes.size).toBe(barcodes.length); // All barcodes should be unique
		});

		it("should handle concurrent product creation", async () => {
			const productPromises = Array.from({ length: 5 }).map((_, i) =>
				productService.createProduct(testUserId, testStoreId, {
					name: generateTestId(`Concurrent Product ${i}`),
					categoryId: testCategoryId,
					variants: [
						{ costPrice: 100, sellingPrice: 150, stock: 10, attributes: [] },
					],
					keepPurchaseRecord: false,
				}),
			);

			const results = await Promise.all(productPromises);

			results.forEach((result) => {
				expect(result.success).toBe(true);
			});

			// Verify all products were created
			const allProducts = await productService.listProductsWithVariant(testStoreId);
			expect(allProducts.data.length).toBeGreaterThanOrEqual(5);
		});

		it("should properly link variant attributes", async () => {
			const result = await productService.createProduct(
				testUserId,
				testStoreId,
				{
					name: generateTestId("Product with Attributes"),
					categoryId: testCategoryId,
					variants: [
						{
							costPrice: 100,
							sellingPrice: 150,
							stock: 10,
							attributes: [
								{ name: "Color", value: "Red" },
								{ name: "Size", value: "M" },
							],
						},
					],
					keepPurchaseRecord: false,
				},
			);

			const variantId = result.data[0].variants[0].id;

			const variant = await prisma.productVariant.findUnique({
				where: { id: variantId },
				include: { attributes: true },
			});

			expect(variant?.attributes).toHaveLength(2);
			expect(variant?.attributes.every((a) => a.variantId === variantId)).toBe(true);
		});
	});

	describe("Edge Cases", () => {
		it("should handle product with zero stock", async () => {
			const result = await productService.createProduct(testUserId, testStoreId, {
				name: generateTestId("Out of Stock Product"),
				categoryId: testCategoryId,
				variants: [
					{ costPrice: 100, sellingPrice: 150, stock: 0, attributes: [] },
				],
				keepPurchaseRecord: false,
			});

			expect(result.success).toBe(true);
			expect(result.data[0].status).toBe("out-of-stock");
			expect(result.data[0].totalStock).toBe(0);
		});

		it("should handle product with very large stock", async () => {
			const result = await productService.createProduct(testUserId, testStoreId, {
				name: generateTestId("Bulk Product"),
				categoryId: testCategoryId,
				variants: [
					{ costPrice: 100, sellingPrice: 150, stock: 1000000, attributes: [] },
				],
				keepPurchaseRecord: false,
			});

			expect(result.success).toBe(true);
			expect(result.data[0].totalStock).toBe(1000000);
		});

		it("should handle product with decimal prices", async () => {
			const result = await productService.createProduct(testUserId, testStoreId, {
				name: generateTestId("Decimal Price Product"),
				categoryId: testCategoryId,
				variants: [
					{
						costPrice: 99.99,
						sellingPrice: 149.99,
						stock: 10,
						attributes: [],
					},
				],
				keepPurchaseRecord: false,
			});

			expect(result.success).toBe(true);
			expect(result.data[0].variants[0].costPrice).toBe(99.99);
			expect(result.data[0].variants[0].sellingPrice).toBe(149.99);
		});

		it("should handle product with special characters in name", async () => {
			const result = await productService.createProduct(testUserId, testStoreId, {
				name: generateTestId("Product™ ® © Special!@#$%"),
				categoryId: testCategoryId,
				variants: [
					{ costPrice: 100, sellingPrice: 150, stock: 10, attributes: [] },
				],
				keepPurchaseRecord: false,
			});

			expect(result.success).toBe(true);
			expect(result.data[0].productName).toContain("Special");
		});

		it("should handle variant with many attributes", async () => {
			const result = await productService.createProduct(testUserId, testStoreId, {
				name: generateTestId("Complex Product"),
				categoryId: testCategoryId,
				variants: [
					{
						costPrice: 100,
						sellingPrice: 150,
						stock: 10,
						attributes: [
							{ name: "Color", value: "Red" },
							{ name: "Size", value: "M" },
							{ name: "Material", value: "Cotton" },
							{ name: "Pattern", value: "Striped" },
							{ name: "Fit", value: "Regular" },
						],
					},
				],
				keepPurchaseRecord: false,
			});

			expect(result.success).toBe(true);
			expect(result.data[0].variants[0].attributes).toHaveLength(5);
		});
	});
});

import { Test, TestingModule } from '@nestjs/testing';
import {
	ConflictException,
	NotFoundException,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { DatabaseService } from '../../database/database.service';

describe('ProductService', () => {
	let productService: ProductService;
	let databaseService: DatabaseService;

	const userId = "user-prod-test-123"
	const categoryId = "cat-prod-test-123"

	beforeAll(async () => {

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ProductService,
				DatabaseService,
			],
		}).compile();

		productService = module.get<ProductService>(ProductService);
		databaseService = module.get<DatabaseService>(DatabaseService);


		await databaseService.prisma.$connect();
	});

	afterAll(async () => {
		await databaseService.prisma.product.deleteMany({ where: { userId } });
		await databaseService.prisma.category.deleteMany({ where: { id: categoryId } });
		await databaseService.prisma.user.deleteMany({ where: { id: userId } });
		await databaseService.prisma.$disconnect();
	});

	beforeEach(async () => {
		await databaseService.prisma.productVariant.deleteMany();
		await databaseService.prisma.product.deleteMany();

		await databaseService.prisma.user.upsert({
			where: { id: userId },
			update: {},
			create: { id: userId, email: 'test@example.com', username: 'tester' },
		});

		await databaseService.prisma.category.upsert({
			where: { id: categoryId },
			update: {},
			create: { id: categoryId, name: 'Electronics', userId },
		});
	});

	const validProductDto = {
		name: 'iPhone 15',
		categoryId: categoryId,
		variants: [
			{
				costPrice: 800,
				sellingPrice: 1200,
				stock: 50,
				attributes: [{ name: 'Color', value: 'Titanium' }],
			},
		],
		keepPurchaseRecord: false,
	};

	describe('createProduct', () => {
		it('should create product successfully', async () => {
			const result = await productService.createProduct(userId, validProductDto);

			expect(result.success).toBe(true);

			const product = await databaseService.prisma.product.findFirst({
				where: {
					name: validProductDto.name,
					userId,
				},
				include: {
					variants: true,
				}
			})

			expect(product).not.toBeNull();
			expect(product).toBeDefined()
			expect(product?.variants).toHaveLength(1);
			expect(Number(product?.variants[0].sellingPrice)).toBe(1200)
			expect(Number(product?.variants[0].costPrice)).toBe(800)
			expect(Number(product?.variants[0].stock)).toBe(50)
		});

		it('should throw ConflictException if category does not exist', async () => {
			const invalidDto = { ...validProductDto, categoryId: "non-existent" }
			await expect(
				productService.createProduct(userId, invalidDto),
			).rejects.toThrow(ConflictException);
		});

		it('should throw ConflictException if active product already exists', async () => {
			await expect(
				productService.createProduct(userId, validProductDto),
			).rejects.toThrow(ConflictException);
		});

		it('should reactivate deleted product if same name exists', async () => {
			const p = await databaseService.prisma.product.create({
				data: { name: 'Old Phone', userId, categoryId, deletedAt: new Date() },
			});

			const result = await productService.createProduct(userId, { ...validProductDto, name: 'Old Phone' });

			expect(result.message).toContain('Reactivated');
			const updated = await databaseService.prisma.product.findUnique({ where: { id: p.id } });
			expect(updated?.deletedAt).toBeNull();
		});

		it('should create purchase record if keepPurchaseRecord is true', async () => {
			const dtoWithPurchase = { ...validProductDto, keepPurchaseRecord: true };
			const result = await productService.createProduct(userId, dtoWithPurchase);
			expect(result.success).toBe(true);
		});
	});

	describe('deleteProduct', () => {
		let productId: string;

		beforeEach(async () => {
			const result = await productService.createProduct(userId, validProductDto);
			//TODO: FIX THIS
			productId = result.data?.[0].id || "";
		});

		it('should soft delete product successfully', async () => {
			const result = await productService.deleteProduct(productId, userId);
			expect(result.success).toBe(true);

			const deletedProduct = await databaseService.prisma.product.findUnique({
				where: { id: productId },
			});
			expect(deletedProduct?.deletedAt).not.toBeNull();
		});

		// it('should soft delete variants when product is deleted', async () => {
		// 	await productService.deleteProduct(productId, userId);
		// });

		it('should throw NotFoundException if product does not exist', async () => {
			await expect(
				productService.deleteProduct(productId, userId),
			).rejects.toThrow(NotFoundException);
		});

		it('should throw NotFoundException if product belongs to different user', async () => {
			const p = await databaseService.prisma.product.create({
				data: { name: 'Not Mine', userId: 'different-user', categoryId },
			});

			await expect(productService.deleteProduct(p.id, userId)).rejects.toThrow(NotFoundException);
		});

	});

	// describe('listProductsWithVariant', () => {
	// 	const userId = 'user-123';

	// 	it('should return all active products with variants', async () => {
	// 		const result = await productService.listProductsWithVariant(userId);

	// 		expect(result.success).toBe(true);
	// 		expect(result.data).toHaveLength(1);
	// 	});

	// 	it('should exclude deleted products', async () => {
	// 		await productService.listProductsWithVariant(userId);
	// 	});
	// });

	// describe('listProductsWithFilters', () => {
	// 	const userId = 'user-123';

	// 	it('should filter products by search term', async () => {
	// 		await productService.listProductsWithFilters(userId, {
	// 			search: 'test',
	// 			page: 1,
	// 			limit: 10,
	// 		});
	// 	});

	// 	it('should filter products by category', async () => {
	// 		await productService.listProductsWithFilters(userId, {
	// 			categoryId: 'cat-123',
	// 			page: 1,
	// 			limit: 10,
	// 		});
	// 	});

	// 	it('should filter low stock products', async () => {
	// 		await productService.listProductsWithFilters(userId, {
	// 			lowStock: 5,
	// 			page: 1,
	// 			limit: 10,
	// 		});
	// 	});

	// 	it('should return paginated results', async () => {
	// 		const result = await productService.listProductsWithFilters(userId, {
	// 			page: 2,
	// 			limit: 10,
	// 		});

	// 		expect(result.meta?.total).toBe(25);
	// 		expect(result.meta?.page).toBe(2);
	// 		expect(result.meta?.limit).toBe(10);
	// 		expect(result.meta?.totalPages).toBe(3);
	// 	});
	// });
});
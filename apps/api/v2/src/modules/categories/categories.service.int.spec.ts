import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { DatabaseService } from '../../database/database.service';

describe('CategoriesService (Integration)', () => {
	let categoriesService: CategoriesService;
	let databaseService: DatabaseService;

	const userId = 'user-cat-int-test';

	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [CategoriesService, DatabaseService],
		}).compile();

		categoriesService = module.get<CategoriesService>(CategoriesService);
		databaseService = module.get<DatabaseService>(DatabaseService);

		await databaseService.prisma.$connect();
	});

	afterAll(async () => {
		await databaseService.prisma.category.deleteMany({ where: { userId } });
		await databaseService.prisma.user.deleteMany({ where: { id: userId } });
		await databaseService.prisma.$disconnect();
	});

	beforeEach(async () => {
		await databaseService.prisma.category.deleteMany({ where: { userId } });

		await databaseService.prisma.user.upsert({
			where: { id: userId },
			update: {},
			create: { id: userId, email: 'cat-test@example.com', username: 'cat_tester' },
		});
	});

	describe('createCategory', () => {
		it('should persist a new category in the database', async () => {
			const catName = 'Hardware';
			await categoriesService.createCategory({ name: catName }, userId);

			const category = await databaseService.prisma.category.findFirst({
				where: { name: catName, userId },
			});

			expect(category).not.toBeNull();
			expect(category?.name).toBe(catName);
		});

		it('should throw ConflictException on duplicate name for same user', async () => {
			const catName = 'Duplicate';
			await databaseService.prisma.category.create({
				data: { name: catName, userId },
			});

			await expect(categoriesService.createCategory({ name: catName }, userId))
				.rejects.toThrow(ConflictException);
		});
	});

	describe('getCategories', () => {
		it('should fetch all categories from the database', async () => {
			await databaseService.prisma.category.createMany({
				data: [
					{ name: 'Cat A', userId },
					{ name: 'Cat B', userId },
				],
			});

			const result = await categoriesService.getCategories(userId);
			expect(result.success).toBe(true);
			expect(result.data).toHaveLength(2);
		});
	});

	describe('updateCategory', () => {
		it('should modify existing category name in DB', async () => {
			const category = await databaseService.prisma.category.create({
				data: { name: 'Old Name', userId },
			});

			await categoriesService.updateCategory(category.id, userId, { name: 'New Name' });

			const updated = await databaseService.prisma.category.findUnique({
				where: { id: category.id },
			});
			expect(updated?.name).toBe('New Name');
		});
	});

	describe('deleteCategory', () => {
		it('should remove category from the database', async () => {
			const category = await databaseService.prisma.category.create({
				data: { name: 'To Delete', userId },
			});

			await categoriesService.deleteCategory(category.id, userId);

			const deleted = await databaseService.prisma.category.findUnique({
				where: { id: category.id },
			});
			expect(deleted).toBeNull();
		});
	});
});

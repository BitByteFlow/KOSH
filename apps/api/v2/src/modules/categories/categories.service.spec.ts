import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, InternalServerErrorException } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { DatabaseService } from '../../database/database.service';

describe('CategoriesService (Unit)', () => {
	let categoriesService: CategoriesService;
	let databaseService: DatabaseService;

	const mockDatabaseService = {
		prisma: {
			category: {
				findFirst: jest.fn(),
				findUnique: jest.fn(),
			},
		},
		category: {
			findUnique: jest.fn(),
			create: jest.fn(),
			findMany: jest.fn(),
			delete: jest.fn(),
			update: jest.fn(),
		},
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CategoriesService,
				{
					provide: DatabaseService,
					useValue: mockDatabaseService,
				},
			],
		}).compile();

		categoriesService = module.get<CategoriesService>(CategoriesService);
		databaseService = module.get<DatabaseService>(DatabaseService);

		jest.clearAllMocks();
	});

	const userId = 'user-123';
	const categoryId = 'cat-123';

	describe('createCategory', () => {
		it('should create a category successfully', async () => {
			mockDatabaseService.prisma.category.findFirst.mockResolvedValue(null);
			mockDatabaseService.category.create.mockResolvedValue({ id: categoryId, name: 'New Cat' });

			const result = await categoriesService.createCategory({ name: 'New Cat' }, userId);

			expect(result.success).toBe(true);
			expect(result.message).toContain('created');
			expect(mockDatabaseService.category.create).toHaveBeenCalledWith({
				data: { name: 'New Cat', userId },
			});
		});

		it('should throw ConflictException if category already exists', async () => {
			mockDatabaseService.prisma.category.findFirst.mockResolvedValue({ id: categoryId, name: 'Existing' });

			await expect(categoriesService.createCategory({ name: 'Existing' }, userId))
				.rejects.toThrow(ConflictException);
		});
	});

	describe('getCategories', () => {
		it('should return all categories for a user', async () => {
			const mockCats = [{ id: '1', name: 'Cat 1' }, { id: '2', name: 'Cat 2' }];
			mockDatabaseService.category.findMany.mockResolvedValue(mockCats);

			const result = await categoriesService.getCategories(userId);

			expect(result.success).toBe(true);
			expect(result.data).toHaveLength(2);
			expect(mockDatabaseService.category.findMany).toHaveBeenCalledWith({
				where: { userId },
				select: expect.any(Object),
			});
		});
	});

	describe('deleteCategory', () => {
		it('should delete category if it exists', async () => {
			mockDatabaseService.category.findUnique.mockResolvedValue({ id: categoryId });
			mockDatabaseService.category.delete.mockResolvedValue({ id: categoryId });

			const result = await categoriesService.deleteCategory(categoryId, userId);

			expect(result.success).toBe(true);
			expect(mockDatabaseService.category.delete).toHaveBeenCalled();
		});

		it('should throw ConflictException if category does not exist', async () => {
			mockDatabaseService.category.findUnique.mockResolvedValue(null);

			await expect(categoriesService.deleteCategory(categoryId, userId))
				.rejects.toThrow(ConflictException);
		});
	});

	describe('updateCategory', () => {
		it('should update category name successfully', async () => {
			mockDatabaseService.category.findUnique.mockResolvedValue({ id: categoryId });
			mockDatabaseService.category.update.mockResolvedValue({ id: categoryId, name: 'Updated' });

			const result = await categoriesService.updateCategory(categoryId, userId, { name: 'Updated' });

			expect(result.success).toBe(true);
			expect(mockDatabaseService.category.update).toHaveBeenCalled();
		});

		it('should throw ConflictException if category doesn\'t exist', async () => {
			mockDatabaseService.category.findUnique.mockResolvedValue(null);

			await expect(categoriesService.updateCategory(categoryId, userId, { name: 'Updated' }))
				.rejects.toThrow(ConflictException);
		});
	});
});

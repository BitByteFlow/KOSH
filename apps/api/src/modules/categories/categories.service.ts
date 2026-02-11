import {
	ConflictException,
	Injectable,
	InternalServerErrorException,
} from "@nestjs/common";
import { error } from "console";
import { DatabaseService } from "src/database/database.service";
import type { CategoryResponseDto } from "./dto/CategoryResponseDto";

@Injectable()
export class CategoryService {
	constructor(private readonly database: DatabaseService) {}

	async createCategories(
		name: string,
		userId: string,
	): Promise<CategoryResponseDto> {
		try {
			console.log(name);
			const exists = await this.database.prisma.category.findFirst({
				where: {
					name: name,
					userId: userId,
				},
			});

			if (exists) {
				throw new ConflictException({
					status: "error",
					message: `Category with ${name} name already exists`,
					error:
						"Internal Server Error, the category already exists for this user.",
				});
			}

			await this.database.category.create({
				data: {
					name: name,
					userId: userId,
				},
			});

			return {
				status: "success",
				message: `New Category ${name} created! `,
			};
		} catch (error) {
			if (error instanceof ConflictException) {
				throw error;
			}
			throw new InternalServerErrorException("Failed to Create New Category");
		}
	}

	async getCategories(userId: string): Promise<any> {
		try {
			const categories = await this.database.category.findMany({
				where: {
					userId: userId,
				},
				select: {
					id: true,
					name: true,
				},
			});

			if (!categories) {
				throw new ConflictException({
					status: "failed",
					message: "No categories yet",
					error: "No categories data to retrieve",
				});
			}

			return {
				status: "success",
				message: "Categories retrieved successfully",
				data: {
					categories,
				},
			};
		} catch (error) {
			if (error instanceof ConflictException) {
				throw error;
			}
			throw new InternalServerErrorException("Failed to get categories");
		}
	}

	async deleteCategory(
		id: string,
		userId: string,
	): Promise<CategoryResponseDto> {
		try {
			const exists = await this.database.category.findUnique({
				where: {
					id: id,
				},
			});
			console.log(exists);
			if (!exists) {
				throw new ConflictException({
					status: "error",
					message: "Category with this id doesn't exist!!",
					error: error,
				});
			}

			await this.database.category.delete({
				where: {
					id: id,
					userId: userId,
				},
			});

			return {
				status: "success",
				message: "Deleted successfully!",
			};
		} catch (error) {
			if (error instanceof ConflictException) {
				throw error;
			}
			throw new InternalServerErrorException("Failed to delete categories");
		}
	}

	async updateCategory(
		id: string,
		userId: string,
		name: string,
	): Promise<CategoryResponseDto> {
		try {
			const exist = await this.database.category.findUnique({
				where: {
					userId: userId,
					id: id,
				},
			});

			if (!exist) {
				throw new ConflictException({
					status: "error",
					message: "Category with this Id doesn't exist!",
					error: "Category doesn't exist",
				});
			}

			await this.database.category.update({
				where: {
					id: id,
				},
				data: {
					name: name,
				},
			});

			return {
				status: "success",
				message: "Category Updated",
			};
		} catch (error) {
			if (error instanceof ConflictException) {
				throw error;
			}
			throw new InternalServerErrorException("Failed to update categories");
		}
	}
}

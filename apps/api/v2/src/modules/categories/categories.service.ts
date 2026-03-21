import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CategoryResponse } from './entities/categoryResponse.entity';
import { CreateCategoryInput } from './dto/createCategory.input';
import { UpdateCategoryInput } from './dto/updateCategory.input';

@Injectable()
export class CategoriesService {
  constructor(private readonly database: DatabaseService) { }

  async createCategory(
    input: CreateCategoryInput,
    storeId: string,
  ): Promise<CategoryResponse> {
    try {
      const { name } = input;
      const exists = await this.database.prisma.category.findFirst({
        where: {
          name,
          storeId,
        },
      });

      if (exists) {
        throw new ConflictException(
          `Category with ${name} name already exists`,
        );
      }

      await this.database.category.create({
        data: {
          name,
          storeId,
        },
      });

      return {
        success: true,
        message: `New Category ${name} created!`,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to Create New Category');
    }
  }

  async getCategories(storeId: string): Promise<CategoryResponse> {
    try {
      const categories = await this.database.category.findMany({
        where: {
          storeId,
        },
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return {
        success: true,
        data: categories.map(c => ({
          ...c,
          createdAt: c.createdAt.toISOString(),
          updatedAt: c.updatedAt.toISOString(),
        })),
        message: "Categories fetched successfully"
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to get categories');
    }
  }

  async deleteCategory(
    id: string,
    storeId: string,
  ): Promise<CategoryResponse> {
    try {
      const exists = await this.database.category.findUnique({
        where: {
          id,
        },
      });

      if (!exists) {
        throw new ConflictException("Category with this id doesn't exist!!");
      }

      await this.database.category.delete({
        where: {
          id,
          storeId,
        },
      });

      return {
        success: true,
        message: 'Deleted successfully!',
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete categories');
    }
  }

  async updateCategory(
    id: string,
    storeId: string,
    input: UpdateCategoryInput,
  ): Promise<CategoryResponse> {
    try {
      const { name } = input;
      const exist = await this.database.category.findFirst({
        where: {
          storeId,
          id,
        },
      });

      if (!exist) {
        throw new ConflictException("Category with this Id doesn't exist!");
      }

      await this.database.category.update({
        where: {
          id,
        },
        data: {
          name,
        },
      });

      return {
        success: true,
        message: 'Category Updated',
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update categories');
    }
  }
}

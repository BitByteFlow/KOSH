import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CategoryResponse } from './entities/categoryResponse.entity';
import { Category } from './entities/category.entity';
import { CreateCategoryInput } from './dto/createCategory.input';
import { UpdateCategoryInput } from './dto/updateCategory.input';

@Injectable()
export class CategoriesService {
  constructor(private readonly database: DatabaseService) { }

  async createCategory(
    input: CreateCategoryInput,
    userId: string,
  ): Promise<CategoryResponse> {
    try {
      const { name } = input;
      const exists = await this.database.prisma.category.findFirst({
        where: {
          name,
          userId,
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
          userId,
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

  async getCategories(userId: string): Promise<CategoryResponse> {
    try {
      const categories = await this.database.category.findMany({
        where: {
          userId,
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
        data: categories,
        message: "Categories fetched successfully"
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to get categories');
    }
  }

  async deleteCategory(
    id: string,
    userId: string,
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
          userId,
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
    userId: string,
    input: UpdateCategoryInput,
  ): Promise<CategoryResponse> {
    try {
      const { name } = input;
      const exist = await this.database.category.findUnique({
        where: {
          userId,
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

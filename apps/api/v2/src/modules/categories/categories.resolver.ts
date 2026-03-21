import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';
import { CategoryResponse } from './entities/categoryResponse.entity';
import { CreateCategoryInput } from './dto/createCategory.input';
import { UpdateCategoryInput } from './dto/updateCategory.input';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/utils/jwt.guard';
import { StoreGuard } from 'src/utils/store.guard';
import { CurrentUser } from 'src/utils/currentUser.decorator';
import { CurrentStore } from 'src/utils/currentStore.decorator';
import type { AuthenticatedUser } from 'src/types/jwt.types';

@Resolver(() => Category)
@UseGuards(JwtAuthGuard, StoreGuard)
export class CategoriesResolver {
  constructor(private readonly categoriesService: CategoriesService) { }

  @Mutation(() => CategoryResponse)
  async createCategory(
    @Args('createCategoryInput') createCategoryInput: CreateCategoryInput,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentStore() storeId: string,
  ): Promise<CategoryResponse> {
    return this.categoriesService.createCategory(createCategoryInput, storeId);
  }

  @Query(() => CategoryResponse)
  async getCategories(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentStore() storeId: string,
  ): Promise<CategoryResponse> {
    return this.categoriesService.getCategories(storeId);
  }

  @Mutation(() => CategoryResponse)
  async deleteCategory(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentStore() storeId: string,
  ) {
    return this.categoriesService.deleteCategory(id, storeId);
  }

  @Mutation(() => CategoryResponse)
  async updateCategory(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateCategoryInput') updateCategoryInput: UpdateCategoryInput,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentStore() storeId: string,
  ) {
    return this.categoriesService.updateCategory(id, storeId, updateCategoryInput);
  }
}

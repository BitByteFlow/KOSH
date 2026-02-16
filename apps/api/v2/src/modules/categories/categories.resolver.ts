import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';
import { CategoryResponse } from './entities/categoryResponse.entity';
import { CreateCategoryInput } from './dto/createCategory.input';
import { UpdateCategoryInput } from './dto/updateCategory.input';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/utils/jwt.guard';
import { CurrentUser } from 'src/utils/currentUser.decorator';
import type { AuthenticatedUser } from 'src/types/jwt.types';

@Resolver(() => Category)
@UseGuards(JwtAuthGuard)
export class CategoriesResolver {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Mutation(() => CategoryResponse)
  async createCategory(
    @Args('createCategoryInput') createCategoryInput: CreateCategoryInput,
	@CurrentUser() user: AuthenticatedUser,
  ) {
    const userId = user.id;
    return this.categoriesService.createCategory(createCategoryInput, userId);
  }

  @Query(() => [Category])
  async getCategories(@CurrentUser() user: AuthenticatedUser) {
    const userId = user.id;
    return this.categoriesService.getCategories(userId);
  }

  @Mutation(() => CategoryResponse)
  async deleteCategory(@Args('id', { type: () => ID }) id: string, @CurrentUser() user: AuthenticatedUser) {
    const userId = user.id;
    return this.categoriesService.deleteCategory(id, userId);
  }

  @Mutation(() => CategoryResponse)
  async updateCategory(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateCategoryInput') updateCategoryInput: UpdateCategoryInput,
	@CurrentUser() user: AuthenticatedUser,
  ) {
    const userId = user.id;
    return this.categoriesService.updateCategory(id, userId, updateCategoryInput);
  }
}

import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';
import { CategoryResponse } from './entities/category-response.entity';
import { CreateCategoryInput } from './dto/create-category.input';
import { UpdateCategoryInput } from './dto/update-category.input';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/utils/jwt.guard';
import { CurrentUser } from 'src/utils/currentUser.decorator';

@Resolver(() => Category)
@UseGuards(JwtAuthGuard)
export class CategoriesResolver {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Mutation(() => CategoryResponse)
  async createCategory(
    @Args('createCategoryInput') createCategoryInput: CreateCategoryInput,
	@CurrentUser() user: any,
  ) {
    const userId = user.id;
    return this.categoriesService.createCategory(createCategoryInput, userId);
  }

  @Query(() => [Category])
  async getCategories(@CurrentUser() user: any) {
    const userId = user.id;
    return this.categoriesService.getCategories(userId);
  }

  @Mutation(() => CategoryResponse)
  async deleteCategory(@Args('id', { type: () => ID }) id: string, @CurrentUser() user: any) {
    const userId = user.id;
    return this.categoriesService.deleteCategory(id, userId);
  }

  @Mutation(() => CategoryResponse)
  async updateCategory(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateCategoryInput') updateCategoryInput: UpdateCategoryInput,
	@CurrentUser() user: any,
  ) {
    const userId = user.id;
    return this.categoriesService.updateCategory(id, userId, updateCategoryInput);
  }
}

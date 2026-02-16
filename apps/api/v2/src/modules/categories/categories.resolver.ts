import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';
import { CategoryResponse } from './entities/category-response.entity';
import { CreateCategoryInput } from './dto/create-category.input';
import { UpdateCategoryInput } from './dto/update-category.input';

@Resolver(() => Category)
export class CategoriesResolver {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Mutation(() => CategoryResponse)
  async createCategory(
    @Args('createCategoryInput') createCategoryInput: CreateCategoryInput,
  ) {
    // TODO: Get userId from context/auth
    const userId = 'cmp73b3p00000u80t51025a5p';
    return this.categoriesService.createCategory(createCategoryInput, userId);
  }

  @Query(() => [Category])
  async getCategories() {
    // TODO: Get userId from context/auth
    const userId = 'cmp73b3p00000u80t51025a5p';
    return this.categoriesService.getCategories(userId);
  }

  @Mutation(() => CategoryResponse)
  async deleteCategory(@Args('id', { type: () => ID }) id: string) {
    // TODO: Get userId from context/auth
    const userId = 'cmp73b3p00000u80t51025a5p';
    return this.categoriesService.deleteCategory(id, userId);
  }

  @Mutation(() => CategoryResponse)
  async updateCategory(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateCategoryInput') updateCategoryInput: UpdateCategoryInput,
  ) {
    // TODO: Get userId from context/auth
    const userId = 'cmp73b3p00000u80t51025a5p';
    return this.categoriesService.updateCategory(id, userId, updateCategoryInput);
  }
}

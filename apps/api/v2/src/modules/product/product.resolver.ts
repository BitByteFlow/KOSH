import { UseGuards } from '@nestjs/common';
import { Args, Resolver, Query, Mutation, ID } from '@nestjs/graphql';
import { JwtAuthGuard } from 'src/utils/jwt.guard';
import { ProductService } from './product.service';
import { CurrentUser } from 'src/utils/currentUser.decorator';
import type { AuthenticatedUser } from 'src/types/jwt.types';
import { Product } from './entities/product.entity';
import { ProductResponse, ProductsResponse } from './entities/productResponse.entity';
import { CreateProductInput } from './dto/createProductInput';
import { UpdateProductInput } from './dto/updateProductInput';
import { VariantInput } from './dto/variant.input';
import { ProductFilterInput } from './dto/productFilter.input';

@Resolver(() => Product)
	@UseGuards(JwtAuthGuard)
export class ProductResolver {
	constructor(private productService: ProductService) {}

	@Query(() => ProductsResponse, { name: 'getProductsWithVariants' })
	async getProductWithVariant(
		@CurrentUser() user: AuthenticatedUser,
	): Promise<ProductsResponse> {
		return await this.productService.listProductsWithVariant(user.id);
	}

	@Query(() => ProductsResponse, { name: 'listProductsWithFilter' })
	async listProductsWithFilter(
		@CurrentUser() user: AuthenticatedUser,
		@Args('filterInput') filterInput: ProductFilterInput,
	): Promise<ProductsResponse> {
		return await this.productService.listProductsWithFilters(user.id, filterInput);
	}

	@Mutation(() => ProductResponse, { name: 'createProduct' })
	async createProduct(
		@CurrentUser() user: AuthenticatedUser,
		@Args('createProductInput') createProductDto: CreateProductInput,
	): Promise<ProductResponse> {
		return await this.productService.createProduct(user.id, createProductDto);
	}

	@Mutation(() => ProductResponse, { name: 'deleteProduct' })
	async deleteProduct(
		@CurrentUser() user: AuthenticatedUser,
		@Args('productId', { type: () => ID }) productId: string,
	): Promise<ProductResponse> {
		return await this.productService.deleteProduct(productId, user.id);
	}

	@Mutation(() => ProductResponse, { name: 'addVariant' })
	async addVariant(
		@CurrentUser() user: AuthenticatedUser,
		@Args('variantInput') variantDto: VariantInput,
		@Args('productId', { type: () => ID }) productId: string,
	): Promise<ProductResponse> {
		console.log(variantDto);
		return await this.productService.addVariant(variantDto, productId, user.id);
	}

	@Mutation(() => ProductResponse, { name: 'updateProductVariant' })
	async updateProductVariant(
		@CurrentUser() user: AuthenticatedUser,
		@Args('updateProductVariantInput') updateProductVariantDto: UpdateProductInput,
		@Args('productVariantId', { type: () => ID }) productVariantId: string,
	): Promise<ProductResponse> {
		return await this.productService.updateProductVariant(
			updateProductVariantDto,
			user.id,
			productVariantId,
		);
	}

	@Mutation(() => ProductResponse, { name: 'deleteProductVariant' })
	async deleteProductVariant(
		@CurrentUser() user: AuthenticatedUser,
		@Args('productId', { type: () => ID }) productId: string,
		@Args('productVariantId', { type: () => ID }) productVariantId: string,
	): Promise<ProductResponse> {
		return await this.productService.deleteProductVariant(
			productId,
			user.id,
			productVariantId,
		);
	}

	@Mutation(() => ProductResponse, { name: 'updateProduct' })
	async updateProduct(
		@CurrentUser() user: AuthenticatedUser,
		@Args('productId', { type: () => ID }) productId: string,
		@Args('updateProductInput') updateProductDto: UpdateProductInput,
	): Promise<ProductResponse> {
		return await this.productService.updateProduct(
			productId,
			user.id,
			updateProductDto,
		);
	}
}

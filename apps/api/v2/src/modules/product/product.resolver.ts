import { UseGuards } from "@nestjs/common";
import { Args, Resolver, Query, Mutation, ID } from "@nestjs/graphql";
import { JwtAuthGuard } from "src/utils/jwt.guard";
import { StoreGuard } from "src/utils/store.guard";
import { ProductService } from "./product.service";
import { CurrentUser } from "src/utils/currentUser.decorator";
import { CurrentStore } from "src/utils/currentStore.decorator";
import type { AuthenticatedUser } from "src/types/jwt.types";
import { Product } from "./entities/product.entity";
import { ProductResponse } from "./entities/productResponse.entity";
import { CreateProductInput } from "./dto/createProductInput";
import { UpdateProductInput } from "./dto/updateProductInput";
import { VariantInput } from "./dto/variant.input";
import { ProductFilterInput } from "./dto/productFilter.input";

import { UpdateProductVariantInput } from "./dto/updateProductVariant.input";

@Resolver(() => Product)
@UseGuards(JwtAuthGuard, StoreGuard)
export class ProductResolver {
	constructor(private productService: ProductService) {}

	@Query(() => ProductResponse, { name: "getProductsWithVariants" })
	async getProductWithVariant(
		@CurrentUser() user: AuthenticatedUser,
		@CurrentStore() storeId: string,
	): Promise<ProductResponse> {
		return await this.productService.listProductsWithVariant(storeId);
	}

	@Query(() => ProductResponse, { name: "listProductsWithFilter" })
	async listProductsWithFilter(
		@CurrentUser() user: AuthenticatedUser,
		@CurrentStore() storeId: string,
		@Args("filterInput") filterInput: ProductFilterInput,
	): Promise<ProductResponse> {
		return await this.productService.listProductsWithFilters(
			storeId,
			filterInput,
		);
	}

	@Mutation(() => ProductResponse, { name: "createProduct" })
	async createProduct(
		@CurrentUser() user: AuthenticatedUser,
		@CurrentStore() storeId: string,
		@Args("createProductInput") createProductDto: CreateProductInput,
	): Promise<ProductResponse> {
		return await this.productService.createProduct(
			user.id,
			storeId,
			createProductDto,
		);
	}

	@Mutation(() => ProductResponse, { name: "deleteProduct" })
	async deleteProduct(
		@CurrentUser() user: AuthenticatedUser,
		@CurrentStore() storeId: string,
		@Args("productId", { type: () => ID }) productId: string,
	): Promise<ProductResponse> {
		return await this.productService.deleteProduct(productId, storeId);
	}

	@Mutation(() => ProductResponse, { name: "addVariant" })
	async addVariant(
		@CurrentUser() user: AuthenticatedUser,
		@CurrentStore() storeId: string,
		@Args("variantInput") variantDto: VariantInput,
		@Args("productId", { type: () => ID }) productId: string,
	): Promise<ProductResponse> {
		return await this.productService.addVariant(variantDto, productId, storeId);
	}

	@Mutation(() => ProductResponse, { name: "updateProductVariant" })
	async updateProductVariant(
		@CurrentUser() user: AuthenticatedUser,
		@CurrentStore() storeId: string,
		@Args("updateProductVariantInput")
		updateProductVariantDto: UpdateProductVariantInput,
		@Args("productVariantId", { type: () => ID }) productVariantId: string,
	): Promise<ProductResponse> {
		return await this.productService.updateProductVariant(
			updateProductVariantDto,
			storeId,
			productVariantId,
		);
	}

	@Mutation(() => ProductResponse, { name: "deleteProductVariant" })
	async deleteProductVariant(
		@CurrentUser() user: AuthenticatedUser,
		@CurrentStore() storeId: string,
		@Args("productId", { type: () => ID }) productId: string,
		@Args("productVariantId", { type: () => ID }) productVariantId: string,
	): Promise<ProductResponse> {
		return await this.productService.deleteProductVariant(
			productId,
			storeId,
			productVariantId,
		);
	}

	@Mutation(() => ProductResponse, { name: "updateProduct" })
	async updateProduct(
		@CurrentUser() user: AuthenticatedUser,
		@CurrentStore() storeId: string,
		@Args("productId", { type: () => ID }) productId: string,
		@Args("updateProductInput") updateProductDto: UpdateProductInput,
	): Promise<ProductResponse> {
		return await this.productService.updateProduct(
			productId,
			storeId,
			updateProductDto,
		);
	}
}

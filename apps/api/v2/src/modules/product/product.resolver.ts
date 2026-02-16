import { UseGuards } from '@nestjs/common';
import { Args, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from 'src/utils/jwt.guard';
import { ProductService } from './product.service';
import { CurrentUser } from 'src/utils/currentUser.decorator';

@Resolver()
export class ProductResolver {
	constructor(private productService: ProductService) {}

	@UseGuards(JwtAuthGuard)
	async getProductWithVariant(
		@CurrentUser() user: any,
	): Promise<any> {
		const response = await this.productService.listProductsWithVariant(
			user.id,
		);

		return response;
	}

	@UseGuards(JwtAuthGuard)
	async listProductsWithFilter(
		@CurrentUser() user: any,
		@Args('filterDto') filterDto: ProductFilterDto,
	): Promise<any> {
		console.log("GET /products - UserID:", user.id);
		console.log("GET /products - FilterDTO:", JSON.stringify(filterDto, null, 2));
		
		const response = await this.productService.listProductsWithFilters(
			user.id,
			filterDto,
		);
		return response;
	}

	@UseGuards(JwtAuthGuard)
	async createProduct(
		@CurrentUser() user: any,
		@Args('createProductDto') createProductDto: CreateProductDto,
	): Promise<CategoryResponseDto> {
		const response = await this.productService.createProduct(
			user.id,
			createProductDto,
		);

		return response;
	}
	@UseGuards(JwtAuthGuard)
	async deleteProduct(
		@CurrentUser() user: any,
		@Args('productId') productId: string,
	): Promise<CategoryResponseDto> {
		const response = await this.productService.deleteProduct(
			productId,
			user.id,
		);

		return response;
	}

	@UseGuards(JwtAuthGuard)
	async addVariant(
		@CurrentUser() user: any,
		@Args('variantDto') variantDto: CreateVariantDto,
		@Args('productId') productId: string,
	): Promise<CategoryResponseDto> {
		console.log(variantDto);
		const response = await this.productService.addVariant(
			variantDto,
			productId,
			user.id,
		);

		return response;
	}

	@UseGuards(JwtAuthGuard)
	async updateProductVariant(
		@CurrentUser() user: any,
		@Args('updateProductVariantDto') updateProductVariantDto: UpdateProductVariantDto,
		@Args('productVariantId') productVariantId: string,
	): Promise<CategoryResponseDto> {
		const response = await this.productService.updateProductVariant(
			updateProductVariantDto,
			user.id,
			productVariantId,
		);

		return response;
	}

	@UseGuards(JwtAuthGuard)
	async deleteProductVariant(
		@CurrentUser() user: any,
		@Args('productId') productId: string,
		@Args('productVariantId') productVariantId: string,
	): Promise<CategoryResponseDto> {

		const response = await this.productService.deleteProductVariant(
			productId,
			user.id,
			productVariantId,
		);

		return response;
	}

	@UseGuards(JwtAuthGuard)
	async updateProduct(
		@CurrentUser() user: any,
		@Args('productId') productId: string,
		@Args('updateProductDto') updateProductDto: UpdateProductDto,
	): Promise<CategoryResponseDto> {
		const response = await this.productService.updateProduct(
			productId,
			user.id,
			updateProductDto,
		);

		return response;
	}
}

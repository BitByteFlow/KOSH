import { Controller, Get, Param, Query, UseGuards, Req } from "@nestjs/common";
import { JwtAuthGuard } from "src/utils/jwt.guard";
import { ProductService } from "./product.service";
import type { AuthenticatedRequest } from "src/types/auth";
import type { ProductFilterInput } from "./dto/productFilter.input";
import { StoreGuard } from "src/utils/store.guard";

@Controller("products")
@UseGuards(JwtAuthGuard, StoreGuard)
export class ProductController {
	constructor(private productService: ProductService) {}

	@Get("search")
	async searchProducts(
		@Req() req: AuthenticatedRequest,
		@Query() query: ProductFilterInput,
	) {
		const storeId = req.storeId;
		return this.productService.listProductsWithFilters(storeId, query);
	}

	@Get("variant/:barcode")
	async getVariantByBarcode(
		@Req() req: AuthenticatedRequest,
		@Param("barcode") barcode: string,
	) {
		const storeId = req.storeId;
		// Search by barcode - you may want to add a specific service method
		return this.productService.listProductsWithFilters(storeId, {
			search: barcode,
			page: 1,
			limit: 10,
		});
	}
}

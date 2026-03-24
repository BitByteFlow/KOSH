import { Module } from "@nestjs/common";
import { ProductResolver } from "./product.resolver";
import { ProductService } from "./product.service";
import { ProductController } from "./product.controller";
import { StoreGuard } from "src/utils/store.guard";

@Module({
	providers: [ProductResolver, ProductService, StoreGuard],
	controllers: [ProductController],
	exports: [ProductService],
})
export class ProductModule {}

import { UpdateProductVariantDto } from './dto/UpdateVariantDto.dto';
/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Put, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/utils/jwt.guard";
import { CategoryResponseDto } from "../categories/dto/CategoryResponseDto";

import { ParseUUIDPipe } from "@nestjs/common";
import { CreateVariantDto } from "./dto/AddVariantDto.dto";
import { CreateProductRequestDto } from "./dto/CreateProductRequestDto.dto";
import { UpdateProductDto } from "./dto/UpdateProductDto.dto";
import { ProductService } from "./product.service";

@Controller("products")
export class ProductController {
    constructor(private productService: ProductService) { }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    @Get("/variants")
    async getProductWithVariant(@Req() req: any): Promise<any> {

        const response = await this.productService.listProductsWithVariant(req.user.id)

        return response
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    @Post()
    async createProduct(@Req() req: any, @Body() createProductDto: CreateProductRequestDto): Promise<CategoryResponseDto> {

        const response = await this.productService.createProduct(req.user.id, createProductDto)

        return response
    }
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    @Delete(':id')
    async deleteProduct(@Req() req: any, @Param('id') productId: string): Promise<CategoryResponseDto> {

        const response = await this.productService.deleteProduct(productId, req.user.id)

        return response
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    @Post('/:productId/variants')
    async addVariant(@Req() req: any, @Param('productId', ParseUUIDPipe) productId: string, @Body() variantDto: CreateVariantDto): Promise<CategoryResponseDto> {
        console.log(variantDto)
        const response = await this.productService.addVariant(variantDto, productId, req.user.id)

        return response
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    @Put('/variants/:productVariantId')
    async updateProductVariant(@Req() req: any, @Param('productVariantId', ParseUUIDPipe) productVariantId: string, @Body() updateProductVariantDto: UpdateProductVariantDto): Promise<CategoryResponseDto> {
        const response = await this.productService.updateProductVariant( updateProductVariantDto, req.user.id, productVariantId)

        return response
    }
    
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    @Delete('/variants/:productVariantId')
    async deleteProductVariant(@Req() req: any, @Param('productVariantId', ParseUUIDPipe) productVariantId: string, @Body() body: any): Promise<CategoryResponseDto> {

        console.log(body)

        const response = await this.productService.deleteProductVariant( body.productId, req.user.id, productVariantId)

        return response
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    @Patch('/:productId')
    async updateProduct(@Req() req: any, @Param('productId') productId: string, @Body() updateProductDto: UpdateProductDto): Promise<CategoryResponseDto> {

        const response = await this.productService.updateProduct(productId, req.user.id, updateProductDto.name, updateProductDto.categoryId)

        return response
    }


}
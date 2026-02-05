/* eslint-disable prettier/prettier */

import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import { CategoryResponseDto } from "../categories/dto/CategoryResponseDto";
import { ProductFilterDto } from "./dto/ProductFilterDto.dto";

@Injectable()
export class ProductService {
    constructor(private readonly database: DatabaseService) { }

    async createProduct(userId, productDetail): Promise<CategoryResponseDto> {


        try {

            await this.database.$transaction(async (tsx) => {

                const categoryExists = await tsx.category.findUnique({
                    where: {
                        id: productDetail.categoryId
                    }
                })

                if (!categoryExists) {
                    throw new ConflictException({
                        status: "error",
                        message: "Category doesn't exist"
                    })
                }

                const product = await tsx.product.create({

                    data: {
                        name: productDetail.name,
                        categoryId: productDetail.categoryId,
                        userId: userId
                    },
                })



                const promises = productDetail.variants.map(async (variant, index) => {

                    const sku = await this.generateSku(categoryExists.name, product.name, index);

                    const barcode = await this.generateUniqueBarcode();


                    const productVariant = await tsx.productVariant.create({
                        data: {
                            productId: product.id,
                            sku: sku,
                            barcode: barcode,
                            costPrice: variant.costPrice,
                            sellingPrice: variant.sellingPrice,
                            stock: variant.stock,
                            status: "ACTIVE"
                        }
                    })

                    if (variant.attributes?.length > 0) {


                        for (const attributeVariant of variant.attributes) {

                            await tsx.variantAttribute.create({
                                data: {
                                    variantId: productVariant.id,
                                    name: attributeVariant.name,
                                    value: attributeVariant.value
                                }
                            })
                        }

                    }

                })

                await Promise.all(promises)

            })

            return {
                status: "success",
                message: "Product Addition Successful!"
            }


        } catch (error) {
            if (error instanceof ConflictException) {
                throw error
            }
            throw new InternalServerErrorException("Failed to Create Product", error)
        }

    }

    async deleteProduct(productId, userId): Promise<CategoryResponseDto> {

        try {
            await this.database.$transaction(async (tsx) => {

                const product = await tsx.product.findUnique({
                    where: {
                        id: productId,
                        userId: userId
                    },
                    include: {
                        variants: {
                            include: {
                                _count: {
                                    select: {
                                        saleItems: true,
                                        purchasesItems: true
                                    }
                                }
                            }
                        }
                    }
                })

                if (!product) {
                    throw new NotFoundException({
                        status: "error",
                        message: "Product Not found for this user"
                    })
                }

                for (const variant of product.variants) {
                    if (variant._count.saleItems > 0 || variant._count.purchasesItems > 0) {
                        throw new ConflictException(
                            `Cannot delete product. Variant ${variant.sku} has sales or purchases.`
                        );
                    }
                }

                await tsx.product.delete({
                    where: {
                        id: productId,
                        userId: userId
                    }
                })
            })

            return {
                status: "success",
                message: "Product Deleted",
            }
        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof ConflictException
            ) {
                throw error;
            }
            throw new InternalServerErrorException("Failed to delete product", error);
        }

    }

    async updateProduct(productId: string, userId: string, name: string, categoryId: string): Promise<CategoryResponseDto> {
        try {
            await this.database.$transaction(async (tsx) => {

                const product = await tsx.product.findUnique({
                    where: {
                        id: productId,
                        userId: userId
                    },
                    include: {
                        category: true
                    }
                });

                if (!product) {
                    throw new NotFoundException("Product not found");
                }


                const newCategory = await tsx.category.findUnique({
                    where: {
                        id: categoryId,
                        userId: userId
                    }
                });

                if (!newCategory) {
                    throw new NotFoundException("Category not found or access denied");
                }


                if (name !== product.name || categoryId !== product.categoryId) {
                    const duplicateProduct = await tsx.product.findFirst({
                        where: {
                            name: name,
                            categoryId: categoryId,
                            userId: userId,
                            NOT: { id: productId }
                        }
                    });

                    if (duplicateProduct) {
                        throw new ConflictException(
                            `Product "${name}" already exists in category "${newCategory.name}"`
                        );
                    }
                }


                await tsx.product.update({
                    where: { id: productId },
                    data: {
                        name: name,
                        categoryId: categoryId
                    }
                });
            });

            return {
                status: "success",
                message: "Product updated successfully"
            };

        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof ConflictException
            ) {
                throw error;
            }

            console.error("Update product error:", error);
            throw new InternalServerErrorException("Failed to update product", error);
        }
    }


    async addVariant(variantDetail, productId: string, userId: string,): Promise<CategoryResponseDto> {
        try {
            await this.database.$transaction(async (tsx) => {
                const product = await tsx.product.findUnique({
                    where: {
                        id: productId,
                        userId: userId
                    },
                    include: {
                        category: true
                    }
                });

                if (!product) {
                    throw new NotFoundException("Product not found");
                }

                const variantsCount = await tsx.productVariant.count({
                    where: { productId: productId }
                });

                const sku = await this.generateSku(
                    product.category.name,
                    product.name,
                    variantsCount + 1
                );

                const barcode = await this.generateUniqueBarcode();

                const productVariant = await tsx.productVariant.create({
                    data: {
                        productId: product.id,
                        sku: sku,
                        barcode: barcode,
                        costPrice: variantDetail.costPrice,
                        sellingPrice: variantDetail.sellingPrice,
                        stock: variantDetail.stock,
                        status: "ACTIVE"
                    }
                });

                if (variantDetail.attributes?.length > 0) {
                    const attributePromises = variantDetail.attributes.map(
                        (attribute) =>
                            tsx.variantAttribute.create({
                                data: {
                                    variantId: productVariant.id,
                                    name: attribute.name,
                                    value: attribute.value
                                }
                            })
                    );
                    await Promise.all(attributePromises);
                }
            });

            return {
                status: "success",
                message: "Variant added successfully",
            };

        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }

            console.error("Add variant error:", error);
            throw new InternalServerErrorException("Failed to add variant", error);
        }
    }

    async listProductsWithVariant(userId): Promise<any> {
        try {

            const products = await this.database.product.findMany({
                where: {
                    userId: userId
                },
                include: {
                    variants: {
                        include: {
                            attributes: true
                        }
                    }
                }
            })

            if (!products) {
                throw new NotFoundException({
                    status: "error",
                    message: "Product Not found"
                })
            }

            return {
                status: "success",
                message: "Product Returned Successfully",
                data: products
            }

        } catch (error) {
            console.log(error)
            if (error instanceof NotFoundException) {
                throw error
            }
            throw new InternalServerErrorException("Internal Server Error", error)

        }
    }

    async updateProductVariant(updateProductVariantDto, userId: string, productVariantId: string): Promise<CategoryResponseDto> {
        try {
            return await this.database.$transaction(async (tsx) => {
                const product = await tsx.product.findUnique({
                    where: {
                        id: updateProductVariantDto.productId,
                        userId: userId
                    }
                });

                if (!product) {
                    throw new NotFoundException("Product not found");
                }

                await tsx.productVariant.update({
                    where: {
                        id: productVariantId,
                        productId: updateProductVariantDto.productId
                    },
                    data: {
                        costPrice: updateProductVariantDto.costPrice,
                        sellingPrice: updateProductVariantDto.sellingPrice,
                        status: updateProductVariantDto.status
                    }
                });

                return {
                    status: "success",
                    message: "Variant updated successfully",
                };
            });

        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error
            }

            throw new InternalServerErrorException("Variant Updation Failed", error)
        }
    }

    async deleteProductVariant(productId: string, userId: string, productVariantId: string): Promise<CategoryResponseDto> {
        try {
            return await this.database.$transaction(async (tsx) => {
                const product = await tsx.product.findUnique({
                    where: {
                        id: productId,
                        userId: userId
                    }
                });

                if (!product) {
                    throw new NotFoundException("Product not found");
                }

                await tsx.productVariant.delete({
                    where: {
                        id: productVariantId,
                        productId: productId,
                    }
                });

                return {
                    status: "success",
                    message: "Variant deleted successfully",
                };
            });

        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error
            }

            throw new InternalServerErrorException("Variant Deletion Failed", error)
        }
    }

    async listProductsWithFilters(userId: string, filterDto: ProductFilterDto): Promise<any> {
        const {
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            categoryId,
            lowStock,
            search,
            minPrice,
            maxPrice,
            includeDeleted = false
        } = filterDto;

        const skip = (page - 1) * limit;

        const where: any = {
            userId,
        };

        if (!includeDeleted) {
            where.deletedAt = null;
        }


        if (categoryId) {
            where.categoryId = categoryId;
        }

        if (search) {
            where.name = {
                contains: search,
                mode: 'insensitive'
            };
        }


        if (lowStock) {
            where.variants = {
                some: {
                    stock: { lt: lowStock },
                    status: 'ACTIVE'
                }
            };
        }


        if (minPrice !== undefined || maxPrice !== undefined) {
            where.variants = {
                ...where.variants,
                some: {
                    ...where.variants?.some,
                    sellingPrice: {
                        ...(minPrice !== undefined && { gte: minPrice }),  // "price >= minPrice"
                        ...(maxPrice !== undefined && { lte: maxPrice })   // "price <= maxPrice"
                    }
                }
            };
        }


        const total = await this.database.product.count({ where });



        const products = await this.database.product.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                [sortBy]: sortOrder
            },
            include: {
                category: {
                    select: { name: true }
                },

                variants: {
                    where: lowStock ? { stock: { lt: lowStock } } : undefined,
                    select: {
                        id: true,
                        sku: true,
                        stock: true,
                        costPrice: true,
                        sellingPrice: true,
                        status: true
                    }
                },

                _count: {
                    select: {
                        variants: true
                    }
                }
            }
        });


        const totalPages = Math.ceil(total / limit);
        const hasNext = page < totalPages;
        const hasPrev = page > 1;


        return {
            status: 'success',
            message: 'Product matching the filters retrieved!',
            data: products,
            meta: {

                page,
                limit,
                total,
                totalPages,
                hasNext,
                hasPrev,
                lowStockThreshold: lowStock || null,
                appliedFilters: {
                    categoryId: categoryId || null,
                    search: search || null,
                    priceRange: {
                        min: minPrice || null,
                        max: maxPrice || null
                    }
                }
            }
        };
    }

    private async generateSku(categoryName: string, productName: string, sequence: number): Promise<string> {
        const variantCount = await this.database.productVariant.count();

        const catCode = categoryName
            .replace(/[^a-zA-Z]/g, '')
            .substring(0, 3)
            .toUpperCase()
            .padEnd(3, 'X');

        const prodCode = productName
            .replace(/[^a-zA-Z0-9]/g, '')
            .substring(0, 4)
            .toUpperCase()
            .padEnd(4, '0');

        const uniqueId = (variantCount + sequence + 1)
            .toString()
            .padStart(6, '0');

        return `${catCode}-${prodCode}-${uniqueId}`;
    }

    private async generateUniqueBarcode(): Promise<string> {
        let barcode: string;
        let isUnique = false;
        let attempts = 0;
        const maxAttempts = 10;

        while (!isUnique && attempts < maxAttempts) {

            barcode = this.generateCandidateBarcode();

            const exists = await this.database.productVariant.findUnique({
                where: { barcode }
            });

            if (!exists) {
                isUnique = true;
            }

            attempts++;
        }

        if (!isUnique) {
            throw new Error('Failed to generate unique barcode');
        }

        return barcode!;
    }

    private generateCandidateBarcode(): string {
        const timestamp = Date.now().toString().slice(-9);
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `INT${timestamp}${random}`;
    }
}

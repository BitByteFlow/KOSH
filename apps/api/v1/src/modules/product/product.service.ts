import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import { CategoryResponseDto } from "../categories/dto/CategoryResponseDto";
import { ProductFilterDto } from "./dto/ProductFilterDto.dto";
import { Prisma } from "@kosh/db";

@Injectable()
export class ProductService {
    constructor(private readonly database: DatabaseService) { }

    async createProduct(userId: string, productDetail: any): Promise<CategoryResponseDto> {
        try {
            return await this.database.prisma.$transaction(async (tsx: Prisma.TransactionClient) => {
                const categoryExists = await tsx.category.findUnique({
                    where: { id: productDetail.categoryId }
                });

                if (!categoryExists) {
                    throw new ConflictException("Category doesn't exist");
                }

                // Check if product exists (including soft deleted)
                const existingProduct = await tsx.product.findFirst({
                    where: {
                        name: productDetail.name,
                        categoryId: productDetail.categoryId,
                        userId: userId
                    }
                });

                let product;
                
                if (existingProduct) {
                    if (existingProduct.deletedAt === null) {
                        throw new ConflictException("Product with this name already exists in this category");
                    } else {
                        // Revive the product
                        product = await tsx.product.update({
                            where: { id: existingProduct.id },
                            data: {
                                deletedAt: null
                            }
                        });
                    }
                } else {
                    // Create new product
                    product = await tsx.product.create({
                        data: {
                            name: productDetail.name,
                            categoryId: productDetail.categoryId,
                            userId: userId
                        },
                    });
                }

                const createdVariants = [];
                let totalPurchaseAmount = 0;

                // Adjust sequence for SKU generation if reviving
                // If reviving, we might have existing variants.
                // But the generateSku uses global count + sequence + 1, so it should be fine mostly.
                // However, let's just stick to the current logic for new variants.

                for (let i = 0; i < productDetail.variants.length; i++) {
                    const variant = productDetail.variants[i];
                    // Note: generateSku logic relies on count. If we are reviving, we are adding NEW variants.
                    // The sequence `i` is 0-based for this batch.
                    const sku = await this.generateSku(categoryExists.name, product.name, i, tsx);
                    const barcode = await this.generateUniqueBarcode(tsx);

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
                    });

                    createdVariants.push({ ...productVariant, requestedStock: variant.stock });
                    totalPurchaseAmount += Number(variant.costPrice) * Number(variant.stock);

                    if (variant.attributes?.length > 0) {
                        for (const attributeVariant of variant.attributes) {
                            if (attributeVariant.name && attributeVariant.value) {
                                await tsx.variantAttribute.create({
                                    data: {
                                        variantId: productVariant.id,
                                        name: attributeVariant.name,
                                        value: attributeVariant.value
                                    }
                                });
                            }
                        }
                    }
                }

                if (productDetail.keepPurchaseRecord && totalPurchaseAmount > 0) {
                    const purchase = await tsx.purchase.create({
                        data: {
                            userId: userId,
                            supplierName: productDetail.supplierName || "Initial Stock",
                            total: totalPurchaseAmount,
                            amountPaid: totalPurchaseAmount,
                            balanceDue: 0,
                            status: "PAID",
                            items: {
                                create: createdVariants
                                    .filter(v => v.requestedStock > 0)
                                    .map(v => ({
                                        variantId: v.id,
                                        quantity: v.requestedStock,
                                        price: v.costPrice
                                    }))
                            }
                        }
                    });

                    // Update Daily Balance and Create Transaction
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const tomorrow = new Date(today);
                    tomorrow.setDate(tomorrow.getDate() + 1);

                    let dailyBalance = await tsx.dailyBalance.findFirst({
                        where: {
                            userId: userId,
                            date: { gte: today, lt: tomorrow }
                        }
                    });

                    if (!dailyBalance) {
                        const yesterday = new Date(today);
                        yesterday.setDate(yesterday.getDate() - 1);
                        const yesterdayBalance = await tsx.dailyBalance.findFirst({
                            where: { userId: userId, date: { gte: yesterday, lt: today } },
                            orderBy: { date: "desc" }
                        });
                        const openingCash = yesterdayBalance?.closingCash || 0;

                        dailyBalance = await tsx.dailyBalance.create({
                            data: {
                                userId: userId,
                                date: today,
                                openingCash: openingCash,
                                closingCash: openingCash,
                                totalCashIn: 0,
                                totalCashOut: 0,
                                totalSales: 0,
                                totalExpense: 0
                            }
                        });
                    }

                    await tsx.dailyBalance.update({
                        where: { id: dailyBalance.id },
                        data: {
                            closingCash: { decrement: totalPurchaseAmount },
                            totalCashIn: { increment: 0 }, // Just to ensure structure
                            totalCashOut: { increment: totalPurchaseAmount },
                            totalExpense: { increment: totalPurchaseAmount }
                        }
                    });

                    await tsx.accountTransaction.create({
                        data: {
                            userId: userId,
                            type: "PURCHASE",
                            amount: totalPurchaseAmount,
                            note: `Initial stock for ${product.name}`,
                            purchaseId: purchase.id,
                            dailyBalanceId: dailyBalance.id
                        }
                    });
                }

                return {
                    status: "success",
                    message: existingProduct ? "Product Reactivated and Variants Added!" : "Product Addition Successful!"
                };
            });
        } catch (error) {
            console.error("Create product error:", error);
            if (error instanceof ConflictException) throw error;
            throw new InternalServerErrorException("Failed to Create Product");
        }
    }

    async deleteProduct(productId: string, userId: string): Promise<CategoryResponseDto> {
        try {
            await this.database.prisma.$transaction(async (tsx: Prisma.TransactionClient) => {
                const product = await tsx.product.findUnique({
                    where: {
                        id: productId,
                        userId: userId
                    }
                });

                if (!product) {
                    throw new NotFoundException({
                        status: "error",
                        message: "Product Not found for this user"
                    });
                }

                // Soft delete product
                await tsx.product.update({
                    where: {
                        id: productId
                    },
                    data: {
                        deletedAt: new Date()
                    }
                });

                // Soft delete all variants
                await tsx.productVariant.updateMany({
                    where: {
                        productId: productId
                    },
                    data: {
                        deletedAt: new Date(),
                        status: 'IN_ACTIVE' // Also mark as inactive to be safe against active queries
                    }
                });
            });

            return {
                status: "success",
                message: "Product Deleted Successfully",
            };
        } catch (error: any) {
            if (
                error instanceof NotFoundException ||
                error instanceof ConflictException
            ) {
                throw error;
            }
            throw new InternalServerErrorException("Failed to delete product", error);
        }
    }

    async updateProduct(productId: string, userId: string, updateData: any): Promise<CategoryResponseDto> {
        try {
            await this.database.prisma.$transaction(async (tsx: Prisma.TransactionClient) => {
                const product = await tsx.product.findUnique({
                    where: {
                        id: productId,
                        userId: userId
                    },
                    include: {
                        category: true,
                        variants: true
                    }
                });

                if (!product) {
                    throw new NotFoundException("Product not found");
                }

                const newCategory = await tsx.category.findUnique({
                    where: {
                        id: updateData.categoryId,
                        userId: userId
                    }
                });

                if (!newCategory) {
                    throw new NotFoundException("Category not found or access denied");
                }

                if (updateData.name !== product.name || updateData.categoryId !== product.categoryId) {
                    const duplicateProduct = await tsx.product.findFirst({
                        where: {
                            name: updateData.name,
                            categoryId: updateData.categoryId,
                            userId: userId,
                            NOT: { id: productId },
                            deletedAt: null // Only check against active products meant for duplicate check
                        }
                    });

                    if (duplicateProduct) {
                        throw new ConflictException(
                            `Product "${updateData.name}" already exists in category "${newCategory.name}"`
                        );
                    }
                }

                await tsx.product.update({
                    where: { id: productId },
                    data: {
                        name: updateData.name,
                        categoryId: updateData.categoryId
                    }
                });

                // Handle Variants
                if (updateData.variants) {
                    const incomingVariants = updateData.variants;
                    const existingVariants = product.variants;

                    // 1. Update existing variants
                    for (const variant of incomingVariants) {
                        if (variant.id) {
                            const existing = existingVariants.find(v => v.id === variant.id);
                            if (existing) {
                                await tsx.productVariant.update({
                                    where: { id: variant.id },
                                    data: {
                                        costPrice: variant.costPrice,
                                        sellingPrice: variant.sellingPrice,
                                        stock: variant.stock,
                                        // attributes update implementation if needed
                                    }
                                });
                                // Update attributes if provided
                                if (variant.attributes) {
                                     // Delete existing attributes for this variant
                                    await tsx.variantAttribute.deleteMany({
                                        where: { variantId: variant.id }
                                    });
                                     // Create new attributes
                                    for (const attr of variant.attributes) {
                                        if (attr.name && attr.value) {
                                            await tsx.variantAttribute.create({
                                                data: {
                                                    variantId: variant.id,
                                                    name: attr.name,
                                                    value: attr.value
                                                }
                                            });
                                        }
                                    }
                                }
                            }
                        } else {
                            // 2. Create new variants
                            // We need to generate SKU and Barcode for new variants
                            // Re-using logic from createProduct or addVariant might be complex due to transaction context
                            // Let's reimplement briefly or call helper methods if they were static/public
                            
                            // Calculate proper sequence for SKU
                             const currentVariantCount = await tsx.productVariant.count({ where: { productId } }); 
                             const sku = await this.generateSku(newCategory.name, updateData.name, currentVariantCount, tsx); // Need to handle iteration index offset if adding multiple
                             // Note: generateSku logic uses total count, might collide if adding multiple in loop. 
                             // Better to use current count + index
                             // But let's keep it simple for now, maybe use uuid for sku temp? No, format matters.
                             
                             // Actually generateSku uses `variantCount + sequence + 1`. 
                             // We should probably rely on `addVariant` logic but adapted for transaction.
                             
                            const barcode = await this.generateUniqueBarcode(tsx);
                            
                            const newVariant = await tsx.productVariant.create({
                                data: {
                                    productId: product.id,
                                    sku: sku + "-" + Math.random().toString(36).substring(7), // Quick fix for sku uniqueness in loop without complex calc, or just let generateSku handle it if we pass correct sequence
                                    // Let's try to do it right:
                                    // We can't easily rely on global count in loop. 
                                    // Let's just key off timestamp for now or reuse generateSku with offset?
                                    // I'll reuse generateSku but I need to be careful about sequence.
                                    // For now, I'll essentially replicate `addVariant` logic inside
                                    
                                    barcode: barcode,
                                    costPrice: variant.costPrice,
                                    sellingPrice: variant.sellingPrice,
                                    stock: variant.stock,
                                    status: "ACTIVE"
                                }
                            });

                             if (variant.attributes?.length > 0) {
                                for (const attr of variant.attributes) {
                                    if (attr.name && attr.value) {
                                        await tsx.variantAttribute.create({
                                            data: {
                                                variantId: newVariant.id,
                                                name: attr.name,
                                                value: attr.value
                                            }
                                        });
                                    }
                                }
                            }
                        }
                    }

                    // 3. Delete removed variants
                    // Identify variants in DB that are NOT in incoming list
                    const incomingIds = incomingVariants.filter((v: any) => v.id).map((v: any) => v.id);
                    const variantsToDelete = existingVariants.filter(v => !incomingIds.includes(v.id));

                    for (const v of variantsToDelete) {
                        // Soft delete instead of hard delete
                         await tsx.productVariant.update({
                            where: { id: v.id },
                            data: { deletedAt: new Date(), status: 'IN_ACTIVE' }
                        });
                    }
                }
            });

            return {
                status: "success",
                message: "Product updated successfully"
            };
        } catch (error: any) {
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

    async addVariant(variantDetail: any, productId: string, userId: string): Promise<CategoryResponseDto> {
        try {
            await this.database.prisma.$transaction(async (tsx: Prisma.TransactionClient) => {
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
                    variantsCount + 1,
                    tsx
                );

                const barcode = await this.generateUniqueBarcode(tsx);

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
                        (attribute: any) =>
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
        } catch (error: any) {
            if (error instanceof NotFoundException) {
                throw error;
            }

            console.error("Add variant error:", error);
            throw new InternalServerErrorException("Failed to add variant", error);
        }
    }

    async listProductsWithVariant(userId: string): Promise<any> {
        try {
            const products = await this.database.prisma.product.findMany({
                where: {
                    userId: userId,
                    deletedAt: null // Filter out deleted products
                },
                include: {
                    variants: {
                        where: { deletedAt: null }, // Filter out deleted variants
                        include: {
                            attributes: true
                        }
                    }
                }
            });

            if (!products) {
                throw new NotFoundException({
                    status: "error",
                    message: "Product Not found"
                });
            }

            return {
                status: "success",
                message: "Product Returned Successfully",
                data: products
            };
        } catch (error: any) {
            console.log(error);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException("Internal Server Error", error);
        }
    }

    async updateProductVariant(updateProductVariantDto: any, userId: string, productVariantId: string): Promise<CategoryResponseDto> {
        try {
            return await this.database.prisma.$transaction(async (tsx: Prisma.TransactionClient) => {
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
												stock: updateProductVariantDto.stock,
                        status: updateProductVariantDto.status
                    }
                });

								if (updateProductVariantDto.attributes) {
										await tsx.variantAttribute.deleteMany({
												where: { variantId: productVariantId }
										});

										for (const attr of updateProductVariantDto.attributes) {
												if (attr.name && attr.value) {
														await tsx.variantAttribute.create({
																data: {
																		variantId: productVariantId,
																		name: attr.name,
																		value: attr.value
																}
														});
												}
										}
								}

                return {
                    status: "success",
                    message: "Variant updated successfully",
                };
            });
        } catch (error: any) {
            if (error instanceof NotFoundException) {
                throw error;
            }

            throw new InternalServerErrorException("Variant Updation Failed", error);
        }
    }

    async deleteProductVariant(productId: string, userId: string, productVariantId: string): Promise<CategoryResponseDto> {
        try {
            return await this.database.prisma.$transaction(async (tsx: Prisma.TransactionClient) => {
                const product = await tsx.product.findUnique({
                    where: {
                        id: productId,
                        userId: userId
                    }
                });

                if (!product) {
                    throw new NotFoundException("Product not found");
                }

                // Soft delete variant
                await tsx.productVariant.update({
                    where: {
                        id: productVariantId,
                        productId: productId,
                    },
                    data: {
                        deletedAt: new Date(),
                        status: 'IN_ACTIVE'
                    }
                });

                return {
                    status: "success",
                    message: "Variant deleted successfully",
                };
            });
        } catch (error: any) {
            if (error instanceof NotFoundException) {
                throw error;
            }

            throw new InternalServerErrorException("Variant Deletion Failed", error);
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
            includeDeleted = false,
            status
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
                        ...(minPrice !== undefined && { gte: minPrice }),
                        ...(maxPrice !== undefined && { lte: maxPrice })
                    }
                }
            };
        }

        if (status) {
            if (status === 'OUT_OF_STOCK') {
                where.variants = {
                    every: { stock: 0 }
                };
            } else if (status === 'IN_ACTIVE') {
                 where.AND = [
                    ...(where.AND || []),
                    { variants: { some: { stock: { gt: 0 } } } },
                    { variants: { every: { status: 'IN_ACTIVE' } } }
                ];
            } else if (status === 'ACTIVE') {
                 where.AND = [
                    ...(where.AND || []),
                    { variants: { some: { stock: { gt: 0 } } } },
                    { variants: { some: { status: 'ACTIVE' } } }
                ];
            }
        }

        console.log("ProductService - Prisma Where:", JSON.stringify(where, null, 2));

        const total = await this.database.prisma.product.count({ where });

        const products = await this.database.prisma.product.findMany({
            where,
            skip,
            take: Number(limit),
            orderBy: {
                [sortBy]: sortOrder
            },
            include: {
                category: {
                    select: { name: true }
                },
                variants: {
                    where: { status: "ACTIVE" },
                    include: {
                        attributes: true
                    }
                }
            }
        });

        const formattedProducts = products.map(product => {
            const totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0);
            
            // Determine status based on variants
            let status = 'active';
            if (totalStock === 0) {
                status = 'out-of-stock';
            } else if (product.variants.every(v => v.status === 'IN_ACTIVE')) {
                status = 'inactive';
            }

            return {
                id: product.id,
                productName: product.name,
                category: product.category.name,
                totalStock,
                variantCount: product.variants.length,
                status,
                variants: product.variants.map(v => ({
                    id: v.id,
                    sku: v.sku,
                    barcode: v.barcode,
                    attributes: v.attributes.map(attr => ({
                        name: attr.name,
                        value: attr.value
                    })),
                    price: Number(v.sellingPrice),
                    costPrice: Number(v.costPrice),
                    stock: v.stock,
                    lowStock: v.stock < (lowStock || 10), // Use provided threshold or default to 10
                    status: v.status
                }))
            };
        });

        const totalPages = Math.ceil(total / limit);
        const hasNext = page < totalPages;
        const hasPrev = page > 1;

        return {
            status: 'success',
            message: 'Products retrieved successfully',
            data: formattedProducts,
            meta: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages,
                hasNext,
                hasPrev
            }
        };
    }

    private async generateSku(categoryName: string, productName: string, sequence: number, tsx?: Prisma.TransactionClient): Promise<string> {
        const client = tsx || this.database.prisma;
        const variantCount = await client.productVariant.count();

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

    private async generateUniqueBarcode(tsx?: Prisma.TransactionClient): Promise<string> {
        const client = tsx || this.database.prisma;
        let barcode: string;
        let isUnique = false;
        let attempts = 0;
        const maxAttempts = 10;

        while (!isUnique && attempts < maxAttempts) {
            barcode = this.generateCandidateBarcode();

            const exists = await client.productVariant.findUnique({
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

import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import { Prisma, ProductStatus, ProductVariant, VariantAttribute } from "@kosh/db";
import { ProductResponse } from "./entities/productResponse.entity";
import { ProductFilterInput } from "./dto/productFilter.input";
import { CreateProductInput } from "./dto/createProductInput";
import { UpdateProductInput } from "./dto/updateProductInput";
import { UpdateProductVariantInput } from "./dto/updateProductVariant.input";
import { VariantInput } from "./dto/variant.input";

@Injectable()
export class ProductService {
    constructor(private readonly database: DatabaseService) { }

    async createProduct(userId: string, storeId: string, productDetail: CreateProductInput): Promise<ProductResponse> {
        try {
            return await this.database.prisma.$transaction(async (tsx: Prisma.TransactionClient) => {
                const category = await tsx.category.findUnique({
                    where: { id: productDetail.categoryId }
                });
                if (!category) throw new ConflictException("Category doesn't exist");

                const existingProduct = await tsx.product.findFirst({
                    where: { name: productDetail.name, categoryId: productDetail.categoryId, storeId }
                });

                let product;
                if (existingProduct) {
                    if (!existingProduct.deletedAt) throw new ConflictException("Product already exists");
                    product = await tsx.product.update({
                        where: { id: existingProduct.id },
                        data: { deletedAt: null }
                    });
                } else {
                    product = await tsx.product.create({
                        data: { name: productDetail.name, categoryId: productDetail.categoryId, storeId }
                    });
                }

                let totalPurchaseAmount = Prisma.Decimal(0);
                const variantCreationPromises = productDetail.variants.map(async (v, index) => {
                    const sku = await this.generateSku(category.name, product.name, index, tsx);
                    const barcode = await this.generateUniqueBarcode(storeId, tsx);

                    const cost = Prisma.Decimal(v.costPrice);
                    totalPurchaseAmount = totalPurchaseAmount.add(cost.mul(v.stock));

                    return tsx.productVariant.create({
                        data: {
                            productId: product.id,
                            storeId,
                            sku,
                            barcode,
                            costPrice: v.costPrice,
                            sellingPrice: v.sellingPrice,
                            stock: v.stock,
                            status: "ACTIVE",
                            attributes: v.attributes ? {
                                create: v.attributes.map(attr => ({
                                    name: attr.name,
                                    value: attr.value
                                }))
                            } : undefined
                        }
                    });
                });

                const createdVariants = await Promise.all(variantCreationPromises);

                if (productDetail.keepPurchaseRecord && totalPurchaseAmount.gt(0)) {
                    const purchase = await tsx.purchase.create({
                        data: {
                            storeId,
                            userId,
                            supplierName: productDetail.supplierName || "Initial Stock",
                            total: totalPurchaseAmount,
                            amountPaid: totalPurchaseAmount,
                            balanceDue: 0,
                            status: "PAID",
                            items: {
                                create: createdVariants.map(v => ({
                                    variantId: v.id,
                                    quantity: v.stock,
                                    price: v.costPrice
                                }))
                            }
                        }
                    });

                    const today = new Date();
                    const todayStr = today.toISOString().split("T")[0];

                    const dailyBalance = await tsx.dailyBalance.upsert({
                        where: { storeId_date: { storeId, date: todayStr } },
                        update: {
                            closingCash: { decrement: totalPurchaseAmount },
                            totalCashOut: { increment: totalPurchaseAmount },
                            totalExpense: { increment: totalPurchaseAmount }
                        },
                        create: {
                            storeId,
                            date: todayStr,
                            openingCash: 0,
                            closingCash: totalPurchaseAmount.negated(),
                            totalCashOut: totalPurchaseAmount,
                            totalExpense: totalPurchaseAmount
                        }
                    });

                    await tsx.accountTransaction.create({
                        data: {
                            storeId,
                            type: "PURCHASE",
                            amount: totalPurchaseAmount,
                            note: `Initial stock for ${product.name}`,
                            purchaseId: purchase.id,
                            dailyBalanceId: dailyBalance.id
                        }
                    });
                }

                const finalData = await tsx.product.findUnique({
                    where: { id: product.id },
                    include: {
                        category: true,
                        variants: {
                            include: { attributes: true }
                        }
                    }
                });

                return {
                    success: true,
                    message: existingProduct ? "Product Reactivated!" : "Product Created!",
                    data: [this.formatProduct(finalData!)]
                };
            });
        } catch (error) {
            console.error(`Create Product Error: ${error.message}`, error.stack);
            if (error instanceof ConflictException) throw error;
            throw new InternalServerErrorException("Failed to process product creation");
        }
    }
    async deleteProduct(productId: string, storeId: string): Promise<ProductResponse> {
        try {
            await this.database.prisma.$transaction(async (tsx: Prisma.TransactionClient) => {
                const product = await tsx.product.findUnique({
                    where: {
                        id: productId,
                        storeId: storeId
                    }
                });

                if (!product) {
                    throw new NotFoundException({
                        status: "error",
                        message: "Product Not found for this user"
                    });
                }

                const deletionDate = new Date()
                await tsx.product.update({
                    where: {
                        id: productId
                    },
                    data: {
                        deletedAt: deletionDate
                    }
                });

                await tsx.productVariant.updateMany({
                    where: {
                        productId: productId
                    },
                    data: {
                        deletedAt: deletionDate,
                        status: 'IN_ACTIVE'
                    }
                });
            });

            return {
                success: true,
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

    async updateProduct(productId: string, storeId: string, updateData: UpdateProductInput): Promise<ProductResponse> {
        try {
            return await this.database.prisma.$transaction(async (tsx: Prisma.TransactionClient) => {
                const existingProduct = await tsx.product.findUnique({
                    where: { id: productId, storeId },
                    include: { variants: { where: { deletedAt: null } } }
                });

                if (!existingProduct) throw new NotFoundException("Product not found");

                const categoryId = updateData.categoryId || existingProduct.categoryId;
                const category = await tsx.category.findUnique({
                    where: { id: categoryId, storeId }
                });
                if (!category) throw new NotFoundException("Category not found");

                if (updateData.name !== existingProduct.name || updateData.categoryId !== existingProduct.categoryId) {
                    const isDuplicate = await tsx.product.findFirst({
                        where: {
                            name: updateData.name,
                            categoryId,
                            storeId,
                            NOT: { id: productId },
                            deletedAt: null
                        }
                    });
                    if (isDuplicate) throw new ConflictException(`Product "${updateData.name}" already exists in this category`);
                }

                await tsx.product.update({
                    where: { id: productId },
                    data: {
                        name: updateData.name,
                        categoryId: updateData.categoryId
                    }
                });

                if (updateData.variants) {
                    const incomingVariants = updateData.variants;
                    const existingVariantIds = existingProduct.variants.map(v => v.id);
                    const incomingVariantIds = incomingVariants.filter(v => v.id).map(v => v.id);

                    const idsToDelete = existingVariantIds.filter(id => !incomingVariantIds.includes(id));
                    if (idsToDelete.length > 0) {
                        await tsx.productVariant.updateMany({
                            where: { id: { in: idsToDelete } },
                            data: { deletedAt: new Date(), status: 'IN_ACTIVE' }
                        });
                    }

                    let newVariantSequence = existingVariantIds.length;

                    for (const v of incomingVariants) {
                        if (v.id) {
                            await tsx.productVariant.update({
                                where: { id: v.id },
                                data: {
                                    costPrice: v.costPrice,
                                    sellingPrice: v.sellingPrice,
                                    stock: v.stock,
                                    attributes: v.attributes ? {
                                        deleteMany: {},
                                        create: v.attributes.map(a => ({ name: a.name, value: a.value }))
                                    } : undefined
                                }
                            });
                        } else {
                            const sku = await this.generateSku(category.name, updateData.name || existingProduct.name, newVariantSequence++, tsx);
                            const barcode = await this.generateUniqueBarcode(storeId, tsx);

                            await tsx.productVariant.create({
                                data: {
                                    productId,
                                    storeId,
                                    sku,
                                    barcode,
                                    costPrice: v.costPrice,
                                    sellingPrice: v.sellingPrice,
                                    stock: v.stock,
                                    status: "ACTIVE",
                                    attributes: v.attributes ? {
                                        create: v.attributes.map(a => ({ name: a.name, value: a.value }))
                                    } : undefined
                                }
                            });
                        }
                    }
                }

                const updatedProduct = await tsx.product.findUnique({
                    where: { id: productId },
                    include: {
                        category: true,
                        variants: {
                            where: { deletedAt: null },
                            include: { attributes: true }
                        }
                    }
                });

                return {
                    success: true,
                    message: "Product updated successfully",
                    data: [this.formatProduct(updatedProduct)]
                };
            });
        } catch (error) {
            console.error(`Update Product Error: ${error.message}`, error.stack);

            if (
                error instanceof NotFoundException ||
                error instanceof ConflictException
            ) {
                throw error;
            }
            throw new InternalServerErrorException("Failed to update product");
        }
    }

    async addVariant(variantDetail: VariantInput, productId: string, storeId: string): Promise<ProductResponse> {
        try {
            return await this.database.prisma.$transaction(async (tsx: Prisma.TransactionClient) => {
                const product = await tsx.product.findUnique({
                    where: {
                        id: productId,
                        storeId: storeId
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

                const barcode = await this.generateUniqueBarcode(storeId, tsx);

                const productVariant = await tsx.productVariant.create({
                    data: {
                        storeId,
                        productId: product.id,
                        sku: sku,
                        barcode: barcode,
                        costPrice: variantDetail.costPrice,
                        sellingPrice: variantDetail.sellingPrice,
                        stock: variantDetail.stock,
                        status: "ACTIVE"
                    }
                });

                if (variantDetail.attributes && variantDetail.attributes.length > 0) {
                    const attributePromises = variantDetail.attributes.map(
                        (attribute: VariantAttribute) =>
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

                const updatedProduct = await tsx.product.findUnique({
                    where: { id: productId },
                    include: {
                        category: true,
                        variants: {
                            where: { deletedAt: null },
                            include: { attributes: true }
                        }
                    }
                });

                return {
                    success: true,
                    message: "Variant added successfully",
                    data: updatedProduct ? [this.formatProduct(updatedProduct)] : []
                };
            });
        } catch (error: any) {
            if (error instanceof NotFoundException) {
                throw error;
            }

            console.error("Add variant error:", error);
            throw new InternalServerErrorException("Failed to add variant", error);
        }
    }

    async listProductsWithVariant(storeId: string): Promise<ProductResponse> {
        try {
            const products = await this.database.prisma.product.findMany({
                where: {
                    storeId: storeId,
                    deletedAt: null
                },
                include: {
                    category: {
                        select: { name: true }
                    },
                    variants: {
                        where: { deletedAt: null },
                        include: {
                            attributes: true
                        }
                    }
                }
            });

            if (!products) {
                throw new NotFoundException({
                    success: false,
                    message: "Product Not found"
                });
            }

            const formattedProducts = products.map(product => this.formatProduct(product));

            return {
                success: true,
                message: "Product Returned Successfully",
                data: formattedProducts
            };
        } catch (error: any) {
            console.log(error);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException("Internal Server Error", error);
        }
    }
    async updateProductVariant(
        updateProductVariantDto: UpdateProductVariantInput,
        storeId: string,
        productVariantId: string
    ): Promise<ProductResponse> {
        try {
            return await this.database.prisma.$transaction(async (tsx: Prisma.TransactionClient) => {
                const variantToUpdate = await tsx.productVariant.findFirst({
                    where: {
                        id: productVariantId,
                        product: {
                            id: updateProductVariantDto.productId,
                            storeId: storeId
                        }
                    }
                });

                if (!variantToUpdate) {
                    throw new NotFoundException("Variant not found or access denied");
                }

                await tsx.productVariant.update({
                    where: { id: productVariantId },
                    data: {
                        costPrice: updateProductVariantDto.costPrice,
                        sellingPrice: updateProductVariantDto.sellingPrice,
                        stock: updateProductVariantDto.stock,
                        status: updateProductVariantDto.status as ProductStatus || ProductStatus.ACTIVE,
                        attributes: updateProductVariantDto.attributes ? {
                            deleteMany: {},
                            create: updateProductVariantDto.attributes
                                .filter((attr) => attr.name && attr.value)
                                .map((attr) => ({
                                    name: attr.name,
                                    value: attr.value
                                }))
                        } : undefined
                    }
                });

                const updatedProduct = await tsx.product.findUnique({
                    where: { id: updateProductVariantDto.productId },
                    include: {
                        category: true,
                        variants: {
                            where: { deletedAt: null },
                            include: { attributes: true }
                        }
                    }
                });

                return {
                    success: true,
                    message: "Variant updated successfully",
                    data: updatedProduct ? [this.formatProduct(updatedProduct)] : []
                };
            });
        } catch (error: any) {
            console.error(`Variant Update Error: ${error.message}`, error.stack);
            if (error instanceof NotFoundException) throw error;
            throw new InternalServerErrorException("Variant Updation Failed");
        }
    }


    async deleteProductVariant(productId: string, storeId: string, productVariantId: string): Promise<ProductResponse> {
        try {
            return await this.database.prisma.$transaction(async (tsx: Prisma.TransactionClient) => {
                const product = await tsx.product.findUnique({
                    where: {
                        id: productId,
                        storeId: storeId
                    }
                });

                if (!product) {
                    throw new NotFoundException("Product not found");
                }

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

                const updatedProduct = await tsx.product.findUnique({
                    where: { id: productId },
                    include: {
                        category: true,
                        variants: {
                            where: { deletedAt: null },
                            include: { attributes: true }
                        }
                    }
                });

                return {
                    success: true,
                    message: "Variant deleted successfully",
                    data: updatedProduct ? [this.formatProduct(updatedProduct)] : []
                };
            });
        } catch (error: any) {
            if (error instanceof NotFoundException) {
                throw error;
            }

            throw new InternalServerErrorException("Variant Deletion Failed", error);
        }
    }

    async listProductsWithFilters(storeId: string, filterDto: ProductFilterInput): Promise<ProductResponse> {
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
            storeId,
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
                    select: { id: true, name: true }
                },
                variants: {
                    where: { status: "ACTIVE" },
                    include: {
                        attributes: true
                    }
                }
            }
        });

        const formattedProducts = products.map(product => this.formatProduct(product, lowStock));

        const totalPages = Math.ceil(total / limit);
        const hasNext = page < totalPages;
        const hasPrev = page > 1;

        return {
            success: true,
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

    private async generateUniqueBarcode(storeId: string, tsx?: Prisma.TransactionClient): Promise<string> {
        const client = tsx || this.database.prisma;
        let barcode: string;
        let isUnique = false;
        let attempts = 0;
        const maxAttempts = 10;

        while (!isUnique && attempts < maxAttempts) {
            barcode = this.generateCandidateBarcode();

            const exists = await client.productVariant.findUnique({
                where: { storeId_barcode: { storeId, barcode } }
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

    private formatProduct(product: any, lowStockThreshold?: number): any {
        const totalStock = product.variants.reduce((acc: number, v: any) => acc + (v.stock || 0), 0);

        let status = 'active';
        if (totalStock === 0) {
            status = 'out-of-stock';
        } else if (product.variants.every((v: ProductVariant) => v.status === 'IN_ACTIVE')) {
            status = 'inactive';
        }
        return {
            id: product.id,
            productName: product.name,
            category: {
                id: product.category.id,
                name: product.category.name || "uncategorized"
            },
            totalStock,
            variantCount: product.variants.length,
            status,
            variants: product.variants.map((v: any) => ({
                id: v.id,
                sku: v.sku,
                barcode: v.barcode,
                attributes: v.attributes.map((attr: VariantAttribute) => ({
                    name: attr.name,
                    value: attr.value
                })),
                price: Number(v.sellingPrice),
                costPrice: Number(v.costPrice),
                sellingPrice: Number(v.sellingPrice),
                stock: Number(v.stock),
                lowStock: v.stock < (lowStockThreshold || 10),
                status: v.status
            }))
        }
    }
}

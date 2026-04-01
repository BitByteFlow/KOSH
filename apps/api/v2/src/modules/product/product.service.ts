import {
	BadRequestException,
	ConflictException,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
} from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import {
	Prisma,
	ProductStatus,
	ProductVariant,
	VariantAttribute,
} from "@kosh/db";
import { ProductResponse } from "./entities/productResponse.entity";
import { ProductFilterInput } from "./dto/productFilter.input";
import { CreateProductInput } from "./dto/createProductInput";
import { UpdateProductInput } from "./dto/updateProductInput";
import { UpdateProductVariantInput } from "./dto/updateProductVariant.input";
import { VariantInput } from "./dto/variant.input";

@Injectable()
export class ProductService {
	constructor(private readonly database: DatabaseService) {}

	async createProduct(
		userId: string,
		storeId: string,
		productDetail: CreateProductInput,
	): Promise<ProductResponse> {
		try {
			const preparedVariants = productDetail.variants.map((v, index) => {
				const sku = this.generateSkuOffline(
					productDetail.categoryName,
					productDetail.name,
					index,
					storeId,
				);
				const barcode = this.generateBarcodeOffline(storeId, sku);

				return { ...v, sku, barcode };
			});
			return await this.database.prisma.$transaction(
				async (tsx: Prisma.TransactionClient) => {
					const category = await tsx.category.findUnique({
						where: { id: productDetail.categoryId },
					});
					if (!category) throw new ConflictException("Category doesn't exist");

					const existingProduct = await tsx.product.findFirst({
						where: { name: productDetail.name, storeId },
					});

					let product: any;
					if (existingProduct) {
						if (!existingProduct.deletedAt) {
							throw new ConflictException("Product already exists");
						}
						product = await tsx.product.update({
							where: {
								id: existingProduct.id,
							},
							data: {
								deletedAt: null,
							},
						});
					} else {
						product = await tsx.product.create({
							data: {
								name: productDetail.name,
								categoryId: productDetail.categoryId,
								storeId,
							},
						});
					}
					await tsx.productVariant.createMany({
						data: preparedVariants.map((v) => ({
							productId: product.id,
							storeId,
							sku: v.sku,
							barcode: v.barcode,
							costPrice: v.costPrice,
							sellingPrice: v.sellingPrice,
							stock: v.stock,
							status: "ACTIVE",
						})),
					});

					const createdVariants = await tsx.productVariant.findMany({
						where: { productId: product.id },
					});

					const allAttributes = preparedVariants.flatMap((v, index) => {
						const variant = createdVariants[index];
						return (v.attributes || []).map((attr) => ({
							variantId: variant.id,
							name: attr.name,
							value: attr.value,
						}));
					});
					if (allAttributes.length > 0) {
						await tsx.variantAttribute.createMany({
							data: allAttributes,
						});
					}
					let totalPurchaseAmount = new Prisma.Decimal(0);
					if (productDetail.keepPurchaseRecord) {
						totalPurchaseAmount = preparedVariants.reduce(
							(sum, v) => sum.add(new Prisma.Decimal(v.costPrice).mul(v.stock)),
							new Prisma.Decimal(0),
						);

						if (totalPurchaseAmount.gt(0)) {
							const purchase = await tsx.purchase.create({
								data: {
									storeId,
									userId,
									supplierName: productDetail.supplierName || "Initial Stock",
									total: totalPurchaseAmount,
									amountPaid: totalPurchaseAmount,
									balanceDue: 0,
									status: "PAID",
								},
							});

							await tsx.purchaseItem.createMany({
								data: createdVariants.map((v, index) => {
									const variantInput = preparedVariants[index];
									return {
										purchaseId: purchase.id,
										variantId: v.id,
										quantity: variantInput.stock,
										price: variantInput.costPrice,
									};
								}),
							});

							const today = new Date();
							const todayStr = today.toISOString().split("T")[0];

							const dailyBalance = await tsx.dailyBalance.upsert({
								where: { storeId_date: { storeId, date: todayStr } },
								update: {
									closingCash: { decrement: totalPurchaseAmount },
									totalCashOut: { increment: totalPurchaseAmount },
									totalExpense: { increment: totalPurchaseAmount },
								},
								create: {
									storeId,
									date: todayStr,
									openingCash: 0,
									closingCash: totalPurchaseAmount.negated(),
									totalCashOut: totalPurchaseAmount,
									totalExpense: totalPurchaseAmount,
								},
							});

							await tsx.accountTransaction.create({
								data: {
									storeId,
									type: "PURCHASE",
									amount: totalPurchaseAmount,
									note: `Initial stock for ${product.name}`,
									purchaseId: purchase.id,
									dailyBalanceId: dailyBalance.id,
								},
							});
						}
					}

					const finalData = await tsx.product.findUnique({
						where: { id: product.id },
						include: {
							category: true,
							variants: { include: { attributes: true } },
						},
					});

					return {
						success: true,
						message: existingProduct
							? "Product Reactivated!"
							: "Product Created!",
						data: [this.formatProduct(finalData!)],
					};
				},
				{
					timeout: 10000, // 10 seconds max
				},
			);
		} catch (error) {
			if (error.code === "P2002") {
				const fields = error.meta?.target as string[];
				if (fields?.includes("sku")) {
					throw new ConflictException(
						"SKU conflict detected. Please try again with different product details.",
					);
				}
				if (fields?.includes("barcode")) {
					throw new ConflictException(
						"Barcode conflict detected. Please try again.",
					);
				}
				if (fields?.includes("name")) {
					throw new ConflictException("Product with this name already exists");
				}
			}
			if (
				error instanceof ConflictException ||
				error instanceof NotFoundException ||
				error instanceof BadRequestException
			) {
				throw error;
			}
			throw new InternalServerErrorException(
				`Failed to process product creation: ${error.message}`,
			);
		}
	}

	async deleteProduct(
		productId: string,
		storeId: string,
	): Promise<ProductResponse> {
		try {
			await this.database.prisma.$transaction(
				async (tsx: Prisma.TransactionClient) => {
					const product = await tsx.product.findUnique({
						where: {
							id: productId,
							storeId: storeId,
						},
					});

					if (!product) {
						throw new NotFoundException({
							status: "error",
							message: "Product Not found for this user",
						});
					}

					const deletionDate = new Date();
					await tsx.product.update({
						where: {
							id: productId,
						},
						data: {
							deletedAt: deletionDate,
						},
					});

					await tsx.productVariant.updateMany({
						where: {
							productId: productId,
						},
						data: {
							deletedAt: deletionDate,
							status: "IN_ACTIVE",
						},
					});
				},
			);

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

	async updateProduct(
		productId: string,
		storeId: string,
		updateData: UpdateProductInput,
	): Promise<ProductResponse> {
		try {
			return await this.database.prisma.$transaction(
				async (tsx: Prisma.TransactionClient) => {
					// Lock the store record to serialize SKU generation/updates for this store
					await tsx.$executeRaw`SELECT 1 FROM "Store" WHERE id = ${storeId} FOR UPDATE`;

					const existingProduct = await tsx.product.findUnique({
						where: { id: productId, storeId },
						include: { variants: { where: { deletedAt: null } } },
					});

					if (!existingProduct)
						throw new NotFoundException("Product not found");

					const categoryId =
						updateData.categoryId || existingProduct.categoryId;
					const category = await tsx.category.findUnique({
						where: { id: categoryId, storeId },
					});
					if (!category) throw new NotFoundException("Category not found");

					if (
						updateData.name !== existingProduct.name ||
						updateData.categoryId !== existingProduct.categoryId
					) {
						const isDuplicate = await tsx.product.findFirst({
							where: {
								name: updateData.name,
								storeId,
								NOT: { id: productId },
								deletedAt: null,
							},
						});
						if (isDuplicate)
							throw new ConflictException(
								`Product "${updateData.name}" already exists in this category`,
							);
					}

					await tsx.product.update({
						where: { id: productId },
						data: {
							name: updateData.name !== undefined ? updateData.name : undefined,
							categoryId:
								updateData.categoryId !== undefined
									? updateData.categoryId
									: undefined,
						},
					});

					if (updateData.variants) {
						const incomingVariants = updateData.variants;
						const existingVariantIds = existingProduct.variants.map(
							(v) => v.id,
						);
						const incomingVariantIds = incomingVariants
							.filter((v) => v.id)
							.map((v) => v.id);

						const idsToDelete = existingVariantIds.filter(
							(id) => !incomingVariantIds.includes(id),
						);
						if (idsToDelete.length > 0) {
							await tsx.productVariant.updateMany({
								where: { id: { in: idsToDelete } },
								data: { deletedAt: new Date(), status: "IN_ACTIVE" },
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
										attributes: v.attributes
											? {
													deleteMany: {},
													create: v.attributes.map((a) => ({
														name: a.name,
														value: a.value,
													})),
												}
											: undefined,
									},
								});
							} else {
								const sku = await this.generateSkuOffline(
									category.name,
									updateData.name || existingProduct.name,
									newVariantSequence++,
									storeId,
								);
								const barcode = await this.generateBarcodeOffline(storeId, sku);

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
										attributes: v.attributes
											? {
													create: v.attributes.map((a) => ({
														name: a.name,
														value: a.value,
													})),
												}
											: undefined,
									},
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
								include: { attributes: true },
							},
						},
					});

					return {
						success: true,
						message: "Product updated successfully",
						data: [this.formatProduct(updatedProduct)],
					};
				},
			);
		} catch (error) {
			console.error(`Update Product Error: ${error.message}`, error.stack);

			if (error.code === "P2002") {
				const fields = error.meta?.target as string[];
				if (fields?.includes("name")) {
					throw new ConflictException("Product with this name already exists");
				}
				if (fields?.includes("sku")) {
					throw new ConflictException("SKU already exists");
				}
				if (fields?.includes("barcode")) {
					throw new ConflictException("Barcode already exists");
				}
			}

			if (
				error instanceof NotFoundException ||
				error instanceof ConflictException ||
				error instanceof BadRequestException
			) {
				throw error;
			}
			throw new InternalServerErrorException(
				`Failed to update product: ${error.message}`,
			);
		}
	}

	async addVariant(
		variantDetail: VariantInput,
		productId: string,
		storeId: string,
	): Promise<ProductResponse> {
		try {
			return await this.database.prisma.$transaction(
				async (tsx: Prisma.TransactionClient) => {
					// Lock the store record to serialize SKU generation
					await tsx.$executeRaw`SELECT 1 FROM "Store" WHERE id = ${storeId} FOR UPDATE`;

					const product = await tsx.product.findUnique({
						where: {
							id: productId,
							storeId: storeId,
						},
						include: {
							category: true,
						},
					});

					if (!product) {
						throw new NotFoundException("Product not found");
					}

					const variantsCount = await tsx.productVariant.count({
						where: { productId: productId },
					});

					const sku = await this.generateSkuOffline(
						product.category.name,
						product.name,
						variantsCount, // Use current variant count as sequence
						storeId,
					);

					const barcode = await this.generateBarcodeOffline(storeId, sku);

					const productVariant = await tsx.productVariant.create({
						data: {
							storeId,
							productId: product.id,
							sku: sku,
							barcode: barcode,
							costPrice: variantDetail.costPrice,
							sellingPrice: variantDetail.sellingPrice,
							stock: variantDetail.stock,
							status: "ACTIVE",
						},
					});

					if (variantDetail.attributes && variantDetail.attributes.length > 0) {
						await tsx.variantAttribute.createMany({
							data: variantDetail.attributes.map(
								(attribute: VariantAttribute) => ({
									variantId: productVariant.id,
									name: attribute.name,
									value: attribute.value,
								}),
							),
						});
					}

					const updatedProduct = await tsx.product.findUnique({
						where: { id: productId },
						include: {
							category: true,
							variants: {
								where: { deletedAt: null },
								include: { attributes: true },
							},
						},
					});

					return {
						success: true,
						message: "Variant added successfully",
						data: updatedProduct ? [this.formatProduct(updatedProduct)] : [],
					};
				},
			);
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
					deletedAt: null,
				},
				include: {
					category: {
						select: { name: true },
					},
					variants: {
						where: { deletedAt: null },
						include: {
							attributes: true,
						},
					},
				},
			});

			if (!products) {
				throw new NotFoundException({
					success: false,
					message: "Product Not found",
				});
			}

			const formattedProducts = products.map((product) =>
				this.formatProduct(product),
			);

			return {
				success: true,
				message: "Product Returned Successfully",
				data: formattedProducts,
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
		productVariantId: string,
	): Promise<ProductResponse> {
		try {
			return await this.database.prisma.$transaction(
				async (tsx: Prisma.TransactionClient) => {
					const variantToUpdate = await tsx.productVariant.findFirst({
						where: {
							id: productVariantId,
							product: {
								id: updateProductVariantDto.productId,
								storeId: storeId,
							},
						},
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
							status:
								(updateProductVariantDto.status as ProductStatus) ||
								ProductStatus.ACTIVE,
							attributes: updateProductVariantDto.attributes
								? {
										deleteMany: {},
										create: updateProductVariantDto.attributes
											.filter((attr) => attr.name && attr.value)
											.map((attr) => ({
												name: attr.name,
												value: attr.value,
											})),
									}
								: undefined,
						},
					});

					const updatedProduct = await tsx.product.findUnique({
						where: { id: updateProductVariantDto.productId },
						include: {
							category: true,
							variants: {
								where: { deletedAt: null },
								include: { attributes: true },
							},
						},
					});

					return {
						success: true,
						message: "Variant updated successfully",
						data: updatedProduct ? [this.formatProduct(updatedProduct)] : [],
					};
				},
			);
		} catch (error: any) {
			console.error(`Variant Update Error: ${error.message}`, error.stack);
			if (error instanceof NotFoundException) throw error;
			throw new InternalServerErrorException("Variant Updation Failed");
		}
	}

	async deleteProductVariant(
		productId: string,
		storeId: string,
		productVariantId: string,
	): Promise<ProductResponse> {
		try {
			return await this.database.prisma.$transaction(
				async (tsx: Prisma.TransactionClient) => {
					const product = await tsx.product.findUnique({
						where: {
							id: productId,
							storeId: storeId,
						},
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
							status: "IN_ACTIVE",
						},
					});

					const updatedProduct = await tsx.product.findUnique({
						where: { id: productId },
						include: {
							category: true,
							variants: {
								where: { deletedAt: null },
								include: { attributes: true },
							},
						},
					});

					return {
						success: true,
						message: "Variant deleted successfully",
						data: updatedProduct ? [this.formatProduct(updatedProduct)] : [],
					};
				},
			);
		} catch (error: any) {
			if (error instanceof NotFoundException) {
				throw error;
			}

			throw new InternalServerErrorException("Variant Deletion Failed", error);
		}
	}

	async listProductsWithFilters(
		storeId: string,
		filterDto: ProductFilterInput,
	): Promise<ProductResponse> {
		const {
			page = 1,
			limit = 10,
			sortBy = "createdAt",
			sortOrder = "desc",
			categoryId,
			lowStock,
			search,
			minPrice,
			maxPrice,
			includeDeleted = false,
			status,
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
				mode: "insensitive",
			};
		}

		if (lowStock) {
			where.variants = {
				some: {
					stock: { lt: lowStock },
					status: "ACTIVE",
				},
			};
		}

		if (minPrice !== undefined || maxPrice !== undefined) {
			where.variants = {
				...where.variants,
				some: {
					...where.variants?.some,
					sellingPrice: {
						...(minPrice !== undefined && { gte: minPrice }),
						...(maxPrice !== undefined && { lte: maxPrice }),
					},
				},
			};
		}

		if (status) {
			if (status === "OUT_OF_STOCK") {
				where.variants = {
					every: { stock: 0 },
				};
			} else if (status === "IN_ACTIVE") {
				where.AND = [
					...(where.AND || []),
					{ variants: { some: { stock: { gt: 0 } } } },
					{ variants: { every: { status: "IN_ACTIVE" } } },
				];
			} else if (status === "ACTIVE") {
				where.AND = [
					...(where.AND || []),
					{ variants: { some: { stock: { gt: 0 } } } },
					{ variants: { some: { status: "ACTIVE" } } },
				];
			}
		}

		const total = await this.database.prisma.product.count({ where });

		const products = await this.database.prisma.product.findMany({
			where,
			skip,
			take: Number(limit),
			orderBy: {
				[sortBy]: sortOrder,
			},
			include: {
				category: {
					select: { id: true, name: true },
				},
				variants: {
					where: { status: "ACTIVE" },
					include: {
						attributes: true,
					},
				},
			},
		});

		const formattedProducts = products.map((product) =>
			this.formatProduct(product, lowStock),
		);

		const totalPages = Math.ceil(total / limit);
		const hasNext = page < totalPages;
		const hasPrev = page > 1;

		return {
			success: true,
			message: "Products retrieved successfully",
			data: formattedProducts,
			meta: {
				page: Number(page),
				limit: Number(limit),
				total,
				totalPages,
				hasNext,
				hasPrev,
			},
		};
	}

	private generateSkuOffline(
		categoryName: string,
		productName: string,
		sequence: number,
		storeId: string,
	): string {
		const catCode = categoryName
			.replace(/[^a-zA-Z]/g, "")
			.substring(0, 3)
			.toUpperCase();

		const prodCode = productName
			.replace(/[^a-zA-Z0-9]/g, "")
			.substring(0, 4)
			.toUpperCase();

		const storeSuffix = storeId.substring(0, 4).toUpperCase();

		const sequenceStr = sequence.toString();
		const randomSuffix = Math.random()
			.toString(36)
			.substring(2, 7)
			.toUpperCase();

		return `${catCode}-${prodCode}-${storeSuffix}-${sequenceStr}-${randomSuffix}`;
	}

	private generateBarcodeOffline(storeId: string, sku: string): string {
		const timestamp = Date.now().toString().slice(-9);

		const storeHash = this.simpleHash(storeId)
			.toString(36)
			.substring(0, 4)
			.toUpperCase();

		const skuHash = this.simpleHash(sku)
			.toString(36)
			.substring(0, 3)
			.toUpperCase();

		const random = Math.floor(Math.random() * 10000)
			.toString()
			.padStart(4, "0");

		return `INT${timestamp}${storeHash}${skuHash}${random}`.toUpperCase();
	}

	private simpleHash(str: string): number {
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			const char = str.charCodeAt(i);
			hash = (hash << 5) - hash + char;
			hash = hash & hash; // Convert to 32-bit integer
		}
		return Math.abs(hash);
	}

	private formatProduct(product: any, lowStockThreshold?: number): any {
		const totalStock = product.variants.reduce(
			(acc: number, v: any) => acc + (v.stock || 0),
			0,
		);

		let status = "active";
		if (totalStock === 0) {
			status = "out-of-stock";
		} else if (
			product.variants.every((v: ProductVariant) => v.status === "IN_ACTIVE")
		) {
			status = "inactive";
		}
		return {
			id: product.id,
			productName: product.name,
			category: {
				id: product.category.id,
				name: product.category.name || "uncategorized",
			},
			totalStock,
			variantCount: product.variants.length,
			status,
			variants: product.variants.map((v: any) => ({
				id: v.id,
				sku: v.sku,
				barcode: v.barcode,
				attributes: v.attributes
					? v.attributes.map((attr: VariantAttribute) => ({
							name: attr.name,
							value: attr.value,
						}))
					: [],
				price: Number(v.sellingPrice),
				costPrice: Number(v.costPrice),
				sellingPrice: Number(v.sellingPrice),
				stock: Number(v.stock),
				lowStock: v.stock < (lowStockThreshold || 10),
				status: v.status,
			})),
		};
	}
}

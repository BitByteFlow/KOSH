import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PaymentStatus, Prisma, ProductVariant } from '@kosh/db';
import { DatabaseService } from 'src/database/database.service';
import { CreatePurchaseInput } from './dto/CreatePurchaseDto.dto';
import { UpdatePurchaseInput } from './dto/UpdatePurchaseDto.dto';
import { Purchase } from './entities/purchase.entity';
import { PurchaseResponse } from './entities/purchaseResponse.entity';


@Injectable()
export class PurchasesService {
    constructor(private readonly database: DatabaseService) { }

    async createPurchase(createPurchaseDto: CreatePurchaseInput, userId: string, storeId: string): Promise<PurchaseResponse> {
        return this.database.prisma.$transaction(async (tsx: Prisma.TransactionClient) => {
            const variantDetails: Array<{ variant: ProductVariant; quantity: number; price: number }> = [];

            for (const item of createPurchaseDto.variants) {
                const variant = await tsx.productVariant.findUnique({
                    where: { id: item.variantId },
                    include: {
                        product: true,
                    }
                });

                if (!variant) {
                    throw new NotFoundException(`Product variant ${item.variantId} not found`);
                }

                if (variant.storeId !== storeId) {
                    throw new NotFoundException(`Product ${variant.product.name} does not belong to this store`);
                }

                variantDetails.push({
                    variant,
                    quantity: item.quantity,
                    price: item.price
                });
            }

            const totalAmount = variantDetails.reduce((sum, item) => {
                return sum + (item.quantity * item.price);
            }, 0);

            const amountPaid = createPurchaseDto.amountPaid || 0;
            const balanceDue = totalAmount - amountPaid;

            if (amountPaid < 0) {
                throw new BadRequestException('Amount paid cannot be negative');
            }
            if (amountPaid > totalAmount) {
                throw new BadRequestException('Amount paid cannot exceed total amount');
            }
            if (balanceDue < 0) {
                throw new BadRequestException('Balance due cannot be negative');
            }

            let status: PaymentStatus;
            if (amountPaid === 0) {
                status = 'PENDING';
            } else if (amountPaid === totalAmount) {
                status = 'PAID';
            } else {
                status = 'PARTIAL';
            }

            const purchase = await tsx.purchase.create({
                data: {
                    storeId,
                    userId,
                    supplierName: createPurchaseDto.supplierName,
                    email: createPurchaseDto.email,
                    contact: createPurchaseDto.contact,
                    total: totalAmount,
                    amountPaid,
                    balanceDue,
                    dueDate: createPurchaseDto.dueDate,
                    status: status,
                    items: {
                        create: variantDetails.map(item => ({
                            variantId: item.variant.id,
                            quantity: item.quantity,
                            price: item.price,
                        })),
                    },
                },
                include: {
                    items: true
                }
            });

            for (const item of variantDetails) {
                await tsx.productVariant.update({
                    where: { id: item.variant.id },
                    data: {
                        stock: { increment: item.quantity },
                        costPrice: item.price,
                    },
                });
            }

            if (amountPaid > 0) {
                const todayStr = new Date().toISOString().split('T')[0];

                let dailyBalance = await tsx.dailyBalance.findUnique({
                    where: {
                        storeId_date: {
                            storeId,
                            date: todayStr,
                        },
                    },
                });

                if (!dailyBalance) {
                    const lastRecord = await tsx.dailyBalance.findFirst({
                        where: { storeId },
                        orderBy: { date: "desc" },
                    });

                    const openingCash = lastRecord?.closingCash || new Prisma.Decimal(0);

                    if (amountPaid > Number(openingCash)) {
                        throw new BadRequestException(`Insufficient funds for purchase. Available: ${openingCash}, Required: ${amountPaid}`);
                    }

                    dailyBalance = await tsx.dailyBalance.create({
                        data: {
                            storeId,
                            date: todayStr,
                            openingCash: openingCash,
                            closingCash: openingCash,
                            totalCashIn: 0,
                            totalCashOut: 0,
                            totalSales: 0,
                            totalExpense: 0,
                        },
                    });
                } else {
                    if (amountPaid > Number(dailyBalance.closingCash)) {
                        throw new BadRequestException(`Insufficient funds for purchase. Available: ${dailyBalance.closingCash}, Required: ${amountPaid}`);
                    }
                }

                await tsx.dailyBalance.update({
                    where: { id: dailyBalance.id },
                    data: {
                        closingCash: { decrement: amountPaid },
                        totalCashOut: { increment: amountPaid },
                        totalExpense: { increment: amountPaid },
                    },
                });

                await tsx.accountTransaction.create({
                    data: {
                        storeId,
                        // userId,
                        type: 'PURCHASE',
                        amount: amountPaid,
                        note: `Purchase #${purchase.id} from ${createPurchaseDto.supplierName}`,
                        dailyBalanceId: dailyBalance.id,
                        purchaseId: purchase.id,
                    },
                });
            }

            return {
                success: true,
                message: 'Purchase created successfully'
            };

        }).catch((error: any) => {
            console.error('Purchase creation error:', error);
            if (error?.status && error?.message) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to create purchase');
        });
    }


    async updatePurchase(updatePurchaseDto: UpdatePurchaseInput, purchaseID: string, userId: string, storeId: string): Promise<PurchaseResponse> {
        return this.database.prisma.$transaction(async (tsx: Prisma.TransactionClient) => {

            const purchase = await tsx.purchase.findUnique({
                where: {
                    id: purchaseID,
                    storeId: storeId
                }
            });

            if (!purchase) {
                throw new NotFoundException("Purchase not found!");
            }

            const updateData: any = {};
            let additionalPayment = 0;

            if (updatePurchaseDto.supplierName !== undefined) updateData.supplierName = updatePurchaseDto.supplierName;
            if (updatePurchaseDto.email !== undefined) updateData.email = updatePurchaseDto.email;
            if (updatePurchaseDto.contact !== undefined) updateData.contact = updatePurchaseDto.contact;
            if (updatePurchaseDto.dueDate !== undefined) updateData.dueDate = updatePurchaseDto.dueDate;

            if (updatePurchaseDto.amountPaid !== undefined) {
                const newAmountPaid = Number(updatePurchaseDto.amountPaid);
                const currentAmountPaid = Number(purchase.amountPaid);
                const currentBalanceDue = Number(purchase.balanceDue);
                const purchaseTotal = Number(purchase.total);

                if (newAmountPaid < currentAmountPaid) {
                    throw new BadRequestException(`Cannot reduce payment from ${currentAmountPaid} to ${newAmountPaid}`);
                }
                if (newAmountPaid > purchaseTotal) {
                    throw new BadRequestException(`Amount paid (${newAmountPaid}) cannot exceed total purchase (${purchaseTotal})`);
                }

                additionalPayment = newAmountPaid - currentAmountPaid;

                if (additionalPayment > currentBalanceDue) {
                    throw new BadRequestException(`Additional payment (${additionalPayment}) exceeds remaining balance (${currentBalanceDue})`);
                }

                updateData.amountPaid = { increment: additionalPayment };
                updateData.balanceDue = { decrement: additionalPayment };

                const newTotalPaid = currentAmountPaid + additionalPayment;
                updateData.status = newTotalPaid === purchaseTotal ? 'PAID' :
                    newTotalPaid > 0 ? 'PARTIAL' : 'PENDING';
            }

            if (updatePurchaseDto.status !== undefined && updatePurchaseDto.amountPaid === undefined) {
                updateData.status = updatePurchaseDto.status;
            }

            if (Object.keys(updateData).length === 0) {
                throw new BadRequestException("No fields provided for update");
            }

            await tsx.purchase.update({
                where: {
                    id: purchaseID,
                    storeId: storeId
                },
                data: updateData
            });

            if (additionalPayment > 0) {
                const todayStr = new Date().toISOString().split('T')[0];

                let dailyBalance = await tsx.dailyBalance.findUnique({
                    where: {
                        storeId_date: {
                            storeId,
                            date: todayStr,
                        },
                    },
                });

                if (!dailyBalance) {
                    const lastRecord = await tsx.dailyBalance.findFirst({
                        where: { storeId },
                        orderBy: { date: "desc" },
                    });

                    const openingCash = lastRecord?.closingCash || new Prisma.Decimal(0);

                    if (additionalPayment > Number(openingCash)) {
                        throw new BadRequestException(`Insufficient funds for payment. Available: ${openingCash}, Required: ${additionalPayment}`);
                    }

                    dailyBalance = await tsx.dailyBalance.create({
                        data: {
                            storeId,
                            date: todayStr,
                            openingCash: openingCash,
                            closingCash: openingCash,
                            totalCashIn: 0,
                            totalCashOut: 0,
                            totalSales: 0,
                            totalExpense: 0
                        }
                    });
                } else {
                    if (additionalPayment > Number(dailyBalance.closingCash)) {
                        throw new BadRequestException(`Insufficient funds for payment. Available: ${dailyBalance.closingCash}, Required: ${additionalPayment}`);
                    }
                }

                await tsx.dailyBalance.update({
                    where: { id: dailyBalance.id },
                    data: {
                        closingCash: { decrement: additionalPayment },
                        totalCashOut: { increment: additionalPayment },
                        totalExpense: { increment: additionalPayment }
                    }
                });

                await tsx.accountTransaction.create({
                    data: {
                        storeId,
                        // userId: userId,
                        type: 'DEBT_PAID',
                        amount: additionalPayment,
                        note: `Additional payment for purchase #${purchaseID} to ${purchase.supplierName}`,
                        dailyBalanceId: dailyBalance.id,
                    }
                });
            }

            return {
                success: true,
                message: "Purchase updated successfully",
            };
        });
    }

    async getPurchasesByDateRange(userId: string, storeId: string, from?: string, to?: string): Promise<Purchase[]> {
        try {
            const where: any = { storeId };

            if (from || to) {
                where.createdAt = {};
                if (from) {
                    const fromDate = new Date(from);
                    fromDate.setHours(0, 0, 0, 0);
                    where.createdAt.gte = fromDate;
                }
                if (to) {
                    const toDate = new Date(to);
                    toDate.setHours(23, 59, 59, 999);
                    where.createdAt.lte = toDate;
                }
            }

            const purchases = await this.database.prisma.purchase.findMany({
                where,
                include: {
                    items: {
                        include: {
                            variant: {
                                include: {
                                    product: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            return purchases as any;
        } catch (error) {
            console.error('Get purchases error:', error);
            throw new InternalServerErrorException('Failed to fetch purchases');
        }
    }
}

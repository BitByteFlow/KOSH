import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PaymentStatus } from 'db';
import { DatabaseService } from 'src/database/database.service';
import { CreatePurchaseDto } from './dto/CreatePurchaseDto.dto';
import { UpdatePurchaseDto } from './dto/UpdatePurchaseDto.dto';


@Injectable()
export class PurchasesService {
    constructor(private readonly database: DatabaseService) { }

    async createPurchase(createPurchaseDto: CreatePurchaseDto, userId: string) {
        return this.database.$transaction(async (tsx) => {
            const variantDetails: Array<{ variant: any; quantity: number; price: number }> = [];

            for (const item of createPurchaseDto.variants) {
                const variant = await tsx.productVariant.findUnique({
                    where: { id: item.variantId },
                    include: {
                        product: true,
                        attributes: true
                    }
                });

                if (!variant) {
                    throw new NotFoundException(`Product variant ${item.variantId} not found`);
                }

                if (variant.product.userId !== userId) {
                    throw new NotFoundException(`You don't own product ${variant.product.name}`);
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
                    items: {
                        include: {
                            variant: {
                                include: {
                                    product: true,
                                    attributes: true
                                }
                            }
                        }
                    }
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
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);

                let dailyBalance = await tsx.dailyBalance.findFirst({
                    where: {
                        userId,
                        date: {
                            gte: today,
                            lt: tomorrow,
                        },
                    },
                });

                if (!dailyBalance) {
                    const yesterday = new Date(today);
                    yesterday.setDate(yesterday.getDate() - 1);

                    const yesterdayBalance = await tsx.dailyBalance.findFirst({
                        where: {
                            userId,
                            date: {
                                gte: yesterday,
                                lt: today,
                            },
                        },
                        orderBy: { date: 'desc' },
                    });

                    dailyBalance = await tsx.dailyBalance.create({
                        data: {
                            userId,
                            date: today,
                            openingCash: yesterdayBalance?.closingCash || 0,
                            closingCash: yesterdayBalance?.closingCash || 0,
                            totalCashIn: 0,
                            totalCashOut: 0,
                            totalSales: 0,
                            totalExpense: 0,
                        },
                    });
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
                        userId,
                        type: 'PURCHASE',
                        amount: amountPaid,
                        note: `Purchase #${purchase.id} from ${createPurchaseDto.supplierName}`,
                        dailyBalanceId: dailyBalance.id,
                        purchaseId: purchase.id,
                    },
                });
            }

            return {
                status: 'success',
                message: 'Purchase created successfully'
            };

        }).catch((error) => {
            console.error('Purchase creation error:', error);

            if (error.code === 'P2025') {
                throw new NotFoundException('Record not found during purchase creation');
            }
            if (error.code === 'P2002') {
                throw new BadRequestException('Duplicate purchase detected');
            }
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }

            throw new InternalServerErrorException('Failed to create purchase. Please try again.');
        });
    }


    async updatePurchase(updatePurchaseDto: UpdatePurchaseDto, purchaseID: string, userId: string): Promise<any> {
        return this.database.$transaction(async (tsx) => {

            const purchase = await tsx.purchase.findUnique({
                where: {
                    id: purchaseID,
                    userId: userId
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
                    userId: userId
                },
                data: updateData
            });

            if (additionalPayment > 0) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);

                let dailyBalance = await tsx.dailyBalance.findFirst({
                    where: {
                        userId: userId,
                        date: {
                            gte: today,
                            lt: tomorrow
                        }
                    }
                });

                if (!dailyBalance) {
                    const yesterday = new Date(today);
                    yesterday.setDate(yesterday.getDate() - 1);

                    const yesterdayBalance = await tsx.dailyBalance.findFirst({
                        where: {
                            userId: userId,
                            date: {
                                gte: yesterday,
                                lt: today
                            }
                        },
                        orderBy: {
                            date: 'desc'
                        }
                    });

                    dailyBalance = await tsx.dailyBalance.create({
                        data: {
                            userId: userId,
                            date: today,
                            openingCash: yesterdayBalance?.closingCash || 0,
                            closingCash: yesterdayBalance?.closingCash || 0,
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
                        closingCash: { decrement: additionalPayment },
                        totalCashOut: { increment: additionalPayment },
                        totalExpense: { increment: additionalPayment }
                    }
                });

                await tsx.accountTransaction.create({
                    data: {
                        userId: userId,
                        type: 'DEBT_PAID',
                        amount: additionalPayment,
                        note: `Additional payment for purchase #${purchaseID} to ${purchase.supplierName}`,
                        dailyBalanceId: dailyBalance.id,
                    }
                });
            }

            return {
                status: "success",
                message: "Purchase updated successfully",
            };
        });
    }

    async getPurchasesByDateRange(userId: string, from?: string, to?: string) {

        try {

            const where: any = { userId };

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

            const purchases = await this.database.purchase.findMany({
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

            return {
                status: "success",
                message: "purhcase records retrieved",
                purchases: purchases
            };

        } catch (error) {
            console.error('Get purchases error:', error);
            throw new InternalServerErrorException('Failed to fetch purchases');
        }
    }

}
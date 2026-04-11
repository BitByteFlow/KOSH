"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePurchaseSchema = exports.payPurchaseDebtSchema = exports.createPurchaseSchema = exports.purchaseVariantItemSchema = exports.PaymentStatus = void 0;
const zod_1 = require("zod");
exports.PaymentStatus = {
    PENDING: "PENDING",
    PARTIAL: "PARTIAL",
    PAID: "PAID",
    OVERDUE: "OVERDUE",
};
exports.purchaseVariantItemSchema = zod_1.z.object({
    variantId: zod_1.z.string().uuid("Variant ID is required"),
    quantity: zod_1.z.number().positive("Quantity must be positive").min(1, "Minimum quantity is 1"),
    price: zod_1.z.number().positive("Price must be positive"),
});
exports.createPurchaseSchema = zod_1.z.object({
    supplierName: zod_1.z.string().min(1, "Supplier name is required"),
    email: zod_1.z.string().email("Invalid email format").optional().or(zod_1.z.literal("")),
    contact: zod_1.z.string().optional(),
    amountPaid: zod_1.z.number().min(0, "Amount paid cannot be negative").default(0),
    dueDate: zod_1.z.preprocess((val) => (val ? new Date(val) : undefined), zod_1.z.date().optional()),
    variants: zod_1.z.array(exports.purchaseVariantItemSchema),
});
exports.payPurchaseDebtSchema = zod_1.z.object({
    amount: zod_1.z.number().positive("Payment amount must be positive").min(1, "Minimum payment amount is 1"),
});
exports.updatePurchaseSchema = zod_1.z.object({
    supplierName: zod_1.z.string().min(1, "Supplier name is required").optional(),
    email: zod_1.z.string().email("Invalid email format").optional().or(zod_1.z.literal("")),
    contact: zod_1.z.string().optional(),
    amountPaid: zod_1.z.number().min(0, "Amount paid cannot be negative").default(0).optional(),
    dueDate: zod_1.z.preprocess((val) => (val ? new Date(val) : undefined), zod_1.z.date().optional()),
    status: zod_1.z.enum([exports.PaymentStatus.PENDING, exports.PaymentStatus.PARTIAL, exports.PaymentStatus.PAID, exports.PaymentStatus.OVERDUE]).optional(),
});
//# sourceMappingURL=purchase.schema.js.map
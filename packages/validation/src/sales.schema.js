"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSaleSchema = exports.createSaleItemSchema = exports.PaymentType = void 0;
const zod_1 = require("zod");
exports.PaymentType = {
    CASH: "CASH",
    ONLINE: "ONLINE",
    CREDIT: "CREDIT",
};
exports.createSaleItemSchema = zod_1.z.object({
    variantId: zod_1.z.string().uuid(),
    quantity: zod_1.z.number().int().min(1, "Quantity must be at least 1"),
    sellPrice: zod_1.z.number().min(0, "Price cannot be negative"),
    costPrice: zod_1.z.number().min(0),
});
exports.createSaleSchema = zod_1.z
    .object({
    storeId: zod_1.z.uuid(),
    discount: zod_1.z.number().min(0, "Discount cannot be negative"),
    paymentType: zod_1.z.enum(["CASH", "ONLINE", "CREDIT"]),
    creditId: zod_1.z.uuid().optional(),
    items: zod_1.z
        .array(exports.createSaleItemSchema)
        .min(1, "At least one item is required"),
    transactionNote: zod_1.z.string().optional(),
    customerName: zod_1.z.string().optional(),
    customerEmail: zod_1.z.email("Invalid email format").optional(),
    customerContact: zod_1.z.string().optional(),
})
    .superRefine((data, ctx) => {
    if (data.paymentType === "CREDIT") {
        if (!data.customerName || data.customerName.trim() === "") {
            ctx.addIssue({
                code: "custom",
                message: "Required",
                path: ["customerName"],
            });
        }
        if (!data.customerContact || data.customerContact.trim() === "") {
            ctx.addIssue({
                code: "custom",
                message: "Required",
                path: ["customerContact"],
            });
        }
        if (!data.customerEmail || data.customerEmail.trim() === "") {
            ctx.addIssue({
                code: "custom",
                message: "Required",
                path: ["customerEmail"],
            });
        }
    }
});
//# sourceMappingURL=sales.schema.js.map
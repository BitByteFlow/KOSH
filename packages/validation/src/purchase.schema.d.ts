import { z } from "zod";
export declare const PaymentStatus: {
    readonly PENDING: "PENDING";
    readonly PARTIAL: "PARTIAL";
    readonly PAID: "PAID";
    readonly OVERDUE: "OVERDUE";
};
export declare const purchaseVariantItemSchema: z.ZodObject<{
    variantId: z.ZodString;
    quantity: z.ZodNumber;
    price: z.ZodNumber;
}, z.core.$strip>;
export declare const createPurchaseSchema: z.ZodObject<{
    supplierName: z.ZodString;
    email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    contact: z.ZodOptional<z.ZodString>;
    amountPaid: z.ZodDefault<z.ZodNumber>;
    dueDate: z.ZodPipe<z.ZodTransform<Date | undefined, unknown>, z.ZodOptional<z.ZodDate>>;
    variants: z.ZodArray<z.ZodObject<{
        variantId: z.ZodString;
        quantity: z.ZodNumber;
        price: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const payPurchaseDebtSchema: z.ZodObject<{
    amount: z.ZodNumber;
}, z.core.$strip>;
export declare const updatePurchaseSchema: z.ZodObject<{
    supplierName: z.ZodOptional<z.ZodString>;
    email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    contact: z.ZodOptional<z.ZodString>;
    amountPaid: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    dueDate: z.ZodPipe<z.ZodTransform<Date | undefined, unknown>, z.ZodOptional<z.ZodDate>>;
    status: z.ZodOptional<z.ZodEnum<{
        PENDING: "PENDING";
        PARTIAL: "PARTIAL";
        PAID: "PAID";
        OVERDUE: "OVERDUE";
    }>>;
}, z.core.$strip>;
export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>;
export type PurchaseVariantItemInput = z.infer<typeof purchaseVariantItemSchema>;
export type PayPurchaseDebtInput = z.infer<typeof payPurchaseDebtSchema>;
export type UpdatePurchaseInput = z.infer<typeof updatePurchaseSchema>;

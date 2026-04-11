import { z } from "zod";
export declare const PaymentType: {
    readonly CASH: "CASH";
    readonly ONLINE: "ONLINE";
    readonly CREDIT: "CREDIT";
};
export type PaymentType = keyof typeof PaymentType;
export declare const createSaleItemSchema: z.ZodObject<{
    variantId: z.ZodString;
    quantity: z.ZodNumber;
    sellPrice: z.ZodNumber;
    costPrice: z.ZodNumber;
}, z.core.$strip>;
export declare const createSaleSchema: z.ZodObject<{
    storeId: z.ZodUUID;
    discount: z.ZodNumber;
    paymentType: z.ZodEnum<{
        CASH: "CASH";
        ONLINE: "ONLINE";
        CREDIT: "CREDIT";
    }>;
    creditId: z.ZodOptional<z.ZodUUID>;
    items: z.ZodArray<z.ZodObject<{
        variantId: z.ZodString;
        quantity: z.ZodNumber;
        sellPrice: z.ZodNumber;
        costPrice: z.ZodNumber;
    }, z.core.$strip>>;
    transactionNote: z.ZodOptional<z.ZodString>;
    customerName: z.ZodOptional<z.ZodString>;
    customerEmail: z.ZodOptional<z.ZodEmail>;
    customerContact: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreateSaleInput = z.infer<typeof createSaleSchema>;
export type CreateSaleItemInput = z.infer<typeof createSaleItemSchema>;

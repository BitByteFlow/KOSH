import { z } from "zod";
export declare const createTransactionSchema: z.ZodObject<{
    type: z.ZodString;
    amount: z.ZodNumber;
    note: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const getTransactionsQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodPipe<z.ZodTransform<number, unknown>, z.ZodDefault<z.ZodNumber>>>;
    limit: z.ZodOptional<z.ZodPipe<z.ZodTransform<number, unknown>, z.ZodDefault<z.ZodNumber>>>;
    sortBy: z.ZodOptional<z.ZodDefault<z.ZodEnum<{
        type: "type";
        createdAt: "createdAt";
        amount: "amount";
    }>>>;
    sortOrder: z.ZodOptional<z.ZodDefault<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>>;
}, z.core.$strip>;
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type GetTransactionsQueryInput = z.infer<typeof getTransactionsQuerySchema>;

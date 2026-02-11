import { z } from "zod";

export const createTransactionSchema = z.object({
  type: z.string().min(1, "Type cannot be empty!"),
  amount: z.number({ message: "Amount is missing!" }),
  note: z.string().optional(),
});

export const getTransactionsQuerySchema = z.object({
  page: z.preprocess((val) => Number(val), z.number().int().min(1).default(1)).optional(),
  limit: z.preprocess((val) => Number(val), z.number().int().min(1).default(10)).optional(),
  sortBy: z.enum(["createdAt", "amount", "type"]).default("createdAt").optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc").optional(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type GetTransactionsQueryInput = z.infer<typeof getTransactionsQuerySchema>;

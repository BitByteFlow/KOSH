import { z } from "zod";

export enum PaymentType {
  CASH = "CASH",
  ONLINE = "ONLINE",
  CREDIT = "CREDIT",
}

export const createSaleItemSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().min(1),
  sellPrice: z.number().min(0),
  costPrice: z.number().min(0),
});

export const createSaleSchema = z.object({
  discount: z.preprocess((val) => Number(val), z.number().min(0)),
  paymentType: z.nativeEnum(PaymentType),
  creditId: z.string().uuid().optional(),
  items: z.array(createSaleItemSchema),
  transactionNote: z.string().optional(),
  customerName: z.string().optional(),
  customerEmail: z.string().email("Invalid email format").optional().or(z.literal("")),
  customerContact: z.string().optional(),
});

export type CreateSaleInput = z.infer<typeof createSaleSchema>;
export type CreateSaleItemInput = z.infer<typeof createSaleItemSchema>;

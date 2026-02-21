import { z } from "zod";
import { PaymentType } from "@kosh/db";

export const createSaleItemSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().min(1),
  sellPrice: z.number().min(0),
  costPrice: z.number().min(0),
});

export const createSaleSchema = z.object({
  discount: z.number().min(0),
  paymentType: z.enum(PaymentType),
  creditId: z.string().uuid().optional(),
  items: z.array(createSaleItemSchema),
  transactionNote: z.string().optional(),
  customerName: z.string().optional(),
  customerEmail: z.string().email("Invalid email format").optional().or(z.literal("")),
  customerContact: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.paymentType === PaymentType.CREDIT) {
    if (!data.customerName || data.customerName.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Customer name is required for credit sales",
        path: ["customerName"],
      });
    }
    if (!data.customerContact || data.customerContact.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Customer contact is required for credit sales",
        path: ["customerContact"],
      });
    }
  }
});

export type CreateSaleInput = z.infer<typeof createSaleSchema>;
export type CreateSaleItemInput = z.infer<typeof createSaleItemSchema>;

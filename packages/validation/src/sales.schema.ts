import { z } from "zod";

export const PaymentType = {
  CASH: "CASH",
  ONLINE: "ONLINE",
  CREDIT: "CREDIT",
} as const;

export type PaymentType = keyof typeof PaymentType;

export const createSaleItemSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  sellPrice: z.number().min(0, "Price cannot be negative"),
  costPrice: z.number().min(0),
});

export const createSaleSchema = z.object({
  discount: z.number().min(0, "Discount cannot be negative"),
  paymentType: z.enum(["CASH", "ONLINE", "CREDIT"]),
  creditId: z.string().uuid().optional(),
  items: z.array(createSaleItemSchema).min(1, "At least one item is required"),
  transactionNote: z.string().optional(),
  customerName: z.string().optional(),
  customerEmail: z.string().email("Invalid email format").optional().or(z.literal("")),
  customerContact: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.paymentType === "CREDIT") {
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

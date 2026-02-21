import { z } from "zod";
import {PaymentStatus} from "@kosh/db"

export const purchaseVariantItemSchema = z.object({
  variantId: z.string().uuid("Variant ID is required"),
  quantity: z.number().positive("Quantity must be positive").min(1, "Minimum quantity is 1"),
  price: z.number().positive("Price must be positive"),
});

export const createPurchaseSchema = z.object({
  supplierName: z.string().min(1, "Supplier name is required"),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  contact: z.string().optional(),
  amountPaid: z.number().min(0, "Amount paid cannot be negative").default(0),
  dueDate: z.preprocess((val) => (val ? new Date(val as string) : undefined), z.date().optional()),
  variants: z.array(purchaseVariantItemSchema),
});

export const payPurchaseDebtSchema = z.object({
  amount: z.number().positive("Payment amount must be positive").min(1, "Minimum payment amount is 1"),
});

export const updatePurchaseSchema = z.object({
  supplierName: z.string().min(1, "Supplier name is required").optional(),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  contact: z.string().optional(),
  amountPaid: z.number().min(0, "Amount paid cannot be negative").default(0).optional(),
  dueDate: z.preprocess((val) => (val ? new Date(val as string) : undefined), z.date().optional()),
  status: z.enum([PaymentStatus.PENDING, PaymentStatus.PARTIAL, PaymentStatus.PAID, PaymentStatus.OVERDUE]).optional(),
});

export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>;
export type PurchaseVariantItemInput = z.infer<typeof purchaseVariantItemSchema>;
export type PayPurchaseDebtInput = z.infer<typeof payPurchaseDebtSchema>;
export type UpdatePurchaseInput = z.infer<typeof updatePurchaseSchema>;

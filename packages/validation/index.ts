import { z } from "zod";

export const attributeSchema = z.object({
  name: z.string().min(1, "Attribute name is required"),
  value: z.string().min(1, "Attribute value is required"),
});

export const variantSchema = z.object({
  id: z.string().optional(), // ID might be generated on frontend or backend
  costPrice: z.string().min(1, "Cost price is required"), // Keeping as string to match existing form, can process to number later
  sellingPrice: z.string().min(1, "Selling price is required"),
  stock: z.string().min(1, "Stock is required"),
  attributes: z.array(attributeSchema).min(1, "At least one attribute is required"),
});

export const createProductSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  categoryId: z.string().min(1, "Category is required"),
  keepPurchaseRecord: z.boolean(),
  supplierName: z.string().optional(),
  variants: z.array(variantSchema).min(1, "At least one variant is required"),
}).superRefine((data, ctx) => {
  if (data.keepPurchaseRecord && (!data.supplierName || data.supplierName.length < 2)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Supplier name is required when logging purchase record",
      path: ["supplierName"],
    });
  }
});

export type Attribute = z.infer<typeof attributeSchema>;
export type Variant = z.infer<typeof variantSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;

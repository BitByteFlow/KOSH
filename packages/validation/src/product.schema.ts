import { z } from "zod";

export const attributeSchema = z.object({
  name: z.string().min(1, "Name is required").min(3, "Name must be greater then 3 words"),
  value: z.string().min(1, "Value is required"),
});

export const variantDtoSchema = z.object({
  costPrice: z.number().min(0),
  sellingPrice: z.number().min(0),
  stock: z.number().min(0).default(0).optional(),
  attributes: z.array(attributeSchema).optional(),
});

export const createProductRequestSchema = z.object({
  categoryId: z.string().uuid("Product must belong to some category, category missing!"),
  name: z.string()
    .min(1, "Product must have a name!")
    .min(3, "Name must be greater then 3 words")
    .max(55, "Name is too long!"),
  variants: z.array(variantDtoSchema),
  createPurchaseRecord: z.boolean().default(false).optional(),
});

export const updateVariantSchema = z.object({
  productId: z.string().min(1, "Product ID not sent!"),
  variantId: z.string().min(1, "Variant ID not sent!"),
  costPrice: z.number().min(0),
  sellingPrice: z.number().min(0),
  status: z.string(),
});

export const addVariantSchema = variantDtoSchema;

export const updateProductSchema = z.object({
  name: z.string().min(2),
  categoryId: z.string().uuid(),
});

export type CreateProductRequestInput = z.infer<typeof createProductRequestSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type VariantDtoInput = z.infer<typeof variantDtoSchema>;
export type AttributeInput = z.infer<typeof attributeSchema>;

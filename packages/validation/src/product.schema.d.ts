import { z } from "zod";
export declare const attributeSchema: z.ZodObject<{
    name: z.ZodString;
    value: z.ZodString;
}, z.core.$strip>;
export declare const variantDtoSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    costPrice: z.ZodNumber;
    sellingPrice: z.ZodNumber;
    stock: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    attributes: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        value: z.ZodString;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const createProductSchema: z.ZodObject<{
    categoryName: z.ZodString;
    categoryId: z.ZodString;
    name: z.ZodString;
    variants: z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        costPrice: z.ZodNumber;
        sellingPrice: z.ZodNumber;
        stock: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
        attributes: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            value: z.ZodString;
        }, z.core.$strip>>>;
    }, z.core.$strip>>;
    keepPurchaseRecord: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    supplierName: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateVariantSchema: z.ZodObject<{
    productId: z.ZodString;
    variantId: z.ZodString;
    costPrice: z.ZodNumber;
    sellingPrice: z.ZodNumber;
    stock: z.ZodOptional<z.ZodNumber>;
    status: z.ZodString;
    attributes: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        value: z.ZodString;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const addVariantSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    costPrice: z.ZodNumber;
    sellingPrice: z.ZodNumber;
    stock: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    attributes: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        value: z.ZodString;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const updateProductSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    categoryId: z.ZodOptional<z.ZodString>;
    variants: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        costPrice: z.ZodNumber;
        sellingPrice: z.ZodNumber;
        stock: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
        attributes: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            value: z.ZodString;
        }, z.core.$strip>>>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type VariantDtoInput = z.infer<typeof variantDtoSchema>;
export type AttributeInput = z.infer<typeof attributeSchema>;

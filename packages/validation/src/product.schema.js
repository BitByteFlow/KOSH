"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductSchema = exports.addVariantSchema = exports.updateVariantSchema = exports.createProductSchema = exports.variantDtoSchema = exports.attributeSchema = void 0;
const zod_1 = require("zod");
exports.attributeSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(1, "Name is required")
        .min(3, "Name must be greater then 3 words"),
    value: zod_1.z.string().min(1, "Value is required"),
});
exports.variantDtoSchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    costPrice: zod_1.z.number().min(0),
    sellingPrice: zod_1.z.number().min(0),
    stock: zod_1.z.number().min(0).default(0).optional(),
    attributes: zod_1.z.array(exports.attributeSchema).optional(),
});
exports.createProductSchema = zod_1.z
    .object({
    categoryName: zod_1.z.string(),
    categoryId: zod_1.z
        .string()
        .uuid("Product must belong to some category, category missing!"),
    name: zod_1.z
        .string()
        .min(1, "Product must have a name!")
        .min(3, "Name must be greater then 3 words")
        .max(55, "Name is too long!"),
    variants: zod_1.z.array(exports.variantDtoSchema),
    keepPurchaseRecord: zod_1.z.boolean().default(false).optional(),
    supplierName: zod_1.z.string().optional(),
})
    .superRefine((data, ctx) => {
    if (data.keepPurchaseRecord && !data.supplierName) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: "Supplier name is required when keepPurchaseRecord is true",
            path: ["supplierName"],
        });
    }
});
exports.updateVariantSchema = zod_1.z.object({
    productId: zod_1.z.string().min(1, "Product ID not sent!"),
    variantId: zod_1.z.string().min(1, "Variant ID not sent!"),
    costPrice: zod_1.z.number().min(0),
    sellingPrice: zod_1.z.number().min(0),
    stock: zod_1.z.number().min(0).optional(),
    status: zod_1.z.string(),
    attributes: zod_1.z.array(exports.attributeSchema).optional(),
});
exports.addVariantSchema = exports.variantDtoSchema;
exports.updateProductSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).optional(),
    categoryId: zod_1.z.string().uuid().optional(),
    variants: zod_1.z.array(exports.variantDtoSchema).optional(),
});
//# sourceMappingURL=product.schema.js.map
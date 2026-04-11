import { z } from "zod";
export declare const createCategorySchema: z.ZodObject<{
    name: z.ZodString;
}, z.core.$strip>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

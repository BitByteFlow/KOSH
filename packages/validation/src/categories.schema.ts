import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string()
    .min(1, "Category name is required!")
    .min(3, "Category name should be minimum of length 2") // Match original msg
    .max(50, "Category name is too long!"),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

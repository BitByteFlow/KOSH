import { z } from "zod";

export const loginRequestSchema = z.object({
  googleId: z.string().min(1, "Google Id cannot be empty!"),
  email: z.string().min(1, "Email cannot be empty!").email("Invalid email format"),
  isCashier: z.boolean().default(false),
});

export const createUserSchema = z.object({
  isCashier: z.boolean().default(false),
  googleId: z.string().min(1, "Google Id cannot be empty!"),
  email: z.email("Invalid email format"),
  image: z.url("Invalid image url"),
  username: z.string().min(1, "Username is empty"),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;

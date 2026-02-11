import { z } from "zod";

export const loginRequestSchema = z.object({
  googleId: z.string().min(1, "Google Id cannot be empty!"),
  email: z.string().min(1, "Email cannot be empty!").email("Invalid email format"),
});

export const createUserSchema = z.object({
  googleId: z.string().min(1, "Google Id cannot be empty!"),
  email: z.string().min(1, "Email cannot be empty!").email("Invalid email format"),
  image: z.string().min(1, "Image url is empty"),
  username: z.string().min(1, "Username is empty"),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;

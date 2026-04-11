import { z } from "zod";
export declare const loginRequestSchema: z.ZodObject<{
    googleId: z.ZodString;
    email: z.ZodString;
    isCashier: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export declare const createUserSchema: z.ZodObject<{
    isCashier: z.ZodDefault<z.ZodBoolean>;
    googleId: z.ZodString;
    email: z.ZodEmail;
    image: z.ZodURL;
    username: z.ZodString;
}, z.core.$strip>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;

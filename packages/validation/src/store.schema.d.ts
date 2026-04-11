import { z } from "zod";
export declare const CreateStoreSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const UpdateStoreSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    address: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    phone: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export declare const AddMemberSchema: z.ZodObject<{
    email: z.ZodString;
    role: z.ZodEnum<{
        ADMIN: "ADMIN";
        CASHIER: "CASHIER";
        MANAGER: "MANAGER";
    }>;
}, z.core.$strip>;
export declare const UpdateMemberRoleSchema: z.ZodObject<{
    role: z.ZodEnum<{
        ADMIN: "ADMIN";
        CASHIER: "CASHIER";
        MANAGER: "MANAGER";
    }>;
}, z.core.$strip>;
export type CreateStoreInput = z.infer<typeof CreateStoreSchema>;
export type UpdateStoreInput = z.infer<typeof UpdateStoreSchema>;
export type AddMemberInput = z.infer<typeof AddMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof UpdateMemberRoleSchema>;

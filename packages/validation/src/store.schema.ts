import { z } from "zod";

export const CreateStoreSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().max(200).optional(),
  address: z.string().max(200).optional(),
  phone: z.string().max(20).optional(),
});

export const UpdateStoreSchema = CreateStoreSchema.partial();

export const AddMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["ADMIN", "MANAGER", "CASHIER"]),
});

export const UpdateMemberRoleSchema = z.object({
  role: z.enum(["ADMIN", "MANAGER", "CASHIER"]),
});

export type CreateStoreInput = z.infer<typeof CreateStoreSchema>;
export type UpdateStoreInput = z.infer<typeof UpdateStoreSchema>;
export type AddMemberInput = z.infer<typeof AddMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof UpdateMemberRoleSchema>;

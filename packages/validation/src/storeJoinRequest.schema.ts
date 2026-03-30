import { z } from "zod";

export const HandleJoinRequestSchema = z.object({
	status: z.enum(["PENDING", "ACCEPTED", "REJECTED"]),
	storeId: z.uuid(),
});

export type HandleJoinRequestInput = z.infer<typeof HandleJoinRequestSchema>;

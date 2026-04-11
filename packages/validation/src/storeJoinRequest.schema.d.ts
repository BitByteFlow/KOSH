import { z } from "zod";
export declare const HandleJoinRequestSchema: z.ZodObject<{
    status: z.ZodEnum<{
        PENDING: "PENDING";
        ACCEPTED: "ACCEPTED";
        REJECTED: "REJECTED";
    }>;
    storeId: z.ZodUUID;
}, z.core.$strip>;
export type HandleJoinRequestInput = z.infer<typeof HandleJoinRequestSchema>;

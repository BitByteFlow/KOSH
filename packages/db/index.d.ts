import { PrismaClient } from "./prisma/generated/prisma/index.js";
export * from "./prisma/generated/prisma/index.js";
export { PaymentStatus } from "./prisma/generated/prisma/index.js";
export { Prisma } from "./prisma/generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
declare const prisma: PrismaClient<{
    adapter: PrismaPg;
}, never, import("./prisma/generated/prisma/runtime/client.js").DefaultArgs>;
export { PrismaClient, prisma };

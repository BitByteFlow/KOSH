import { PrismaClient } from "./prisma/generated/prisma/index.js";
export * from "./prisma/generated/prisma/index.js";
export { PaymentStatus, PaymentType } from "./prisma/generated/prisma/index.js";
export { Prisma } from "./prisma/generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });
export { PrismaClient, prisma };
//# sourceMappingURL=index.js.map
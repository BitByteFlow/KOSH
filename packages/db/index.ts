import { PrismaClient } from "./prisma/generated/prisma/index.js";
export * from "./prisma/generated/prisma/index.js";
export { PaymentStatus } from "./prisma/generated/prisma/index.js";
export { Prisma } from "./prisma/generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import {
	PrismaClientKnownRequestError,
	PrismaClientUnknownRequestError,
	PrismaClientRustPanicError,
	PrismaClientInitializationError,
	PrismaClientValidationError,
} from "@prisma/client/runtime/client";

const connectionString = process.env.DATABASE_URL;

const adapter = new PrismaPg({ connectionString });

// const prisma = new PrismaClient({ adapter });

export {
	PrismaClient,
	PrismaClientInitializationError,
	PrismaClientKnownRequestError,
	PrismaClientRustPanicError,
	PrismaClientUnknownRequestError,
	PrismaClientValidationError,
};

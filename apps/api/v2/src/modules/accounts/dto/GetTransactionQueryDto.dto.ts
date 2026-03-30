import { createZodDto } from "nestjs-zod";
import { getTransactionsQuerySchema } from "@kosh/validation";

export class GetTransactionsQueryDto extends createZodDto(
	getTransactionsQuerySchema,
) {}

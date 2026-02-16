import { createZodDto } from "nestjs-zod";
import { createSaleItemSchema } from "@kosh/validation";

export class CreateSaleItemDto extends createZodDto(createSaleItemSchema) {}

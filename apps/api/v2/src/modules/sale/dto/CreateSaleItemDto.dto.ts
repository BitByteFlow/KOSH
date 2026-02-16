import { createZodDto } from "nestjs-zod";
import { createSaleItemSchema } from "@kosh/validation";

export class CreateSaleItemInput extends createZodDto(createSaleItemSchema) {}

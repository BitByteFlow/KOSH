import { createZodDto } from "nestjs-zod";
import { createProductRequestSchema } from "@kosh/validation";

export class CreateProductRequestDto extends createZodDto(createProductRequestSchema) {}
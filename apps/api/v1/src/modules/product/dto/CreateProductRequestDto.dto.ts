import { createZodDto } from "nestjs-zod";
import { createProductSchema } from "@kosh/validation";

export class CreateProductRequestDto extends createZodDto(createProductSchema) {}
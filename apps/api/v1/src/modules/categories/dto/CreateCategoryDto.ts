import { createZodDto } from "nestjs-zod";
import { createCategorySchema } from "@kosh/validation";

export class CreateCategoryDto extends createZodDto(createCategorySchema) {}

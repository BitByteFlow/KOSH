import { createZodDto } from "nestjs-zod";
import { addVariantSchema } from "@kosh/validation";

export class CreateVariantDto extends createZodDto(addVariantSchema) {}

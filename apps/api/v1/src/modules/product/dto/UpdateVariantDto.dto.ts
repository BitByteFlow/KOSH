import { createZodDto } from "nestjs-zod";
import { updateVariantSchema } from "@kosh/validation";

export class UpdateProductVariantDto extends createZodDto(updateVariantSchema) {}
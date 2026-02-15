import { createZodDto } from "nestjs-zod";
import { updateProductSchema } from "@kosh/validation";

export class UpdateProductDto extends createZodDto(updateProductSchema) {}
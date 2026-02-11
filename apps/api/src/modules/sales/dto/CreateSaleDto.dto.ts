import { createZodDto } from "nestjs-zod";
import { createSaleSchema } from "@kosh/validation";

export class CreateSaleDto extends createZodDto(createSaleSchema) {}

import { createZodDto } from "nestjs-zod";
import { createSaleSchema } from "@kosh/validation";

export class CreateSaleInput extends createZodDto(createSaleSchema) {}

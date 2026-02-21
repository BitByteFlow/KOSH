import { createZodDto } from "nestjs-zod";
import { createUserSchema } from "@kosh/validation";

export class CreateUserDto extends createZodDto(createUserSchema) {}
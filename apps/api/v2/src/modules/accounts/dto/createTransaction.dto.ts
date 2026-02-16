import {createZodDto} from "nestjs-zod"
import {createTransactionSchema} from "@kosh/validation"

export class CreateTransactionDto extends createZodDto(createTransactionSchema) {}
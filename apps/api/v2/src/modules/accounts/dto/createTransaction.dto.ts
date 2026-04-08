import {createZodDto} from "nestjs-zod"
import {createTransactionSchema} from "@kosh/validation"
import { Field, Float, InputType } from "@nestjs/graphql"

@InputType()
export class CreateTransactionInput extends createZodDto(createTransactionSchema) {
	@Field(() => String)
	type!: string;

	@Field(() => Float)
	amount!: number;

	@Field(() => String, { nullable: true })
	note?: string;
}
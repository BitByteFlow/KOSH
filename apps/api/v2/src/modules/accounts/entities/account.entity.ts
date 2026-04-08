import { Field, ObjectType } from "@nestjs/graphql";
import { AccountTransaction } from "./transaction.entity";

@ObjectType()
export class AccountResponse {
	@Field(() => Boolean)
	success!: boolean

	@Field(() => String, { nullable: true })
	message?: string

	@Field(() => AccountTransaction, { nullable: true })
	data?: AccountTransaction
}

@ObjectType()
export class UpdateAccountTransactionResponse {
	@Field(() => Boolean)
	success!: boolean

	@Field(() => String, { nullable: true })
	message?: string

	@Field(() => AccountTransaction, { nullable: true })
	data?: AccountTransaction
}

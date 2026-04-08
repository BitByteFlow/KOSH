import { InputType, Field, ID } from "@nestjs/graphql";
import { HandleJoinRequestSchema } from "@kosh/validation";
import { createZodDto } from "nestjs-zod";
import { JoinRequestStatus } from "../entities/storeJoinRequest.entity";

@InputType()
export class HandleJoinRequestInput extends createZodDto(
	HandleJoinRequestSchema,
) {
	@Field(() => JoinRequestStatus)
	status!: JoinRequestStatus;
	@Field(() => String)
	storeId!: string;
}

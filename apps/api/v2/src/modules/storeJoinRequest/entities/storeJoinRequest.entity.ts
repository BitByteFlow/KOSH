import { ObjectType, Field, ID, registerEnumType } from "@nestjs/graphql";
import { User } from "src/modules/user/entities/userResponse.entity";
import { Store } from "src/modules/store/entities/store.entity";

export enum JoinRequestStatus {
	PENDING = "PENDING",
	ACCEPTED = "ACCEPTED",
	REJECTED = "REJECTED",
}

registerEnumType(JoinRequestStatus, {
	name: "JoinRequestStatus",
});

@ObjectType()
export class StoreJoinRequest {
	@Field(() => ID)
	id: string;

	@Field(() => ID)
	storeId: string;

	@Field(() => ID)
	userId: string;

	@Field(() => JoinRequestStatus)
	status: JoinRequestStatus;

	@Field(() => String)
	createdAt: string;

	@Field(() => String)
	updatedAt: string;

	@Field(() => User, { nullable: true })
	user?: User;

	@Field(() => Store, { nullable: true })
	store?: Store;
}

@ObjectType()
export class StoreJoinRequestResponse {
	@Field()
	success: boolean;

	@Field(() => String, { nullable: true })
	message?: string;

	@Field(() => StoreJoinRequest, { nullable: true })
	data?: StoreJoinRequest;
}

@ObjectType()
export class StoreJoinRequestsResponse {
	@Field()
	success: boolean;

	@Field(() => String, { nullable: true })
	message?: string;

	@Field(() => [StoreJoinRequest], { nullable: true })
	data?: StoreJoinRequest[];
}

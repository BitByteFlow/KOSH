import { ObjectType, Field, ID, registerEnumType } from "@nestjs/graphql";
import { User } from "src/modules/user/entities/userResponse.entity";

export enum MemberRole {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  CASHIER = "CASHIER",
}

registerEnumType(MemberRole, {
  name: "MemberRole",
});

@ObjectType()
export class StoreMember {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  storeId: string;

  @Field(() => ID)
  userId: string;

  @Field(() => MemberRole)
  role: MemberRole;

  @Field()
  isActive: boolean;

  @Field(() => User, { nullable: true })
  user?: User;
}

@ObjectType()
export class StoreInfo {
  @Field(() => ID)
  storeId: string;

  @Field(() => String)
  storeName: string;
}

@ObjectType()
export class StoreMemberResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field(() => StoreMember, { nullable: true })
  data?: StoreMember;

  @Field(() => StoreInfo, { nullable: true })
  store?: StoreInfo;
}

@ObjectType()
export class StoreMembersResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field(() => [StoreMember], { nullable: true })
  data?: StoreMember[];
}

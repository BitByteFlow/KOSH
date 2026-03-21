import { ObjectType, Field, ID } from "@nestjs/graphql";

@ObjectType()
export class Store {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string | null;

  @Field({ nullable: true })
  address?: string | null;

  @Field({ nullable: true })
  phone?: string | null;

  @Field(() => ID, { nullable: true })
  creatorId?: string;

  @Field({ nullable: true })
  createdAt?: Date;

  @Field({ nullable: true })
  updatedAt?: Date;
}

@ObjectType()
export class StoreResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field(() => Store, { nullable: true })
  data?: Store;
}

@ObjectType()
export class StoresResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field(() => [Store])
  data: Store[];
}

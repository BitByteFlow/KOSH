import { InputType, Field } from "@nestjs/graphql";
import { CreateStoreInput as ICreateStoreInput, UpdateStoreInput as IUpdateStoreInput } from "@kosh/validation";
import { createZodDto } from "nestjs-zod";
import { CreateStoreSchema, UpdateStoreSchema } from "@kosh/validation";

@InputType()
export class CreateStoreInput extends createZodDto(CreateStoreSchema) {
  @Field(() => String)
  name!: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  address?: string;

  @Field(() => String, { nullable: true })
  phone?: string;
}

@InputType()
export class UpdateStoreInput extends createZodDto(UpdateStoreSchema) {
  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  address?: string;

  @Field(() => String, { nullable: true })
  phone?: string;
}

import { InputType, Field } from "@nestjs/graphql";
import { CreateStoreInput as ICreateStoreInput, UpdateStoreInput as IUpdateStoreInput } from "@kosh/validation";
import { createZodDto } from "nestjs-zod";
import { CreateStoreSchema, UpdateStoreSchema } from "@kosh/validation";

@InputType()
export class CreateStoreInput extends createZodDto(CreateStoreSchema) {
  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  phone?: string;
}

@InputType()
export class UpdateStoreInput extends createZodDto(UpdateStoreSchema) {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  phone?: string;
}

import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Attribute {
  @Field()
  name!: string;

  @Field()
  value!: string;

  @Field()
  variantI?: string;

  @Field()
  id?: string;

  @Field()
  createdAt?: Date;

  @Field()
  updatedAt?: Date;
}

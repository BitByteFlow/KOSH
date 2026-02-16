import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Attribute {
  @Field()
  name: string;

  @Field()
  value: string;
}

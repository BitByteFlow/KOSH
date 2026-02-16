import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CategoryResponse {
  @Field()
  status: string;

  @Field()
  message: string;
}

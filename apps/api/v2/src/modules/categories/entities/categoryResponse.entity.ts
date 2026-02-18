import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CategoryResponse {
  @Field()
  success: boolean

  @Field()
  message: string;
}

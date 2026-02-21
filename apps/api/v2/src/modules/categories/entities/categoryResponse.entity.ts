import { Field, ObjectType } from '@nestjs/graphql';
import { Category } from './category.entity';

@ObjectType()
export class CategoryResponse {
  @Field()
  success: boolean

  @Field(() => String, { nullable: true })
  message?: string;

  @Field(() => [Category], { nullable: true })
  data?: Category[]
}

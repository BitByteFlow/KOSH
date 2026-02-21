import { Field, ObjectType } from '@nestjs/graphql';
import { Purchase } from './purchase.entity';

@ObjectType()
export class PurchaseResponse {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => String, { nullable: true })
  message?: string;

  @Field(() => Purchase, { nullable: true })
  purchase?: Purchase;
}

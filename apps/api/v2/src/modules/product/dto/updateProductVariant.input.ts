import { InputType, Field, ID, Float } from '@nestjs/graphql';
import { AttributeInput } from './attribute.input';

@InputType()
export class UpdateProductVariantInput {
  @Field(() => ID)
  productId!: string;

  @Field(() => Float, { nullable: true })
  costPrice?: number;

  @Field(() => Float, { nullable: true })
  sellingPrice?: number;

  @Field(() => Number, { nullable: true })
  stock?: number;

  @Field(() => String, { nullable: true })
  status?: string;

  @Field(() => [AttributeInput], { nullable: true })
  attributes?: AttributeInput[];
}

import { Field, ObjectType, ID, registerEnumType } from '@nestjs/graphql';
import { ProductVariant } from './productVariant.entity';
import { Category } from 'src/modules/categories/entities/category.entity';

enum Status {
  active = "active",
  inactive = "inactive",
  outOfStock = "out-of-stock"
}

registerEnumType(Status, {
  name: "Status",
})

@ObjectType()
export class Product {
  @Field(() => ID)
  id: string;

  @Field()
  productName: string;

  @Field(() => Category)
  category: Category;

  @Field()
  totalStock: number

  @Field()
  variantCount: number

  @Field(() => Status)
  status: Status;

  @Field(() => [ProductVariant])
  variants: ProductVariant[];

}

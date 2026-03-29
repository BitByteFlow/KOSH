import { Field, ObjectType, ID, registerEnumType, Float, Int } from '@nestjs/graphql';
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

  @Field(() => String)
  name: string;

  @Field(() => String)
  productName: string;

  @Field(() => String, { nullable: true })
  slug?: string;

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


import { Attribute } from './attribute.entity';

@ObjectType()
export class ProductVariant {
  @Field(() => ID)
  id: string;

  @Field()
  sku: string;

  @Field()
  barcode: string;

  @Field(() => Float)
  costPrice: number;

  @Field(() => Float)
  price: number;

  @Field(() => Float)
  sellingPrice: number;

  @Field(() => Int)
  stock: number;

  @Field(() => [Attribute], { nullable: true })
  attributes?: Attribute[];

  @Field()
  status: string;

  @Field()
  lowStock: boolean;

  @Field(() => Product)
  product: Product;
}

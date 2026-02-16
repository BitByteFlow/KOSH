import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class PaginationInput {
    @Field({ defaultValue: 1 })
    page?: number = 1;

    @Field({ defaultValue: 10 })
    limit?: number = 10;

    @Field({ defaultValue: 'createdAt' })
    sortBy?: string = 'createdAt';

    @Field({ defaultValue: 'desc' })
    sortOrder?: 'asc' | 'desc' = 'desc';
}


export class ProductFilterInput extends PaginationInput{
    @Field({ nullable: true })
    categoryId?: string;

    @Field({ nullable: true })
    lowStock?: number;

    @Field({ nullable: true })
    search?: string;

    @Field({ nullable: true })
    minPrice?: number;

    @Field({ nullable: true })
    maxPrice?: number;

    @Field({ defaultValue: false })
    includeDeleted?: boolean = false;

    @Field({ nullable: true })
    status?: string;
}
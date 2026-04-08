import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class PaginationInput {
	@Field(() => Number, { defaultValue: 1 })
	page?: number = 1;

	@Field(() => Number, { defaultValue: 10 })
	limit?: number = 10;

@Field(() => String,{ defaultValue: "createdAt" })
	sortBy?: string = "createdAt";

	@Field(() => String, { defaultValue: "desc" })
	sortOrder?: string = "desc";
}

@InputType()
export class ProductFilterInput extends PaginationInput {
	@Field(() => String, { nullable: true })
	categoryId?: string;

	@Field(() => Number, { nullable: true })
	lowStock?: number;

	@Field(() => String, { nullable: true })
	search?: string;

	@Field(() => Number, { nullable: true })
	minPrice?: number;

	@Field(() => Number, { nullable: true })
	maxPrice?: number;

	@Field(() => Boolean, { defaultValue: false })
	includeDeleted?: boolean = false;

	@Field(() => String, { nullable: true })
	status?: string;
}

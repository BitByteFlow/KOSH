import {Field, InputType} from "@nestjs/graphql";

@InputType()
export class GetPurchaseFilter {
    @Field(() => String, { nullable: true })
    from?: string;

    @Field(() => String, { nullable: true })
    to?: string;
}
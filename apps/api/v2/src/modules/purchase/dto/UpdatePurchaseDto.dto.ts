import { createZodDto } from "nestjs-zod";
import { updatePurchaseSchema } from "@kosh/validation";
import { Field, InputType } from "@nestjs/graphql";
import { PaymentStatus } from "@kosh/db";

@InputType()
export class UpdatePurchaseInput extends createZodDto(updatePurchaseSchema){
    @Field(() => String, { nullable: true })
    supplierName?: string;

    @Field(() => String, { nullable: true })
    email?: string;

    @Field(() => String, { nullable: true })
    contact?: string;

    @Field(() => Number, { nullable: true })
    amountPaid?: number;

    @Field(() => Date, { nullable: true })
    dueDate?: Date;

    @Field(() => PaymentStatus, { nullable: true })
    status?: PaymentStatus;
}
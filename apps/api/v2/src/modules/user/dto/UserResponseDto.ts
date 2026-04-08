import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class UserResponseInput {
    @Field(() => String)
    id!: string;
    @Field(() => String)
    username!: string
    @Field(() => String)
    email!: string

}
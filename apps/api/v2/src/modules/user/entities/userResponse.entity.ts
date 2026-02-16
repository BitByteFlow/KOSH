import { Field,  ObjectType } from "@nestjs/graphql";

@ObjectType()
export class UserResponse {
    @Field(() => String)
    id: string;
    @Field(() => String)
    username: string
    @Field(() => String)
    email: string

}
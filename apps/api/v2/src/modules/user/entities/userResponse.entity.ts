import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class User {
    @Field(() => String)
    id!: string;
    @Field(() => String)
    username!: string
    @Field(() => String)
    email!: string
}

@ObjectType()
export class UserResponse {
    @Field(() => Boolean)
    success!: boolean

    @Field(() => String, { nullable: true })
    message?: string

    @Field(() => User, { nullable: true })
    data?: User;
}
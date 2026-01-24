/* eslint-disable prettier/prettier */

import { IsEmail, IsEmpty } from "class-validator";

export class CreateUserDto {


    @IsEmpty({message:"Google Id cannot be empty!"})
    googleId: string;

    @IsEmpty({message:"Email cannot be empty!"})
    @IsEmail()
    email: string;

    @IsEmpty({message:"Image url is empty"})
    image: string;

    @IsEmpty({message:"Username is empty"})
    username: string;

}
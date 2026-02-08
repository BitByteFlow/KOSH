import { IsEmail, IsNotEmpty } from "class-validator";

export class CreateUserDto {


    @IsNotEmpty({message:"Google Id cannot be empty!"})
    googleId: string;

    @IsNotEmpty({message:"Email cannot be empty!"})
    @IsEmail()
    email: string;

    @IsNotEmpty({message:"Image url is empty"})
    image: string;

    @IsNotEmpty({message:"Username is empty"})
    username: string;

}
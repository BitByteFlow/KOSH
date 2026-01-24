/* eslint-disable prettier/prettier */
import { IsEmail, IsEmpty } from 'class-validator';
export class LoginRequestDto {

    @IsEmpty({ message: "Google Id cannot be empty!" })
    googleId: string;

    @IsEmpty({ message: "Email cannot be empty!" })
    @IsEmail()
    email: string;
}
import { IsEmail, IsNotEmpty } from 'class-validator';
export class LoginRequestDto {

    @IsNotEmpty({ message: "Google Id cannot be empty!" })
    googleId: string;

    @IsNotEmpty({ message: "Email cannot be empty!" })
    @IsEmail()
    email: string;
}
/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateTransactionDto {

    @IsString()
    @IsNotEmpty({ message: "Type cannot be empty!" })
    type: string


    @IsNotEmpty({message:"Amount is missing!"})
    @IsNumber()
    amount:number


    @IsString()
    @IsOptional()
    note?:string
}
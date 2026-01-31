/* eslint-disable prettier/prettier */
import { IsString, IsUUID, MinLength } from "class-validator";
export class UpdateProductDto {
    @IsString()
    @MinLength(2)
    name: string;

    @IsUUID()
    categoryId: string;
}
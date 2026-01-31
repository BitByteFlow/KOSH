/* eslint-disable prettier/prettier */

import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsUUID, MaxLength, Min, MinLength, ValidateNested } from "class-validator";

export class CreateProductRequestDto {

    @IsUUID()
    @IsNotEmpty({ message: "Product must belong to some category, category missing!" })
    categoryId: string


    @IsNotEmpty({ message: "Product must have a name!" })
    @MinLength(3, { message: "Name must be greater then 3 words" })
    @MaxLength(55, { message: "Name is too long!" })
    name: string

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => VariantDto)
    variants: VariantDto[]

    @IsBoolean()
    createPurchaseRecord?:boolean = false

}

class VariantDto {

    @Min(0)
    costPrice: number

    @Min(0)
    sellingPrice: number

    @Min(0)
    stock: number

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AttributeDto)
    attributes?: AttributeDto[]

}

class AttributeDto {
    @IsNotEmpty()
    @MinLength(3, { message: "Name must be greater then 3 words" })
    name: string

    @IsNotEmpty()
    value: string
}
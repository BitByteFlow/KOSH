/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsNumber, IsString, Min } from "class-validator";

export class UpdateProductVariantDto {

    @IsString()
    @IsNotEmpty({ message: "Product ID not sent!" })
    productId: string

    @IsNotEmpty({ message: "Variant ID not sent!" })
    variantId: string


    @IsNumber()
    @Min(0)
    costPrice: number;

    @IsNumber()
    @Min(0)
    sellingPrice: number;

    @IsString()
    status:string

}
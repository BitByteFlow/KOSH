import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class CreateCategoryDto {
    @IsString()
    @IsNotEmpty({ message: "Category name is required!" })
    @MinLength(3, { message: "Category name should be minimum of length 2" })
    @MaxLength(50, { message: "Category name is too long!" })
    name: string
}

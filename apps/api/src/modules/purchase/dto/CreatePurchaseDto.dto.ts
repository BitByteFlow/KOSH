import { Type } from 'class-transformer';
import {
    IsArray,
    IsDate,
    IsEmail,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    IsUUID,
    Min,
    ValidateNested
} from 'class-validator';

export class PurchaseVariantItemDto {
    @IsUUID()
    @IsNotEmpty({ message: 'Variant ID is required' })
    variantId: string;

    @IsNumber()
    @IsPositive({ message: 'Quantity must be positive' })
    @Min(1, { message: 'Minimum quantity is 1' })
    quantity: number;

    @IsNumber()
    @IsPositive({ message: 'Price must be positive' })
    price: number;
}

export class CreatePurchaseDto {
    @IsString()
    @IsNotEmpty({ message: 'Supplier name is required' })
    supplierName: string;

    @IsOptional()
    @IsEmail({}, { message: 'Invalid email format' })
    email?: string;

    @IsOptional()
    @IsString({ message: 'Contact must be a string' })
    contact?: string;

    @IsNumber()
    @Min(0, { message: 'Amount paid cannot be negative' })
    amountPaid: number = 0;

    @IsOptional()
    @IsDate({ message: 'Invalid date format' })
    @Type(() => Date)
    dueDate?: Date;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PurchaseVariantItemDto)
    variants: PurchaseVariantItemDto[];
}

export class PayPurchaseDebtDto {
    @IsNumber()
    @IsPositive({ message: 'Payment amount must be positive' })
    @Min(1, { message: 'Minimum payment amount is 1' })
    amount: number;
}
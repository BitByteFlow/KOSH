import { Type } from 'class-transformer';
import { IsDate, IsEmail, IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdatePurchaseDto {
    @IsOptional()
    @IsString()
    supplierName?: string;

    @IsOptional()
    @IsEmail({}, { message: 'Invalid email format' })
    email?: string;

    @IsOptional()
    @IsString()
    contact?: string;

    @IsOptional()
    @IsNumber()
    @Min(0, { message: 'Amount paid cannot be negative' })
    amountPaid?: number;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    dueDate?: Date;

    @IsOptional()
    @IsString()
    @IsIn(['PENDING', 'PARTIAL', 'PAID', 'OVERDUE'], {
        message: 'Status must be one of: PENDING, PARTIAL, PAID, OVERDUE'
    })
    status?: string;
}
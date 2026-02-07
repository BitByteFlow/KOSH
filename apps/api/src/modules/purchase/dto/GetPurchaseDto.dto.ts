/* eslint-disable prettier/prettier */
import { IsDateString, IsOptional } from 'class-validator';

export class GetPurchaseFilter {
    @IsOptional()
    @IsDateString()
    from?: string;

    @IsOptional()
    @IsDateString()
    to?: string;
}
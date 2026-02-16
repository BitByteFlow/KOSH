import { Module } from '@nestjs/common';
import { SaleResolver } from './sale.resolver';

@Module({
  providers: [SaleResolver]
})
export class SaleModule {}

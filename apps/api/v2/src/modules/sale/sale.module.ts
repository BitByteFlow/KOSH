import { Module } from '@nestjs/common';
import { SaleResolver } from './sale.resolver';
import { SalesService } from './sale.service';

@Module({
  providers: [SaleResolver, SalesService]
})
export class SaleModule {}

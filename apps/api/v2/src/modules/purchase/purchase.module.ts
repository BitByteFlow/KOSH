import { Module } from '@nestjs/common';
import { PurchaseResolver } from './purchase.resolver';
import { PurchasesService } from './purchase.service';

@Module({
  providers: [PurchaseResolver, PurchasesService]
})
export class PurchaseModule {}

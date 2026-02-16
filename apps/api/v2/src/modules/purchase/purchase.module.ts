import { Module } from '@nestjs/common';
import { PurchaseResolver } from './purchase.resolver';
import { PurchaseService } from './purchase.service';

@Module({
  providers: [PurchaseResolver, PurchaseService]
})
export class PurchaseModule {}

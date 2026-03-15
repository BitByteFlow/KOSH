import { Module } from '@nestjs/common';
import { SaleResolver } from './sale.resolver';
import { SalesService } from './sale.service';
import { DatabaseModule } from 'src/database/database.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [DatabaseModule, NotificationModule],
  providers: [SaleResolver, SalesService]
})
export class SaleModule { }

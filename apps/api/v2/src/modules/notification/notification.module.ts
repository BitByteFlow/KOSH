import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationResolver } from './notification.resolver';
import { DatabaseModule } from 'src/database/database.module';
import { PubSubModule } from './pubsub.module';

@Module({
	imports: [DatabaseModule, PubSubModule],
	providers: [NotificationService, NotificationResolver],
	exports: [NotificationService],
})
export class NotificationModule { }

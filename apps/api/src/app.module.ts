import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { DatabaseService } from './database/database.service';

@Module({
  imports: [DatabaseModule],
  controllers: [AppController],
  providers: [AppService],
  exports: [DatabaseService],
})
export class AppModule {}

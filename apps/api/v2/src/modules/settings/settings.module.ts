import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingsResolver } from './settings.resolver';
import { DatabaseModule } from 'src/database/database.module';

@Module({
	imports: [DatabaseModule],
	providers: [SettingsService, SettingsResolver],
	exports: [SettingsService],
})
export class SettingsModule { }

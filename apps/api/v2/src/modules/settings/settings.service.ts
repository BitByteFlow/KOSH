import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { UpdateSettingsInput } from './dto/update-settings.input';
import { SettingsResponse } from './entities/settings-response.entity';

@Injectable()
export class SettingsService {
	constructor(private readonly database: DatabaseService) { }

	async getSettings(storeId: string): Promise<SettingsResponse> {
		try {
			let settings = await this.database.prisma.settings.findUnique({
				where: { storeId },
			});

			// Auto-create settings if they don't exist
			if (!settings) {
				settings = await this.database.prisma.settings.create({
					data: {
						storeId,
						lowStockThreshold: 10,
						autoArchive: false,
						emailReports: true,
						pushNotifications: false,
					},
				});
			}

			return {
				success: true,
				message: 'Settings fetched successfully',
				data: settings,
			};
		} catch (error) {
			return {
				success: false,
				message: `Failed to fetch settings: ${error.message}`,
			};
		}
	}

	async updateSettings(
		storeId: string,
		input: UpdateSettingsInput,
	): Promise<SettingsResponse> {
		try {
			const settings = await this.database.prisma.settings.upsert({
				where: { storeId },
				update: {
					...input,
				},
				create: {
					storeId,
					lowStockThreshold: input.lowStockThreshold ?? 10,
					autoArchive: input.autoArchive ?? false,
					emailReports: input.emailReports ?? true,
					pushNotifications: input.pushNotifications ?? false,
				},
			});

			return {
				success: true,
				message: 'Settings updated successfully',
				data: settings,
			};
		} catch (error) {
			return {
				success: false,
				message: `Failed to update settings: ${error.message}`,
			};
		}
	}
}

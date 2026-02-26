import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { UpdateSettingsInput } from './dto/update-settings.input';
import { SettingsResponse } from './entities/settings-response.entity';

@Injectable()
export class SettingsService {
	constructor(private readonly database: DatabaseService) { }

	async getSettings(userId: string): Promise<SettingsResponse> {
		try {
			let settings = await this.database.prisma.settings.findUnique({
				where: { userId },
			});

			// Auto-create settings if they don't exist
			if (!settings) {
				settings = await this.database.prisma.settings.create({
					data: {
						userId,
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
		userId: string,
		input: UpdateSettingsInput,
	): Promise<SettingsResponse> {
		try {
			const settings = await this.database.prisma.settings.upsert({
				where: { userId },
				update: {
					...input,
				},
				create: {
					userId,
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

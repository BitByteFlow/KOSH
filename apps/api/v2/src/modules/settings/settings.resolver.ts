import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { SettingsService } from './settings.service';
import { SettingsResponse } from './entities/settings-response.entity';
import { UpdateSettingsInput } from './dto/update-settings.input';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/utils/jwt.guard';
import { CurrentUser } from 'src/utils/currentUser.decorator';
import type { AuthenticatedUser } from 'src/types/jwt.types';

@Resolver()
@UseGuards(JwtAuthGuard)
export class SettingsResolver {
	constructor(private readonly settingsService: SettingsService) { }

	@Query(() => SettingsResponse)
	async settings(@CurrentUser() user: AuthenticatedUser): Promise<SettingsResponse> {
		return this.settingsService.getSettings(user.id);
	}

	@Mutation(() => SettingsResponse)
	async updateSettings(
		@CurrentUser() user: AuthenticatedUser,
		@Args('input') input: UpdateSettingsInput,
	): Promise<SettingsResponse> {
		return this.settingsService.updateSettings(user.id, input);
	}
}

import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { SettingsService } from './settings.service';
import { SettingsResponse } from './entities/settings-response.entity';
import { UpdateSettingsInput } from './dto/update-settings.input';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/utils/jwt.guard';
import { StoreGuard } from 'src/utils/store.guard';
import { CurrentUser } from 'src/utils/currentUser.decorator';
import { CurrentStore } from 'src/utils/currentStore.decorator';
import type { AuthenticatedUser } from 'src/types/jwt.types';

@Resolver()
@UseGuards(JwtAuthGuard, StoreGuard)
export class SettingsResolver {
	constructor(private readonly settingsService: SettingsService) { }

	@Query(() => SettingsResponse)
	async settings(
        @CurrentUser() user: AuthenticatedUser,
        @CurrentStore() storeId: string,
    ): Promise<SettingsResponse> {
		return this.settingsService.getSettings(storeId);
	}

	@Mutation(() => SettingsResponse)
	async updateSettings(
		@CurrentUser() user: AuthenticatedUser,
        @CurrentStore() storeId: string,
		@Args('input') input: UpdateSettingsInput,
	): Promise<SettingsResponse> {
		return this.settingsService.updateSettings(storeId, input);
	}
}

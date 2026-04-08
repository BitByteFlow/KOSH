import { ObjectType, Field } from '@nestjs/graphql';
import { Settings } from './settings.entity';

@ObjectType()
export class SettingsResponse {
	@Field()
	success!: boolean;

	@Field()
	message!: string;

	@Field(() => Settings, { nullable: true })
	data?: Settings;
}

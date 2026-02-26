import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class UpdateSettingsInput {
	@Field(() => Int, { nullable: true })
	lowStockThreshold?: number;

	@Field(() => Boolean, { nullable: true })
	autoArchive?: boolean;

	@Field(() => Boolean, { nullable: true })
	emailReports?: boolean;

	@Field(() => Boolean, { nullable: true })
	pushNotifications?: boolean;
}

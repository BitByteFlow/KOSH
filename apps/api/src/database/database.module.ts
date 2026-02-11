import { Global, Module } from "@nestjs/common";
import { DatabaseService } from "./database.service";
import { PrismaClient } from "@kosh/db";
import { ConfigModule } from "@nestjs/config";

@Global()
@Module({
	imports: [ConfigModule],
	providers: [
		{
			provide: "DATABASE_CONNECTION",
			useValue: PrismaClient,
		},
		DatabaseService,
	],
	exports: [DatabaseService],
})
export class DatabaseModule {}

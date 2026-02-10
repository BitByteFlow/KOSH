import { Global, Module } from "@nestjs/common";
import { DatabaseService } from "./database.service";
import { PrismaClient } from "@kosh/db";

@Global()
@Module({
	providers: [
		{
			provide: "DATABASE_CONNECTION",
			useValue: PrismaClient,
		},
		DatabaseService,
	],
	exports: ["DATABASE_CONNECTION", DatabaseService],
})
export class DatabaseModule {}

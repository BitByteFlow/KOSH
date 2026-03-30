import { Module } from "@nestjs/common";
import { AccountsResolver } from "./accounts.resolver";
import { AccountsService } from "./accounts.service";
import { AccountController } from "./accounts.controller";

@Module({
	providers: [AccountsResolver, AccountsService],
	controllers: [AccountController],
})
export class AccountsModule {}

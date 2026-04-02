import { Module } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";
import { HealthController } from "./health.controller";
import { HealthService } from "./health.service";
import { DatabaseModule } from "src/database/database.module";

@Module({
	imports: [TerminusModule, DatabaseModule],
	controllers: [HealthController],
	providers: [HealthService],
	exports: [HealthService],
})
export class HealthModule {}

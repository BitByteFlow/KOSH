import { Module, Global } from "@nestjs/common";
import { SentryService } from "./sentry/sentry.service";
import { PrismaErrorHandler } from "./prisma/prisma-error.handler";

@Global()
@Module({
	providers: [SentryService, PrismaErrorHandler],
	exports: [SentryService, PrismaErrorHandler],
})
export class ObservabilityModule {}

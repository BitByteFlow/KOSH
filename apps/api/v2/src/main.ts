import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { ZodValidationPipe } from "nestjs-zod";
import cookieParser from "cookie-parser";
import * as Sentry from "@sentry/nestjs";
import { SentryExceptionFilter } from "./common/filters/sentryFilter";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.setGlobalPrefix("/api/v2");

	const configService = app.get(ConfigService);

	app.enableCors({
		origin: "*",
		credentials: true,
	});
	app.use(cookieParser());
	app.useGlobalPipes(new ZodValidationPipe());

	// Use global exception filter for non-GraphQL errors
	app.useGlobalFilters(new SentryExceptionFilter());

	try {
		const port = configService.get("PORT");
		await app.listen(port);
		console.log(`Application is running on: http://localhost:${port}`);
	} catch (error) {
		Sentry.captureException(error);
		console.error("❌ Failed to start application:", error);
		process.exit(1);
	}
}
bootstrap();

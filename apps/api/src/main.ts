import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Logger as PinoLogger } from "nestjs-pino";
import helmet from "helmet";
import { ConfigService } from "@nestjs/config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ZodValidationPipe } from "nestjs-zod";

async function bootstrap() {
	const app = await NestFactory.create(AppModule, { bufferLogs: true });
	const configService = app.get(ConfigService);

	app.useLogger(app.get(PinoLogger));
	app.setGlobalPrefix("api/v1");

	app.use(helmet());
	app.enableCors({
		origin: configService.get("CORS_ORIGIN") || "*", // Default to * if not set, but should be set in prod
		credentials: true,
	});

	app.useGlobalPipes(new ZodValidationPipe());

	const config = new DocumentBuilder()
		.setTitle("Kosh API")
		.setDescription("The Kosh API description")
		.setVersion("1.0")
		.addBearerAuth()
		.build();

	// const document = SwaggerModule.createDocument(app, config);
	// console.log("what here")
	// console.log("what here")

	// SwaggerModule.setup("api/docs", app, document);

	try {
		const port = parseInt(process.env.PORT ?? "3001", 10);
		await app.listen(port);

		console.log(
			`🚀 Application is running on: http://localhost:${port}/api/v1`,
		);
		console.log(
			`📖 Swagger documentation available at: http://localhost:${port}/api/docs`,
		);
	} catch (error) {
		console.error("❌ Failed to start application:", error);
		process.exit(1);
	}
}
bootstrap().catch((error) => {
	Logger.error("Error starting the server", error);
	process.exit(1);
});

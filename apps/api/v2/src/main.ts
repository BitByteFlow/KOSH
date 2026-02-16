import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ZodValidationPipe } from 'nestjs-zod';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);

	const configService = app.get(ConfigService);
	app.setGlobalPrefix("api/v2");

  app.enableCors({
    origin: "*",
    credentials: true,
  })

	app.useGlobalPipes(new ZodValidationPipe());

  try {
    const port = configService.get("PORT")
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}/api/v2`);
  } catch (error) {
    console.error("❌ Failed to start application:", error);
    process.exit(1);
  }
}
bootstrap();

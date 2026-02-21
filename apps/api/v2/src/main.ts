import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ZodValidationPipe } from 'nestjs-zod';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix("/api/v2")

	const configService = app.get(ConfigService);

  app.enableCors({
    origin: "*",
    credentials: true,
  })

	app.useGlobalPipes(new ZodValidationPipe());

  try {
    const port = configService.get("PORT")
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
  } catch (error) {
    console.error("❌ Failed to start application:", error);
    process.exit(1);
  }
}
bootstrap();

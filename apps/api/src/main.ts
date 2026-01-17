import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1/');
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap().catch((error) => {
  Logger.error('Error starting the server', error);
  process.exit(1);
});

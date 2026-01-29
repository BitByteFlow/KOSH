/* eslint-disable prettier/prettier */
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1/');
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    disableErrorMessages: false,
    transform:true

  }))
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap().catch((error) => {
  Logger.error('Error starting the server', error);
  process.exit(1);
});

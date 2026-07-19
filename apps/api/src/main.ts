import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env['PORT'] || 3000;

  app.enableCors();
  app.setGlobalPrefix('api/v1');

  await app.listen(port);
  Logger.log(`🚀 API running on http://localhost:${port}`, 'Bootstrap');
}

bootstrap();

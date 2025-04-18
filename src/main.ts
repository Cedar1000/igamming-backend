import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { ValidationPipe } from '@nestjs/common';

import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',

    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    // allowed headers
    allowedHeaders: [
      'Content-Type',
      'Origin',
      'X-Requested-With',
      'Accept',
      'Authorization',
    ],
    // headers exposed to the client
    exposedHeaders: ['Authorization'],
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  await app.listen(3003);
}
bootstrap();

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import compression from 'compression';
import mongoose from 'mongoose';
import { AppModule } from './app.module';
import { Environments } from './utils/env';
import { storeMiddleWare } from './utils/request-store';

async function bootstrap() {
  const logger = new Logger('Main');

  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.use(compression({ threshold: 0 }));

  app.enableCors((req, callback) => {
    const origin =
      process.env.PROJECT_ENVIRONMENT === Environments.PRODUCTION
        ? process.env.CORS_ORIGIN
        : req.header('origin');

    callback(null, {
      origin: origin,
      methods: 'GET,PUT,PATCH,POST,DELETE',
    });
  });

  app.use(storeMiddleWare);

  const validationPipe = new ValidationPipe({
    transform: true,
    whitelist: true,
    validateCustomDecorators: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  });
  app.useGlobalPipes(validationPipe);

  mongoose.set('toJSON', {
    virtuals: true,
    getters: true,
    versionKey: false,
    transform: (_, ret) => {
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  });
  mongoose.set('toObject', {
    virtuals: true,
    getters: true,
    versionKey: false,
    transform: (_, ret) => {
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  });
  mongoose.set('debug', { color: true, shell: true });

  const microservices = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT!),
    },
  });

  microservices.useGlobalPipes(validationPipe);

  await app.startAllMicroservices();

  const port = process.env.PORT || 3000;
  await app.listen(port).then(() => {
    logger.log(`Server is running on port ${port}`);
  });
}
bootstrap();

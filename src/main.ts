import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { setup } from './setup';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:8080', 'http://localhost:4000'],
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  setup(app);
  await app.listen(3000);
}

bootstrap();

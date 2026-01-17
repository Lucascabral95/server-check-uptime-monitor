import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import corsOptions from './config/cors';
import routesExcludesPrefix from './config/routes-excludes-prefix';
import { envs } from './config/envs.schema';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors(corsOptions);

  app.setGlobalPrefix("api/v1", {
    exclude: routesExcludesPrefix,
  });

  app.useGlobalPipes(
 new ValidationPipe({
 whitelist: true,
 forbidNonWhitelisted: true,
 })
);

  await app.listen(envs.port ?? 4000, "0.0.0.0");
}
bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import corsOptions from './config/cors';
import routesExcludesPrefix from './config/routes-excludes-prefix';
import { envs } from './config/envs.schema';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config =  new DocumentBuilder()
  .setTitle("Uptime Monitor API")
  .setDescription("API for monitoring server uptime")
  .setVersion("0.0.1")
  .addBearerAuth({
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
    name: "JWT",
    description: "Enter JWT token",
    in: "header",
  })
  .addTag("uptime")
  .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, documentFactory);

  app.enableCors(corsOptions);

  app.setGlobalPrefix("api/v1", {
    exclude: routesExcludesPrefix,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  await app.listen(envs.port ?? 4000, "0.0.0.0");
}
bootstrap();

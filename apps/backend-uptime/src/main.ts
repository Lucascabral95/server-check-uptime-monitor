import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import corsOptions from './config/cors';
import routesExcludesPrefix from './config/routes-excludes-prefix';
import { envs } from './config/envs.schema';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PrismaExceptionFilter } from './errors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Sin esto, NINGÚN onModuleDestroy/beforeApplicationShutdown/
  // onApplicationShutdown corre en SIGTERM/SIGINT: el buffer de PingLog no
  // se flushea, los pools de undici y el pool de pg no se cierran, y Redis
  // queda con conexiones colgadas en cada deploy/reinicio.
  app.enableShutdownHooks(['SIGTERM', 'SIGINT']);

  app.use(helmet());

  const isProduction = envs.node_env === 'production';

  if (!isProduction) {
    // Swagger UI expone la forma completa de la API (rutas, DTOs, ejemplos);
    // no tiene por qué estar accesible públicamente en producción.
    const config = new DocumentBuilder()
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
  }

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

  app.useGlobalFilters(new PrismaExceptionFilter());

  await app.listen(envs.port ?? 4000, "0.0.0.0");
}
bootstrap();

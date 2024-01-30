import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ConfigUsers } from '@project/libs/config/users';
import { setupSwaggerSpec, generateSwaggerClient } from '@project/libs/shared/helpers';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService<ConfigUsers>);
  const name = config.get('app.name', { infer: true });
  const port = config.get('app.port', { infer: true });
  const version = config.get('app.api.version', { infer: true });
  const prefix = config.get('app.api.prefix', { infer: true });
  const HOSTNAME = `http://localhost:${port}`;
  const SPEC_PATH = `${prefix}/spec`;

  app.setGlobalPrefix(prefix);
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    validateCustomDecorators: true,
  }));

  setupSwaggerSpec({
    app: app,
    path: SPEC_PATH,
    version: version,
    name: name,
  });

  await app.listen(port);

  Logger.log(`🚀 Application [${name}] is running on: ${HOSTNAME}/${prefix}`);
  Logger.log(`📗 Specification [${name}] is running on: ${HOSTNAME}/${SPEC_PATH}`);

  await generateSwaggerClient({
    app: app,
    host: HOSTNAME,
    path: SPEC_PATH,
    version: version,
    name: name,
  });
}

bootstrap();

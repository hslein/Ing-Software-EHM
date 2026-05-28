import { NestFactory } from '@nestjs/core';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { loadEnvFile } from 'node:process';
import { AppModule } from './app.module';

const envPaths = [
  join(process.cwd(), 'apps', 'ehm_back', '.env'),
  join(process.cwd(), '.env'),
  join(__dirname, '..', '..', '..', 'apps', 'ehm_back', '.env'),
];

const envPath = envPaths.find((path) => existsSync(path));

if (envPath) {
  loadEnvFile(envPath);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

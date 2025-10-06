import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import cors from 'cors';
import { AppModule } from './app.module.js';
import { CredentialsService } from './credentials/credential.service.js';
import { KeysService } from './keys/keys.service.js';
import { appRouter } from './trpc/router.js';

const TRPC_PREFIX = '/api/trpc';
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:5173';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableShutdownHooks();

  // CORS before tRPC
  app.use(
    TRPC_PREFIX,
    cors({
      origin: CORS_ORIGIN,
      credentials: true,
      methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-trpc-source', 'x-requested-with'],
      optionsSuccessStatus: 204,
    }),
  );

  // tRPC mounting
  // Resolve services once instead of per-request to reduce overhead
  const credentialsService = await app.resolve<CredentialsService>(CredentialsService);
  const keysService = await app.resolve<KeysService>(KeysService);
  app.use(
    TRPC_PREFIX,
    createExpressMiddleware({
      router: appRouter,
      createContext: async () => ({
        credentialsService,
        keysService,
      }),
    }),
  );

  await app.listen(Number(process.env.PORT ?? 3000), '0.0.0.0');
  Logger.log(
    `Server up on http://localhost:${process.env.PORT ?? 3000} (CORS_ORIGIN=${CORS_ORIGIN})`,
    'Bootstrap',
  );
}
bootstrap();

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import cors from 'cors';
import { AppModule } from './app.module.js';
import { CredentialsService } from './credentials/credential.service.js';
import { KeysService } from './keys/keys.service.js';
import { appRouter } from './trpc/router.js';

const TRPC_PREFIX = '/api/trpc';
const DEFAULT_DEV_ORIGIN = 'http://localhost:5173';
const RAW_CORS = process.env.CORS_ORIGIN;
const IS_PROD = process.env.NODE_ENV === 'production';
const ALLOWED_ORIGINS =
  (RAW_CORS &&
    RAW_CORS.split(',')
      .map((s) => s.trim())
      .filter(Boolean)) ||
  (IS_PROD ? [] : [DEFAULT_DEV_ORIGIN]);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableShutdownHooks();

  // CORS before tRPC
  app.use(
    TRPC_PREFIX,
    cors({
      // Allow only configured origins. In production, deny cross-origin by default if none are configured.
      origin: (origin, callback) => {
        if (!origin) return callback(null, true); // non-browser or same-origin requests
        const allowed = ALLOWED_ORIGINS.includes(origin);
        if (allowed) return callback(null, true);
        if (IS_PROD && ALLOWED_ORIGINS.length === 0) {
          Logger.warn(
            'No CORS_ORIGIN configured in production – denying cross-origin request',
            'CORS',
          );
        }
        return callback(new Error('CORS origin not allowed'), false);
      },
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
    `Server up on http://localhost:${process.env.PORT ?? 3000} (allowed origins: ${
      ALLOWED_ORIGINS.length ? ALLOWED_ORIGINS.join(', ') : 'none'
    })`,
    'Bootstrap',
  );
}
bootstrap();

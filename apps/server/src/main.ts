import { NestFactory } from '@nestjs/core';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import cors from 'cors';
import { AppModule } from './app.module.js';
import { CredentialsService } from './credentials/credential.service.js';
import { KeysService } from './keys/keys.service.js';
import { appRouter } from './trpc/router.js';

const FRONTEND = 'http://localhost:5173';
const TRPC_PREFIX = '/api/trpc';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  // CORS before tRPC
  app.use(
    TRPC_PREFIX,
    cors({
      origin: FRONTEND,
      credentials: true,
      methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-trpc-source', 'x-requested-with'],
      optionsSuccessStatus: 204,
    }),
  );

  // tRPC mounting
  app.use(
    TRPC_PREFIX,
    createExpressMiddleware({
      router: appRouter,
      createContext: async () => ({
        credentialsService: await app.resolve<CredentialsService>(CredentialsService),
        keysService: await app.resolve<KeysService>(KeysService),
      }),
    }),
  );

  await app.listen(Number(process.env.PORT ?? 3000), '0.0.0.0');
  console.log(`[server] up on http://localhost:${process.env.PORT ?? 3000}`);
}
bootstrap();

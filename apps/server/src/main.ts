import { NestFactory } from '@nestjs/core';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import * as express from 'express';
import 'reflect-metadata';
import { AppModule } from './app.module.js';
import { CredentialsService } from './credentials/credential.service.js';
import { KeysService } from './keys/keys.service.js';
import { appRouter } from './trpc/router.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  // tRPC setup under /api/trpc
  const httpAdapter = app.getHttpAdapter();
  // Nest's ExpressAdapter#getInstance is untyped; we cast to express.Express
  const instance = httpAdapter.getInstance() as express.Express;
  instance.use(
    '/api/trpc',
    createExpressMiddleware({
      router: appRouter,
      createContext: () => ({
        credentialsService: app.get(CredentialsService),
        keysService: app.get(KeysService),
      }),
    }),
  );
  const port = process.env.SERVER_PORT
    ? Number(process.env.SERVER_PORT)
    : process.env.PORT
      ? Number(process.env.PORT)
      : 3000;
  // Basic request logger (dev only)
  if (process.env.NODE_ENV !== 'production') {
    app.use((req: express.Request, _res: express.Response, next: express.NextFunction) => {
      // eslint-disable-next-line no-console
      console.log('[REQ]', req.method, req.url);
      next();
    });
  }
  await app.listen(port, '0.0.0.0');
  // eslint-disable-next-line no-console
  console.log(`[server] listening on http://localhost:${port}`);
}
bootstrap();

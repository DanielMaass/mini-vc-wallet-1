declare module '@mini-vc-wallet-1/trpc' {
  import type { appRouter } from '../../server/dist/src/trpc/router.js';
  export type AppRouter = typeof appRouter;
}

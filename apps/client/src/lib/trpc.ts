import { createTRPCReact } from '@mini-vc-wallet-1/trpc/client';
import type { appRouter } from '@server/app';
type AppRouter = typeof appRouter;

export const trpc = createTRPCReact<AppRouter>();

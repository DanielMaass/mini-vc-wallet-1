import { createTRPCReact } from '@mini-vc-wallet-1/trpc/client';
import type { AppRouter } from '@server/app';

export const trpc = createTRPCReact<AppRouter>();

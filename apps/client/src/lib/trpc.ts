import { createTRPCReact } from '@mini-vc-wallet-1/trpc/client';
import type { AppRouter } from '@mini-vc-wallet-1/api-types';

export const trpc = createTRPCReact<AppRouter>();

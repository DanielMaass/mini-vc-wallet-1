import type { AppRouter } from '@mini-vc-wallet-1/server'; // adjust if needed; path mapping may require workspace reference
import { httpBatchLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';

export const trpc = createTRPCReact<AppRouter>();

export function createTrpcClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: '/api/trpc',
      }),
    ],
  });
}

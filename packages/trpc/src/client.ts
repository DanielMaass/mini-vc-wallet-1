import { createTRPCReact } from '@trpc/react-query';
import { createTRPCClient, httpBatchLink, loggerLink } from '@trpc/client';

export const trpc = createTRPCReact<AppRouter>();

export function createClient(baseUrl: string) {
  const url = `${baseUrl.replace(/\/$/, '')}/trpc`;
  return createTRPCClient<AppRouter>({
    links: [loggerLink(), httpBatchLink({ url })],
  });
}

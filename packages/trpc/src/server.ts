import { initTRPC } from '@trpc/server';

export function createTRPC<Ctx>() {
  const t = initTRPC.context<Ctx>().create();
  return {
    router: t.router,
    procedure: t.procedure,
    middleware: t.middleware,
  };
}

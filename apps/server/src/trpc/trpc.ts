import { initTRPC } from '@trpc/server';
import z from 'zod';
import {
  CreateVCInput,
  createVCSchema,
  VerifiableCredential,
  VerifiableCredentialSchema,
} from '../credentials/credential.entity.js';
import { CredentialsService } from '../credentials/credential.service.js';
import { KeysService } from '../keys/keys.service.js';

// Context factory (extend later with auth, db, etc.)
export interface TrpcContext {
  credentialsService: CredentialsService;
  keysService: KeysService;
}

const t = initTRPC.context<TrpcContext>().create();

export const appRouter = t.router({
  createCredential: t.procedure
    .input(createVCSchema)
    .mutation(async ({ input, ctx }: { input: CreateVCInput; ctx: TrpcContext }) => {
      return ctx.credentialsService.create(input);
    }),
  listCredentials: t.procedure.query(async ({ ctx }: { ctx: TrpcContext }) =>
    ctx.credentialsService.getAll(),
  ),
  getCredentialById: t.procedure
    .input(z.string())
    .query(async ({ input, ctx }: { input: string; ctx: TrpcContext }) => {
      return ctx.credentialsService.getById(input);
    }),
  deleteCredentialById: t.procedure
    .input(z.string())
    .mutation(async ({ input, ctx }: { input: string; ctx: TrpcContext }) => {
      await ctx.credentialsService.deleteById(input);
    }),
  verifyCredential: t.procedure
    .input(VerifiableCredentialSchema)
    .mutation(async ({ input, ctx }: { input: VerifiableCredential; ctx: TrpcContext }) => {
      return ctx.credentialsService.verify(input);
    }),
  listPublicKeys: t.procedure.query(async ({ ctx }: { ctx: TrpcContext }) =>
    ctx.keysService.getAllPublicKeys(),
  ),
  listIds: t.procedure.query(async ({ ctx }: { ctx: TrpcContext }) => ctx.keysService.getAllIds()),
});

export type AppRouter = typeof appRouter;

import {
  CreateVCInput,
  createVCSchema,
  VerifiableCredential,
  VerifiableCredentialSchema,
} from '@mini-vc-wallet-1/contracts';
import { createTRPC } from '@mini-vc-wallet-1/trpc/server';
import z from 'zod';
import { CredentialsService } from '../credentials/credential.service.js';
import { KeysService } from '../keys/keys.service.js';

// Context factory (extend later with auth, db, etc.)
export interface TrpcContext {
  credentialsService: CredentialsService;
  keysService: KeysService;
}

const { router, procedure } = createTRPC<TrpcContext>();

export const appRouter = router({
  createCredential: procedure
    .input(createVCSchema)
    .mutation(async ({ input, ctx }: { input: CreateVCInput; ctx: TrpcContext }) => {
      return ctx.credentialsService.create(input);
    }),
  listCredentials: procedure.query(async ({ ctx }: { ctx: TrpcContext }) =>
    ctx.credentialsService.getAll(),
  ),
  getCredentialById: procedure
    .input(z.string())
    .query(async ({ input, ctx }: { input: string; ctx: TrpcContext }) => {
      return ctx.credentialsService.getById(input);
    }),
  deleteCredentialById: procedure
    .input(z.string())
    .mutation(async ({ input, ctx }: { input: string; ctx: TrpcContext }) => {
      await ctx.credentialsService.deleteById(input);
    }),
  verifyCredential: procedure
    .input(VerifiableCredentialSchema)
    .mutation(async ({ input, ctx }: { input: VerifiableCredential; ctx: TrpcContext }) => {
      return ctx.credentialsService.verify(input);
    }),
  listPublicKeys: procedure.query(async ({ ctx }: { ctx: TrpcContext }) =>
    ctx.keysService.getAllPublicKeys(),
  ),
  listIds: procedure.query(async ({ ctx }: { ctx: TrpcContext }) => ctx.keysService.getAllIds()),
});

export type AppRouter = typeof appRouter;

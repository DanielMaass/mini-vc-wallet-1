import z from 'zod';

export const publicJwkSchema = z.object({
  kid: z.string(),
  kty: z.string(),
  crv: z.string(),
  x: z.string(),
});

export type publicJwk = z.infer<typeof publicJwkSchema>;

export const privateJwkSchema = publicJwkSchema.extend({
  d: z.string(),
});

export const keyPairSchema = z.object({
  publicJwk: publicJwkSchema,
  privateJwk: privateJwkSchema,
});

export type KeyPair = z.infer<typeof keyPairSchema>;

export const keysSchema = z.record(z.string(), keyPairSchema);

export type Keys = z.infer<typeof keysSchema>;

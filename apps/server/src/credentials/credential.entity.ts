import z from 'zod';

export const CredentialProofSchema = z.object({
  type: z.literal('Ed25519Signature2018'),
  created: z.string(),
  proofPurpose: z.string(),
  verificationMethod: z.string(),
  jws: z.string(),
});

export type CredentialProof = z.infer<typeof CredentialProofSchema>;

export const VerifiableCredentialSchema = z.object({
  '@context': z.array(z.string()).optional(),
  id: z.string(),
  type: z.array(z.string()),
  issuer: z.string(),
  issuanceDate: z.string(),
  expirationDate: z.string().optional(),
  notBefore: z.string().optional(),
  credentialSubject: z.record(z.string(), z.string()),
  proof: CredentialProofSchema,
});

export type VerifiableCredential = z.infer<typeof VerifiableCredentialSchema>;

export const claimEntrySchema = z.object({
  key: z.string().min(1, 'Key cannot be empty'),
  value: z.string().min(1, 'Value cannot be empty'),
});

export const createVCSchema = z.object({
  type: z.string().min(1, { message: 'Type cannot be empty' }),
  claims: z.array(claimEntrySchema).min(1, { message: 'Claims must have at least one entry' }),
  subject: z.string().min(1, { message: 'Subject cannot be empty' }),
  issuer: z.string().min(1, { message: 'Issuer cannot be empty' }),
});

export type CreateVCInput = z.infer<typeof createVCSchema>;

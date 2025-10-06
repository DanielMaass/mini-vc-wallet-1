import {
  CreateVCInput,
  type VerifiableCredential,
  VerifiableCredentialSchema,
} from '@mini-vc-wallet-1/contracts';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import { CompactJWSHeaderParameters, CompactSign, compactVerify, importJWK } from 'jose';
import { canonicalize } from 'json-canonicalize';
import * as path from 'path';
import z from 'zod';
import { KeysService } from '../keys/keys.service.js';

@Injectable()
export class CredentialsService {
  private filePath: string;
  private cache: VerifiableCredential[] | null = null;
  // jose importJWK returns different key types depending on runtime; use a permissive cache type

  constructor(private readonly keysService: KeysService) {
    const configured = process.env.CREDENTIALS_FILE;
    this.filePath = configured
      ? path.resolve(configured)
      : path.resolve(process.cwd(), 'data', 'credentials.json');
    this.ensureDir();
  }

  private ensureDir() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private readFile(): VerifiableCredential[] {
    if (this.cache) return this.cache;
    if (!fs.existsSync(this.filePath)) {
      this.cache = [];
      return this.cache;
    }
    try {
      const raw = fs.readFileSync(this.filePath, 'utf-8');
      const data = JSON.parse(raw);
      const parsed = z.array(VerifiableCredentialSchema).parse(data);
      this.cache = parsed;
      return parsed;
    } catch (error: unknown) {
      Logger.warn(
        `Failed to read or parse credentials file at ${this.filePath}: ${
          error instanceof Error ? error.message : String(error)
        }`,
        'CredentialsService',
      );
      this.cache = [];
      return this.cache;
    }
  }

  private writeFile(credentials: VerifiableCredential[]) {
    this.cache = credentials;
    // atomic write to reduce risk of partial writes
    const tmpPath = `${this.filePath}.tmp`;
    fs.writeFileSync(tmpPath, JSON.stringify(credentials, null, 2));
    fs.renameSync(tmpPath, this.filePath);
  }

  private async getKeyPairById(id: string) {
    const keys = await this.keysService.getById(id);
    if (!keys) {
      throw new NotFoundException('No keys found for issuer');
    }
    return keys;
  }

  private async getCryptoKeysById(id: string) {
    const { privateJwk, publicJwk } = await this.getKeyPairById(id);
    const privateKey = await importJWK(privateJwk, 'EdDSA');
    const publicKey = await importJWK(publicJwk, 'EdDSA');
    return { privateKey, publicKey };
  }

  private async getKidForId(id: string) {
    const { publicJwk } = await this.getKeyPairById(id);
    return publicJwk.kid;
  }

  async create(data: CreateVCInput): Promise<VerifiableCredential> {
    const issuanceDate = new Date().toISOString();
    const { privateKey } = await this.getCryptoKeysById(data.issuer);
    const kid = await this.getKidForId(data.issuer);
    const credentialSubject = data.claims.reduce(
      (acc, { key, value }) => {
        acc[key] = value;
        return acc;
      },
      {} as Record<string, string>,
    );
    if (data.subject) credentialSubject.id = data.subject;

    const credential: Omit<VerifiableCredential, 'proof'> = {
      id: randomUUID(),
      issuer: data.issuer,
      issuanceDate,
      type: ['VerifiableCredential', data.type],
      credentialSubject,
    };

    const canonical = canonicalize(credential);

    const payload = new TextEncoder().encode(canonical);
    const jws = await new CompactSign(payload)
      .setProtectedHeader({ alg: 'EdDSA', kid })
      .sign(privateKey);

    const stored: VerifiableCredential = {
      ...credential,
      proof: {
        type: 'Ed25519Signature2018',
        created: issuanceDate,
        proofPurpose: 'assertionMethod',
        verificationMethod: `${data.issuer}#${kid}`,
        jws,
      },
    };

    const credentials = this.readFile();
    credentials.push(stored);
    this.writeFile(credentials);
    return stored;
  }

  async getAll(): Promise<VerifiableCredential[]> {
    const credentials = this.readFile();
    return credentials;
  }

  async getById(id: string): Promise<VerifiableCredential | null> {
    const credentials = this.readFile();
    const credential = credentials.find((c) => c.id === id);
    return credential || null;
  }

  async deleteById(id: string): Promise<void> {
    const credentials = this.readFile();
    const filter = credentials.filter((c) => c.id !== id);
    if (filter.length === credentials.length) {
      throw new NotFoundException('Credential not found');
    }
    this.writeFile(filter);
  }

  async verify(vc: VerifiableCredential): Promise<{
    isValid: boolean;
    payload: Record<string, string>;
    protectedHeader: CompactJWSHeaderParameters;
  }> {
    const { proof, ...core } = vc;
    const [issuerId, kid] = proof.verificationMethod.split('#');

    const { publicKey } = await this.getCryptoKeysById(issuerId);
    // check if kid matches issuer
    const issuerKid = await this.getKidForId(issuerId);
    if (kid !== issuerKid) {
      throw new NotFoundException('Key ID does not match issuer');
    }

    // verify signature
    const { payload, protectedHeader } = await compactVerify(proof.jws, publicKey);

    // check algorithm
    if (protectedHeader.alg && protectedHeader.alg !== 'EdDSA') {
      throw new Error(`Unexpected alg ${protectedHeader.alg}`);
    }

    // check payload integrity
    const decoded = JSON.parse(new TextDecoder().decode(payload));
    const expectedString = canonicalize(core);
    const payloadString = canonicalize(decoded);

    if (expectedString !== payloadString) {
      throw new Error('Credential payload has been tampered with');
    }

    // check if subject exists
    const subjectId = vc.credentialSubject.id || '';
    if (subjectId) await this.getKeyPairById(subjectId);

    const now = new Date();
    const issuance = new Date(core.issuanceDate);
    if (issuance.getTime() > now.getTime()) throw new Error('Issuance date in the future');

    if (core.expirationDate) {
      const exp = new Date(core.expirationDate);
      if (exp.getTime() <= now.getTime()) throw new Error('Credential expired');
    }

    if (core.notBefore) {
      const nbf = new Date(core.notBefore);
      if (nbf.getTime() > now.getTime()) throw new Error('Credential not valid yet');
    }

    return { isValid: true, payload: decoded, protectedHeader };
  }
}

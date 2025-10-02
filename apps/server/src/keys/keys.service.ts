import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { KeyPair, Keys, keysSchema, type publicJwk } from './keys.entity.js';

@Injectable()
export class KeysService {
  private filePath: string;
  private cache: Keys | null = null;

  constructor() {
    this.filePath = path.resolve(process.cwd(), 'data', 'keys.json');
    this.ensureDir();
  }

  private ensureDir() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private readFile(): Keys {
    if (this.cache) return this.cache;
    if (!fs.existsSync(this.filePath)) {
      this.cache = {};
      return this.cache;
    }
    try {
      const raw = fs.readFileSync(this.filePath, 'utf-8');
      const json = JSON.parse(raw);
      const parsed = keysSchema.parse(json);
      this.cache = parsed;
      return parsed;
    } catch {
      this.cache = {};
      return this.cache;
    }
  }

  // private writeFile(keys: Keys) {
  //   const parsedKeys = keysSchema.parse(keys);
  //   this.cache = parsedKeys;
  //   fs.writeFileSync(this.filePath, JSON.stringify(parsedKeys, null, 2));
  // }

  async getById(id: string): Promise<KeyPair | null> {
    const keys = this.readFile();
    if (!keys || !keys[id]) return null;
    return keys[id];
  }

  async getAllIds(): Promise<string[]> {
    const keys = this.readFile();
    return Object.keys(keys);
  }

  async getAllPublicKeys(): Promise<Record<string, publicJwk> | null> {
    const keys = this.readFile();
    const publicKeys = Object.entries(keys).reduce<Record<string, publicJwk>>(
      (acc, [id, value]) => {
        if (value && typeof value === 'object' && 'publicJwk' in value) {
          acc[id] = (value as KeyPair).publicJwk;
        }
        return acc;
      },
      {},
    );
    return publicKeys;
  }
}

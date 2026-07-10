import { BadRequestException, Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';
import { envs } from 'src/config/envs.schema';

type EncryptedValue = {
  __encrypted: true;
  algorithm: 'aes-256-gcm';
  iv: string;
  tag: string;
  data: string;
};

@Injectable()
export class SecretEnvelopeService {
  private readonly key: Buffer;

  constructor() {
    const configured = envs.monitor_secrets_key;
    if (configured) {
      try {
        this.key = this.parseKey(configured);
        return;
      } catch (error) {
        if (envs.node_env === 'production') throw error;
      }
    }
    this.key = createHash('sha256').update(envs.secret_jwt).digest();
  }

  encrypt(value: string): EncryptedValue {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);
    const data = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    return {
      __encrypted: true,
      algorithm: 'aes-256-gcm',
      iv: iv.toString('base64url'),
      tag: cipher.getAuthTag().toString('base64url'),
      data: data.toString('base64url'),
    };
  }

  decrypt(value: unknown): string {
    if (!this.isEncrypted(value)) return String(value ?? '');
    try {
      const decipher = createDecipheriv(
        'aes-256-gcm',
        this.key,
        Buffer.from(value.iv, 'base64url'),
      );
      decipher.setAuthTag(Buffer.from(value.tag, 'base64url'));
      return Buffer.concat([
        decipher.update(Buffer.from(value.data, 'base64url')),
        decipher.final(),
      ]).toString('utf8');
    } catch {
      throw new BadRequestException('No se pudo descifrar la configuración sensible del monitor');
    }
  }

  protectConfig(config: Record<string, unknown>): Record<string, unknown> {
    const http = (config.http ?? {}) as Record<string, unknown>;
    const protectedHttp = { ...http };
    if (typeof http.headers === 'object' && http.headers !== null) {
      protectedHttp.headers = this.encrypt(JSON.stringify(http.headers));
      protectedHttp.headersEncrypted = true;
    }
    if (typeof http.body === 'string') {
      protectedHttp.body = this.encrypt(http.body);
      protectedHttp.bodyEncrypted = true;
    }
    return { ...config, http: protectedHttp };
  }

  revealConfig(config: unknown): Record<string, unknown> {
    if (!config || typeof config !== 'object' || Array.isArray(config)) return {};
    const source = config as Record<string, unknown>;
    const http = { ...((source.http ?? {}) as Record<string, unknown>) };
    if (http.headersEncrypted) {
      http.headers = JSON.parse(this.decrypt(http.headers));
      delete http.headersEncrypted;
    }
    if (http.bodyEncrypted) {
      http.body = this.decrypt(http.body);
      delete http.bodyEncrypted;
    }
    return { ...source, http };
  }

  private isEncrypted(value: unknown): value is EncryptedValue {
    return Boolean(value && typeof value === 'object' && (value as EncryptedValue).__encrypted);
  }

  private parseKey(value: string): Buffer {
    const key = Buffer.from(value, 'base64url');
    if (key.length !== 32)
      throw new Error('MONITOR_SECRETS_KEY debe ser una clave base64url de 32 bytes');
    return key;
  }
}

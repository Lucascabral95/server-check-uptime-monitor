import { SecretEnvelopeService } from './secret-envelope.service';

describe('SecretEnvelopeService', () => {
  it('encrypts and decrypts values without storing plaintext', () => {
    const service = new SecretEnvelopeService();
    const encrypted = service.encrypt('Authorization: secret');
    expect(JSON.stringify(encrypted)).not.toContain('Authorization: secret');
    expect(service.decrypt(encrypted)).toBe('Authorization: secret');
  });

  it('protects HTTP headers and body', () => {
    const service = new SecretEnvelopeService();
    const protectedConfig = service.protectConfig({ http: { headers: { Authorization: 'secret' }, body: '{"ok":true}' } });
    expect(protectedConfig).toMatchObject({ http: { headersEncrypted: true, bodyEncrypted: true } });
    expect(service.revealConfig(protectedConfig)).toEqual({ http: { headers: { Authorization: 'secret' }, body: '{"ok":true}' } });
  });
});

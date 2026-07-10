import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PayloadUserDto } from '../../user/dto/payload-user.dto';
import { UserService } from '../../user/user.service';
import { envs } from '../../config/envs.schema';
import jwt from 'jsonwebtoken';

const EXPECTED_ISSUER = envs.cognito_issuer;
const EXPECTED_CLIENT_ID = envs.cognito_client_id;

const generateMockKeyPair = () => {
  const crypto = require('crypto');
  return crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
};

// Par legítimo, cuya clave pública se sirve desde el JWKS del issuer esperado.
const { publicKey, privateKey } = generateMockKeyPair();

// Par de un "atacante" que aloja su propio JWKS en un issuer distinto.
const { publicKey: attackerPublicKey, privateKey: attackerPrivateKey } =
  generateMockKeyPair();

const signWith = (payload: any, key: string, kid: string): string =>
  jwt.sign(payload, key, {
    algorithm: 'RS256',
    header: { kid, alg: 'RS256' },
  });

const createValidToken = (payload: any): string =>
  signWith(payload, privateKey, 'test-key-id');

const createMockExecutionContext = (authHeader?: string) => {
  const request = {
    headers: {
      authorization: authHeader,
    },
    user: null,
  };

  const context: ExecutionContext = {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as any;

  return { context, request };
};

global.fetch = jest.fn();

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(async () => {
    const userServiceMock = {
      findOrCreateByEmail: jest.fn().mockResolvedValue({
        id: 'db-user-123',
        email: 'test@example.com',
        role: 'USER',
      }),
      findOrCreateByCognitoSub: jest.fn().mockResolvedValue({
        id: 'db-user-123',
        role: 'USER',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        { provide: UserService, useValue: userServiceMock },
      ],
    }).compile();

    guard = module.get(JwtAuthGuard);
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (guard) {
      (guard as any).jwksCache?.clear();
      (guard as any).pendingFetches?.clear();
    }
  });

  it('should allow access with valid Cognito access token', async () => {
    const payload: PayloadUserDto = {
      sub: 'user-id-123',
      iss: EXPECTED_ISSUER,
      token_use: 'access',
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000),
      email: 'test@example.com',
      client_id: EXPECTED_CLIENT_ID,
    };

    const token = createValidToken(payload);

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        keys: [{ kid: 'test-key-id', kty: 'RSA', n: 'n', e: 'AQAB' }],
      }),
    });

    jest.spyOn(guard as any, 'jwkToPem').mockReturnValue(publicKey);

    const { context, request } = createMockExecutionContext(`Bearer ${token}`);

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(request.user).toMatchObject({
      sub: payload.sub,
      dbUserId: 'db-user-123',
      role: 'USER',
    });
  });

  it('should throw UnauthorizedException when no Authorization header', async () => {
    const { context } = createMockExecutionContext();
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should reject a token whose iss does not match the configured COGNITO_ISSUER', async () => {
    // Reproduce el bypass real: un atacante firma un token con SU propia clave
    // privada y publica su propio JWKS, apuntando `iss` a un host que contiene
    // "cognito-idp" (lo que el viejo check `includes('cognito-idp')` aceptaba).
    const attackerIssuer = 'https://cognito-idp.attacker.test/fake-pool';

    const forgedPayload = {
      sub: 'victim-user-id',
      iss: attackerIssuer,
      token_use: 'id',
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000),
      email: 'victim@example.com',
      aud: EXPECTED_CLIENT_ID,
    };

    const forgedToken = signWith(forgedPayload, attackerPrivateKey, 'attacker-key-id');

    const { context } = createMockExecutionContext(`Bearer ${forgedToken}`);

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    // Y crucialmente: el guard NUNCA debe intentar resolver JWKS desde el
    // issuer del token — solo desde el issuer configurado. Si esto fallara,
    // volveríamos a tener el SSRF ciego / impersonación.
    expect(global.fetch).not.toHaveBeenCalledWith(
      expect.stringContaining(attackerIssuer),
      expect.anything(),
    );
  });

  it('should reject a token whose audience/client_id does not match COGNITO_CLIENT_ID', async () => {
    const payload = {
      sub: 'user-id-123',
      iss: EXPECTED_ISSUER,
      token_use: 'access',
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000),
      client_id: 'some-other-client-id',
    };

    const token = createValidToken(payload);
    const { context } = createMockExecutionContext(`Bearer ${token}`);

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should reject a token with the right iss/aud but signed by a different private key', async () => {
    // Simula una clave robada o un kid reutilizado: mismo iss/aud que un token
    // legítimo, pero firmada con la clave privada del "atacante". El JWKS del
    // issuer configurado sigue devolviendo la clave PÚBLICA legítima (no la
    // del atacante), así que jwt.verify debe fallar por firma inválida.
    const payload = {
      sub: 'user-id-123',
      iss: EXPECTED_ISSUER,
      token_use: 'access',
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000),
      client_id: EXPECTED_CLIENT_ID,
    };

    const forgedToken = signWith(payload, attackerPrivateKey, 'test-key-id');

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        keys: [{ kid: 'test-key-id', kty: 'RSA', n: 'n', e: 'AQAB' }],
      }),
    });
    // El JWKS "real" resuelve al PEM legítimo (no al del atacante).
    jest.spyOn(guard as any, 'jwkToPem').mockReturnValue(publicKey);

    const { context } = createMockExecutionContext(`Bearer ${forgedToken}`);

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });
});

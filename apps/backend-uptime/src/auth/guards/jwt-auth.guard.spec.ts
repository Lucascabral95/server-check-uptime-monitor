import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PayloadUserDto } from '../../user/dto/payload-user.dto';
import { UserService } from '../../user/user.service';
import jwt from 'jsonwebtoken';

const generateMockKeyPair = () => {
  const crypto = require('crypto');
  return crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
};

const { publicKey, privateKey } = generateMockKeyPair();

const createValidToken = (payload: any): string =>
  jwt.sign(payload, privateKey, {
    algorithm: 'RS256',
    header: { kid: 'test-key-id', alg: 'RS256' },
  });

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

    const configServiceMock = {
      get: jest.fn((key: string) => {
        if (key === 'COGNITO_CLIENT_ID') return 'client-id';
        if (key === 'COGNITO_ISSUER')
          return 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_test';
        return undefined;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        { provide: UserService, useValue: userServiceMock },
        { provide: ConfigService, useValue: configServiceMock },
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
    iss: 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_test',
    token_use: 'access',
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000),
    email: 'test@example.com',
    client_id: 'client-id',
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
});

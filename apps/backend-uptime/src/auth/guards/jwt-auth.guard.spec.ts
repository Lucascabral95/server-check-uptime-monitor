import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PayloadUserDto } from '../../user/dto/payload-user.dto';
import { UserService } from '../../user/user.service';
import jwt from 'jsonwebtoken';

const generateMockKeyPair = () => {
  const crypto = require('crypto');
  return crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });
};

const { publicKey, privateKey } = generateMockKeyPair();

const createValidToken = (payload: any): string => {
  return jwt.sign(payload, privateKey, {
    algorithm: 'RS256',
    header: {
      kid: 'test-key-id',
      alg: 'RS256',
    },
  });
};

const createMockExecutionContext = (authHeader?: string): ExecutionContext => {
  const mockRequest = {
    headers: {
      authorization: authHeader,
    },
    user: null,
  };

  return {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue(mockRequest),
    }),
  } as any;
};

global.fetch = jest.fn();

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let userService: any;

  beforeEach(async () => {
    userService = {
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
        {
          provide: UserService,
          useValue: userService,
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);

    jest.clearAllMocks();
  });

  afterEach(() => {
    (guard as any).jwksCache.clear();
    (guard as any).pendingFetches.clear();
  });

  describe('Happy Path', () => {
    it('should allow access with valid Cognito access token', async () => {
      const payload: PayloadUserDto = {
        sub: 'user-id-123',
        iss: 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_abcdefghi',
        token_use: 'access',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
        email: 'test@example.com',
        client_id: 'client-id',
        username: 'testuser',
        origin_jti: 'origin-jti-123',
        event_id: 'event-id-123',
        scope: 'aws.cognito.signin.user.admin',
        auth_time: Math.floor(Date.now() / 1000),
        jti: 'jti-123',
      };

      const token = createValidToken(payload);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          keys: [
            {
              kid: 'test-key-id',
              kty: 'RSA',
              n: 'mock-n-value',
              e: 'AQAB',
            },
          ],
        }),
      });

      jest.spyOn(guard as any, 'jwkToPem').mockReturnValue(publicKey);

      const context = createMockExecutionContext(`Bearer ${token}`);

      const result = await guard.canActivate(context);

      const request = context.switchToHttp().getRequest();

      expect(result).toBe(true);
      expect(request.user).toMatchObject({
        ...payload,
        dbUserId: 'db-user-123',
        role: 'USER',
      });
    });
  });

  describe('Authorization Header Validations', () => {
    it('should throw UnauthorizedException when no Authorization header', async () => {
      const context = createMockExecutionContext(undefined);

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      await expect(guard.canActivate(context)).rejects.toThrow('Token no proporcionado');
    });

    it('should throw UnauthorizedException when Authorization header does not start with Bearer', async () => {
      const context = createMockExecutionContext('Basic abc123');

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      await expect(guard.canActivate(context)).rejects.toThrow('Token no proporcionado');
    });
  });

  describe('Token Payload Validations', () => {
    it('should throw UnauthorizedException when iss is not from Cognito', async () => {
      const payload: PayloadUserDto = {
        sub: 'user-id',
        iss: 'https://not-cognito.com',
        token_use: 'access',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      };

      const token = createValidToken(payload);
      const context = createMockExecutionContext(`Bearer ${token}`);

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      await expect(guard.canActivate(context)).rejects.toThrow('no es un token de Cognito');
    });
  });

  describe('JWT Verification Errors', () => {
    it('should throw UnauthorizedException when signature is invalid', async () => {
      const payload: PayloadUserDto = {
        sub: 'user-id',
        iss: 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_test',
        token_use: 'access',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      };

      const { privateKey: wrongPrivateKey } = generateMockKeyPair();

      const token = jwt.sign(payload, wrongPrivateKey, {
        algorithm: 'RS256',
        header: {
          kid: 'test-key-id',
          alg: 'RS256',
        },
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          keys: [{ kid: 'test-key-id', kty: 'RSA', n: 'mock-n', e: 'AQAB' }],
        }),
      });

      jest.spyOn(guard as any, 'jwkToPem').mockReturnValue(publicKey);

      const context = createMockExecutionContext(`Bearer ${token}`);

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      await expect(guard.canActivate(context)).rejects.toThrow('firma no válida');
    });
  });

  describe('Edge Cases', () => {
    it('should attach decoded user to request object', async () => {
      const payload: PayloadUserDto = {
        sub: 'user-id-123',
        iss: 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_test',
        token_use: 'access',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      };

      const token = createValidToken(payload);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          keys: [{ kid: 'test-key-id', kty: 'RSA', n: 'mock-n', e: 'AQAB' }],
        }),
      });

      jest.spyOn(guard as any, 'jwkToPem').mockReturnValue(publicKey);

      const context = createMockExecutionContext(`Bearer ${token}`);
      const request = context.switchToHttp().getRequest();

      await guard.canActivate(context);

      expect(request.user).toMatchObject({
        ...payload,
        dbUserId: 'db-user-123',
        role: 'USER',
      });
    });
  });
});

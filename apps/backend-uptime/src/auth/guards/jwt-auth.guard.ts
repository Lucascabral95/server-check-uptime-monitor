import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';
import { CanActivate } from '@nestjs/common';
import { PayloadUserDto } from '../../user/dto/payload-user.dto';
import jwt from 'jsonwebtoken';
import { createPublicKey } from 'crypto';
import { UserService } from '../../user/user.service';
import { Role } from '@prisma/client';

interface JwtHeader {
  kid: string;
  alg: string;
}

interface CognitoJWK {
  kid: string;
  kty: string;
  n: string;
  e: string;
}

interface JWKSResponse {
  keys: CognitoJWK[];
}

interface CachedPublicKey {
  key: string;
  expiry: number;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private userService: UserService) {}

  private jwksCache: Map<string, CachedPublicKey> = new Map();
  private pendingFetches: Map<string, Promise<string>> = new Map();
  private readonly CACHE_DURATION = 300000;
  private readonly MAX_CACHE_SIZE = 100;

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    const token = authHeader.substring(7);

    const header = this.decodeHeader(token);
    if (!header.kid) {
      throw new UnauthorizedException('Token inválido: falta kid');
    }

    const payload = this.decodePayload(token);
    if (!payload.iss) {
      throw new UnauthorizedException('Token inválido: falta iss');
    }

    if (!payload.iss.includes('cognito-idp')) {
      throw new UnauthorizedException('Token inválido: no es un token de Cognito');
    }

    let publicKey: string;
    try {
      publicKey = await this.getCognitoPublicKey(payload.iss, header.kid);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Error al verificar el token');
    }

    try {
      const decoded = jwt.verify(token, publicKey, {
        issuer: payload.iss,
      }) as PayloadUserDto;

      if (decoded.token_use !== 'access' && decoded.token_use !== 'id') {
        throw new UnauthorizedException('Token inválido: se requiere un token de acceso o ID');
      }

      if (decoded.email) {
        const dbUser = await this.userService.findOrCreateByEmail({ id: decoded.sub, email: decoded.email });
        request.user = { ...decoded, dbUserId: dbUser.id, role: dbUser.role };
      } else {
        request.user = decoded;
      }

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expirado');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Token inválido: firma no válida');
      }
      if (error.name === 'NotBeforeError') {
        throw new UnauthorizedException('Token no es válido aún');
      }
      console.error('Error en JwtAuthGuard:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      throw new UnauthorizedException(`Token inválido: ${error.message}`);
    }
  }

  private decodeHeader(token: string): JwtHeader {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new UnauthorizedException('Token inválido: formato incorrecto');
    }

    try {
      return JSON.parse(Buffer.from(parts[0], 'base64').toString('utf-8'));
    } catch {
      throw new UnauthorizedException('Token inválido: no se puede decodificar el header');
    }
  }

  private decodePayload(token: string): PayloadUserDto {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new UnauthorizedException('Token inválido: formato incorrecto');
    }

    try {
      return JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
    } catch {
      throw new UnauthorizedException('Token inválido: no se puede decodificar el payload');
    }
  }

  private async getCognitoPublicKey(iss: string, kid: string): Promise<string> {
    const cacheKey = `${iss}-${kid}`;

    const cached = this.jwksCache.get(cacheKey);
    if (cached && Date.now() < cached.expiry) {
      return cached.key;
    }

    const pendingFetch = this.pendingFetches.get(cacheKey);
    if (pendingFetch) {
      return pendingFetch;
    }

    const fetchPromise = this.fetchCognitoPublicKey(iss, kid, cacheKey);
    this.pendingFetches.set(cacheKey, fetchPromise);

    try {
      return await fetchPromise;
    } finally {
      this.pendingFetches.delete(cacheKey);
    }
  }

  private async fetchCognitoPublicKey(iss: string, kid: string, cacheKey: string): Promise<string> {
    const jwksUrl = `${iss}/.well-known/jwks.json`;
    const response = await fetch(jwksUrl);

    if (!response.ok) {
      throw new UnauthorizedException('No se pudo obtener las claves públicas');
    }

    const jwks: JWKSResponse = await response.json();
    const key = jwks.keys.find((k: CognitoJWK) => k.kid === kid);

    if (!key) {
      throw new UnauthorizedException('Clave pública no encontrada');
    }

    const publicKey = this.jwkToPem(key);

    if (this.jwksCache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.jwksCache.keys().next().value;
      if (firstKey) {
        this.jwksCache.delete(firstKey);
      }
    }

    this.jwksCache.set(cacheKey, {
      key: publicKey,
      expiry: Date.now() + this.CACHE_DURATION,
    });

    return publicKey;
  }

  private jwkToPem(jwk: CognitoJWK): string {
    const publicKeyObject = createPublicKey({
      key: {
        kty: jwk.kty,
        n: jwk.n,
        e: jwk.e,
      },
      format: 'jwk',
    });

    return publicKeyObject.export({
      type: 'spki',
      format: 'pem',
    }) as string;
  }
}

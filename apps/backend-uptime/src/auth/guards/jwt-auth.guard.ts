import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ExecutionContext, CanActivate } from '@nestjs/common';
import { PayloadUserDto } from '../../user/dto/payload-user.dto';
import jwt from 'jsonwebtoken';
import { createPublicKey } from 'crypto';
import { UserService } from '../../user/user.service';
import { envs } from '../../config/envs.schema';

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

interface DecodedToken extends PayloadUserDto {
  aud?: string;
  client_id?: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly jwksCache = new Map<string, CachedPublicKey>();
  private readonly pendingFetches = new Map<string, Promise<string>>();
  private readonly CACHE_DURATION = 300000; // 5 minutos
  private readonly MAX_CACHE_SIZE = 100;
  private readonly expectedAudience: string;
  private readonly expectedIssuer: string;

  constructor(private readonly userService: UserService) {
    // envs.schema.ts ya exige estas dos vars con Joi al arrancar el proceso;
    // este check es una segunda barrera para que el guard nunca opere en
    // modo "fail open" si algún día se inyecta de otra forma.
    if (!envs.cognito_issuer || !envs.cognito_client_id) {
      throw new Error(
        'JwtAuthGuard requiere COGNITO_ISSUER y COGNITO_CLIENT_ID configurados',
      );
    }

    this.expectedAudience = envs.cognito_client_id;
    this.expectedIssuer = envs.cognito_issuer;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    const header = this.decodeHeader(token);
    const payload = this.decodePayload(token);

    this.validateTokenStructure(header, payload);

    // El JWKS SIEMPRE se resuelve contra el issuer configurado, nunca contra
    // payload.iss (que es dato sin verificar controlado por quien manda el token).
    const publicKey = await this.getCognitoPublicKey(header.kid);
    const decoded = this.verifyToken(token, publicKey);

    const dbUser = await this.findOrCreateUser(decoded);

    request.user = {
      ...decoded,
      dbUserId: dbUser.id,
      userId: dbUser.id,
      role: dbUser.role,
    };

    return true;
  }

  private extractToken(request: any): string {
    const authHeader = request.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    return authHeader.substring(7);
  }

  private validateTokenStructure(header: JwtHeader, payload: DecodedToken): void {
    if (!header.kid) {
      throw new UnauthorizedException('Token inválido: falta kid en header');
    }

    // Comparación estricta contra el issuer configurado, NO un substring check:
    // un `includes('cognito-idp')` deja pasar cualquier host que contenga esa
    // palabra en la URL (p.ej. https://cognito-idp.atacante.com/...).
    if (payload.iss !== this.expectedIssuer) {
      throw new UnauthorizedException('Token issuer inválido');
    }

    if (!['access', 'id'].includes(payload.token_use)) {
      throw new UnauthorizedException(
        'Token inválido: se requiere token de acceso o ID'
      );
    }

    // Los access tokens de Cognito llevan `client_id`, los ID tokens llevan
    // `aud` — ninguno de los dos trae ambos, por eso se verifica el que esté
    // presente. Este check es incondicional: expectedAudience siempre está
    // seteado (ver constructor).
    const tokenAudience = payload.aud || payload.client_id;
    if (tokenAudience !== this.expectedAudience) {
      throw new UnauthorizedException('Token audience inválido');
    }
  }

  private decodeHeader(token: string): JwtHeader {
    return this.decodeBase64Json(token, 0, 'header');
  }

  private decodePayload(token: string): DecodedToken {
    return this.decodeBase64Json(token, 1, 'payload');
  }

  private decodeBase64Json<T>(token: string, partIndex: number, partName: string): T {
    const parts = token.split('.');
    
    if (parts.length !== 3) {
      throw new UnauthorizedException('Token inválido: formato incorrecto');
    }

    try {
      const decoded = Buffer.from(parts[partIndex], 'base64').toString('utf-8');
      return JSON.parse(decoded);
    } catch {
      throw new UnauthorizedException(`Token inválido: no se puede decodificar ${partName}`);
    }
  }

  private verifyToken(token: string, publicKey: string): DecodedToken {
    try {
      return jwt.verify(token, publicKey, {
        issuer: this.expectedIssuer,
        algorithms: ['RS256'],
        clockTolerance: 5,
      }) as DecodedToken;
    } catch (error) {
      this.handleVerificationError(error);
    }
  }

  private handleVerificationError(error: any): never {
    const errorMessages: Record<string, string> = {
      TokenExpiredError: 'Token expirado',
      JsonWebTokenError: 'Token inválido: firma no válida',
      NotBeforeError: 'Token no es válido aún',
    };

    const message = errorMessages[error.name] || `Token inválido: ${error.message}`;
    
    if (!errorMessages[error.name]) {
      console.error('Error inesperado en verificación JWT:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }

    throw new UnauthorizedException(message);
  }

  private async findOrCreateUser(decoded: DecodedToken) {
    try {
      // ID Token: tiene email
      if (decoded.email) {
        return await this.userService.findOrCreateByEmail({
          id: decoded.sub,
          email: decoded.email,
        });
      }
      
      return await this.userService.findOrCreateByCognitoSub(
        decoded.sub,
        decoded.email, 
      );
    } catch (error) {
      console.error('Error al buscar/crear usuario:', error);
      throw new UnauthorizedException('Error al procesar información del usuario');
    }
  }

  private async getCognitoPublicKey(kid: string): Promise<string> {
    const cacheKey = kid;
    const cached = this.jwksCache.get(cacheKey);

    if (cached && Date.now() < cached.expiry) {
      return cached.key;
    }

    const pendingFetch = this.pendingFetches.get(cacheKey);
    if (pendingFetch) {
      return pendingFetch;
    }

    const fetchPromise = this.fetchAndCachePublicKey(kid, cacheKey);
    this.pendingFetches.set(cacheKey, fetchPromise);

    try {
      return await fetchPromise;
    } finally {
      this.pendingFetches.delete(cacheKey);
    }
  }

  private async fetchAndCachePublicKey(
    kid: string,
    cacheKey: string,
  ): Promise<string> {
    // Construido SIEMPRE a partir del issuer configurado (this.expectedIssuer),
    // nunca del `iss` del token: si se tomara del token, un atacante podría
    // apuntar el fetch de JWKS a un host propio (SSRF ciego + impersonación).
    const jwksUrl = `${this.expectedIssuer}/.well-known/jwks.json`;

    let response: Response;
    try {
      response = await fetch(jwksUrl, {
        signal: AbortSignal.timeout(5000), 
      });
    } catch (error) {
      console.error('Error al obtener JWKS:', error);
      throw new UnauthorizedException('No se pudo obtener las claves públicas');
    }

    if (!response.ok) {
      throw new UnauthorizedException(
        `Error al obtener JWKS: ${response.status} ${response.statusText}`
      );
    }

    const jwks: JWKSResponse = await response.json();
    const key = jwks.keys.find((k) => k.kid === kid);

    if (!key) {
      throw new UnauthorizedException(
        `Clave pública no encontrada para kid: ${kid}`
      );
    }

    const publicKey = this.jwkToPem(key);
    this.cachePublicKey(cacheKey, publicKey);

    return publicKey;
  }

  private cachePublicKey(cacheKey: string, publicKey: string): void {
    // LRU simple: eliminar la entrada más antigua si se alcanza el límite
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
  }

  private jwkToPem(jwk: CognitoJWK): string {
    try {
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
    } catch (error) {
      console.error('Error al convertir JWK a PEM:', error);
      throw new UnauthorizedException('Error al procesar clave pública');
    }
  }
}
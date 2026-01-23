export interface DecodedJwtPayload {
  sub: string;
  email: string;
  email_verified: boolean;
  iss: string;
  aud: string;
  token_use: string;
  exp: number;
  iat?: number;
  jti?: string;
}

export const decodeJwt = (token: string): DecodedJwtPayload | null => {
  try {
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return null;

    const decodedPayload = JSON.parse(
      typeof window !== 'undefined'
        ? atob(payloadBase64)
        : Buffer.from(payloadBase64, 'base64').toString('utf-8')
    );

    return decodedPayload;
  } catch {
    return null;
  }
};

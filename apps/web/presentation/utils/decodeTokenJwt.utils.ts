interface CognitoJwtPayload {
  sub: string;
  email: string;
  email_verified: boolean;
  iss: string;
  aud: string;
  token_use: 'id' | 'access';
  auth_time: number;
  exp: number;
  iat: number;
  jti: string;
  'cognito:username': string;
  origin_jti?: string;
  event_id?: string;
}

export function decodeJwt(token?: string): CognitoJwtPayload | null {
  if (!token) return null;

  try {
    const [, payload] = token.split('.');
    if (!payload) return null;

    const decoded = JSON.parse(
      Buffer.from(payload, 'base64').toString('utf-8')
    );

    return decoded as CognitoJwtPayload;
  } catch {
    return null;
  }
}

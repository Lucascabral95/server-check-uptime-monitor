import { Role } from "@prisma/client";

export interface RequestUserDto {
    user: {
        sub: string;
        email_verified: boolean;
        iss: string;
        'cognito:username': string;
        origin_jti: string;
        aud: string;
        event_id: string;
        token_use: string;
        auth_time: number;
        exp: number;
        iat: number;
        jti: string;
        email: string;
        dbUserId: string;
        role: Role;
    }
}

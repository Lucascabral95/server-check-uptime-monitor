import { IsNumber, IsString, IsUUID } from "class-validator";

export class PayloadUserDto {
    @IsUUID()
    sub: string;

    @IsString()
    iss: string;
    
    @IsString()
    client_id: string;
    
    @IsString()
    origin_jti: string;

    @IsString()
    event_id: string;

    @IsString()
    token_use: string;

    @IsString()
    scope: string;

    @IsNumber()
    auth_time: number;

    @IsNumber()
    exp: number;
    
    @IsNumber()
    iat: number;

    @IsUUID()
    jti: string;
    
    @IsString()
    username: string;
}

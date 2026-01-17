import { IsString, IsOptional } from "class-validator";

export class CreateUserDto {
    @IsString()
    @IsOptional()
    id?: string;

    @IsString()
    @IsOptional()
    cognitoSub?: string;

    @IsString()
    email: string;
}

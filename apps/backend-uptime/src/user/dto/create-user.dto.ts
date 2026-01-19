import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional } from "class-validator";

export class CreateUserDto {
  @ApiPropertyOptional({
    description: 'ID del usuario (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
    @IsString()
    @IsOptional()
    id?: string;

  @ApiPropertyOptional({
    description: 'Sub del usuario en Cognito',
    example: 'us-east-1:9b2f3f40-1234-4d1a-8f6a-abc123456789',
  })
    @IsString()
    @IsOptional()
    cognitoSub?: string;

  @ApiProperty({
    description: 'Email del usuario',
    example: 'user@email.com',
  })
    @IsString()
    email: string;
}

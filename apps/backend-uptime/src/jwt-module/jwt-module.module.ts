import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { envs } from 'src/config/envs.schema';

@Module({
    imports: [
        JwtModule.register({
            secret: envs.secret_jwt,
            signOptions: { expiresIn: envs.jwt_expires_in },
        }),
    ],
    exports: [
        JwtModule,
    ],
})
export class JwtModuleModule {}

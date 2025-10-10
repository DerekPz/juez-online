import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginUseCase } from '../../core/auth/use-cases/login.use-case';
import { TOKEN_SIGNER, createTokenSigner } from '../../infrastructure/security/token.provider';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    LoginUseCase,
    { provide: TOKEN_SIGNER, useFactory: () => createTokenSigner() },
    JwtAuthGuard,
  ],
})
export class AuthModule {}

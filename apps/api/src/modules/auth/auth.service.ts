import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginUseCase } from '../../core/auth/use-cases/login.use-case';
import { TOKEN_SIGNER } from '../../infrastructure/security/token.provider';

@Injectable()
export class AuthService {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    @Inject(TOKEN_SIGNER) private readonly token: { sign: (p: any) => string },
  ) {}

  login(username: string, password: string) {
    const user = this.loginUseCase.execute(username, password);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    // MIN payload (evitar info sensible)
    const accessToken = this.token.sign({ sub: user.id, username: user.username });
    return { accessToken };
  }
}

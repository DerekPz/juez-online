import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { TOKEN_SIGNER } from './tokens';
import { TokenSigner } from './token-signer';

@Injectable()
export class AuthService {
  constructor(@Inject(TOKEN_SIGNER) private readonly signer: TokenSigner) {}

  // Usuario demo. En producción valida contra tu UsersRepo/DB.
  async validateUser(username: string, password: string) {
    // demo fijo:
    if (username === 'admin' && password === 'admin123') {
      return { sub: '1', username: 'admin' };
    }
    return null;
  }

  async login(username: string, password: string) {
    const user = await this.validateUser(username, password);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');
    const accessToken = this.signer.sign(user);
    return { accessToken };
  }

  // útil para /auth/me cuando quieras verificar manualmente (o usar guard)
  verify(token: string) {
    return this.signer.verify(token);
  }
}

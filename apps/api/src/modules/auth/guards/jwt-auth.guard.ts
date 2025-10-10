import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { TOKEN_SIGNER } from '../../../infrastructure/security/token.provider';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(@Inject(TOKEN_SIGNER) private readonly token: { verify<T = any>(t: string): T }) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request & { user?: any }>();
    const auth = (req.headers as any)['authorization'] as string | undefined;

    if (!auth || !auth.toLowerCase().startsWith('bearer ')) {
      throw new UnauthorizedException('Falta encabezado Authorization: Bearer <token>');
    }

    const raw = auth.slice('bearer '.length);
    try {
      const payload = this.token.verify(raw); // { sub, username, iat, exp }
      (req as any).user = payload;            // lo colgamos para usarlo en el handler
      return true;
    } catch (err) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}

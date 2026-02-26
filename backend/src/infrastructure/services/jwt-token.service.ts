import jwt from 'jsonwebtoken';
import { TokenService, TokenPayload, RefreshTokenPayload } from '../../application/ports/token.service.port.js';
import { UnauthorizedError } from '../../domain/errors/domain-errors.js';

export class JwtTokenService implements TokenService {
  constructor(private readonly secret: string) {}

  sign(payload: TokenPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: '8h' });
  }

  verify(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.secret) as TokenPayload;
    } catch {
      throw new UnauthorizedError('Invalid or expired token');
    }
  }

  signRefresh(payload: RefreshTokenPayload): string {
    return jwt.sign(payload, this.secret + '_refresh', { expiresIn: '30d' });
  }

  verifyRefresh(token: string): RefreshTokenPayload {
    try {
      return jwt.verify(token, this.secret + '_refresh') as RefreshTokenPayload;
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }
}

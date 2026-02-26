import { RefreshToken } from '../entities/refresh-token.entity.js';

export interface RefreshTokenRepository {
  create(token: RefreshToken): Promise<RefreshToken>;
  findByTokenHash(tokenHash: string): Promise<RefreshToken | null>;
  deleteByUserId(userId: string): Promise<void>;
  deleteExpired(): Promise<void>;
}

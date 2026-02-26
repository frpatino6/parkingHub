import crypto from 'crypto';
import { RefreshTokenRepository } from '../../../domain/ports/RefreshTokenRepository.Port.js';
import { RefreshToken } from '../../../domain/entities/refresh-token.entity.js';
import { RefreshTokenModel } from '../models/refresh-token.model.js';

export class MongoRefreshTokenRepository implements RefreshTokenRepository {
  async create(token: RefreshToken): Promise<RefreshToken> {
    const doc = await RefreshTokenModel.create({
      userId: token.userId,
      tenantId: token.tenantId,
      tokenHash: token.tokenHash,
      expiresAt: token.expiresAt,
    });
    return new RefreshToken({
      id: doc.id as string,
      userId: doc.userId,
      tenantId: doc.tenantId,
      tokenHash: doc.tokenHash,
      expiresAt: doc.expiresAt,
      createdAt: doc.createdAt,
    });
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    const doc = await RefreshTokenModel.findOne({ tokenHash });
    if (!doc) return null;
    return new RefreshToken({
      id: doc.id as string,
      userId: doc.userId,
      tenantId: doc.tenantId,
      tokenHash: doc.tokenHash,
      expiresAt: doc.expiresAt,
      createdAt: doc.createdAt,
    });
  }

  async deleteByUserId(userId: string): Promise<void> {
    await RefreshTokenModel.deleteMany({ userId });
  }

  async deleteExpired(): Promise<void> {
    await RefreshTokenModel.deleteMany({ expiresAt: { $lt: new Date() } });
  }
}

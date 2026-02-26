import crypto from 'crypto';
import { RefreshTokenDto, RefreshTokenResult } from '../../dtos/refresh-token.dto.js';
import { RefreshTokenRepository } from '../../../domain/ports/RefreshTokenRepository.Port.js';
import { UserRepository } from '../../../domain/ports/UserRepository.Port.js';
import { TokenService } from '../../ports/token.service.port.js';
import { UnauthorizedError } from '../../../domain/errors/domain-errors.js';
import { RefreshToken } from '../../../domain/entities/refresh-token.entity.js';

export class RefreshTokenUseCase {
  constructor(
    private readonly refreshTokenRepo: RefreshTokenRepository,
    private readonly userRepo: UserRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(dto: RefreshTokenDto): Promise<RefreshTokenResult> {
    const payload = this.tokenService.verifyRefresh(dto.refreshToken);

    const tokenHash = crypto.createHash('sha256').update(dto.refreshToken).digest('hex');
    const stored = await this.refreshTokenRepo.findByTokenHash(tokenHash);

    if (!stored || stored.isExpired()) {
      throw new UnauthorizedError('Refresh token invalid or expired');
    }

    const user = await this.userRepo.findById(stored.userId);
    if (!user || !user.active) {
      throw new UnauthorizedError('User not found or inactive');
    }

    // Rotate: delete old, issue new
    await this.refreshTokenRepo.deleteByUserId(user.id!);

    const newAccessToken = this.tokenService.sign({
      userId: user.id!,
      tenantId: user.tenantId,
      branchIds: user.branchIds,
      role: user.role,
    });

    const newRefreshRaw = this.tokenService.signRefresh({ userId: user.id!, tenantId: user.tenantId });
    const newRefreshHash = crypto.createHash('sha256').update(newRefreshRaw).digest('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.refreshTokenRepo.create(
      new RefreshToken({ userId: user.id!, tenantId: user.tenantId, tokenHash: newRefreshHash, expiresAt }),
    );

    return { accessToken: newAccessToken, refreshToken: newRefreshRaw };
  }
}

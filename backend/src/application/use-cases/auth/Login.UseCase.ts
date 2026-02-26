import crypto from 'crypto';
import { UseCase } from '../../interfaces/use-case.interface.js';
import { LoginDto, LoginResult } from '../../dtos/login.dto.js';
import { UserRepository } from '../../../domain/ports/UserRepository.Port.js';
import { HashingService } from '../../ports/hashing.service.port.js';
import { TokenService } from '../../ports/token.service.port.js';
import { RefreshTokenRepository } from '../../../domain/ports/RefreshTokenRepository.Port.js';
import { RefreshToken } from '../../../domain/entities/refresh-token.entity.js';
import { UnauthorizedError } from '../../../domain/errors/domain-errors.js';

export class LoginUseCase implements UseCase<LoginDto, LoginResult> {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly hashingService: HashingService,
    private readonly tokenService: TokenService,
    private readonly refreshTokenRepo: RefreshTokenRepository,
  ) {}

  async execute(dto: LoginDto): Promise<LoginResult> {
    const user = await this.userRepo.findByEmail(dto.email);

    // Use the same error for wrong email and wrong password — avoid leaking account existence
    const credentialsError = new UnauthorizedError('Invalid credentials');

    if (!user || !user.active) throw credentialsError;

    const passwordMatches = await this.hashingService.compare(dto.password, user.passwordHash);
    if (!passwordMatches) throw credentialsError;

    const accessToken = this.tokenService.sign({
      userId: user.id!,
      tenantId: user.tenantId,
      branchIds: user.branchIds,
      role: user.role,
    });

    const refreshRaw = this.tokenService.signRefresh({ userId: user.id!, tenantId: user.tenantId });
    const refreshHash = crypto.createHash('sha256').update(refreshRaw).digest('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.refreshTokenRepo.deleteByUserId(user.id!);
    await this.refreshTokenRepo.create(
      new RefreshToken({ userId: user.id!, tenantId: user.tenantId, tokenHash: refreshHash, expiresAt }),
    );

    return {
      accessToken,
      refreshToken: refreshRaw,
      user: {
        id: user.id!,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        branchIds: user.branchIds,
      },
    };
  }
}

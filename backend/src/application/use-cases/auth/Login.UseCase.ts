import { UseCase } from '../../interfaces/use-case.interface.js';
import { LoginDto, LoginResult } from '../../dtos/login.dto.js';
import { UserRepository } from '../../../domain/ports/UserRepository.Port.js';
import { HashingService } from '../../ports/hashing.service.port.js';
import { TokenService } from '../../ports/token.service.port.js';
import { UnauthorizedError } from '../../../domain/errors/domain-errors.js';

export class LoginUseCase implements UseCase<LoginDto, LoginResult> {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly hashingService: HashingService,
    private readonly tokenService: TokenService,
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
      branchId: user.branchId,
      role: user.role,
    });

    return {
      accessToken,
      user: {
        id: user.id!,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        branchId: user.branchId,
      },
    };
  }
}

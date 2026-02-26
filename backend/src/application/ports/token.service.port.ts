import { UserRole } from '../../domain/enums/user-role.enum.js';

export interface TokenPayload {
  userId: string;
  tenantId: string;
  branchIds: string[];
  role: UserRole;
  activeBranchId?: string;
}

export interface RefreshTokenPayload {
  userId: string;
  tenantId: string;
}

export interface TokenService {
  sign(payload: TokenPayload): string;
  verify(token: string): TokenPayload;
  signRefresh(payload: RefreshTokenPayload): string;
  verifyRefresh(token: string): RefreshTokenPayload;
}

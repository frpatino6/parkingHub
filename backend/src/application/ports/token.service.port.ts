import { UserRole } from '../../domain/enums/user-role.enum.js';

export interface TokenPayload {
  userId: string;
  tenantId: string;
  branchIds: string[];
  role: UserRole;
  activeBranchId?: string; // Added for runtime context
}

export interface TokenService {
  sign(payload: TokenPayload): string;
  verify(token: string): TokenPayload;
}

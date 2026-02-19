import { UserRole } from '../../domain/enums/user-role.enum.js';

export interface TokenPayload {
  userId: string;
  tenantId: string;
  branchId?: string;
  role: UserRole;
}

export interface TokenService {
  sign(payload: TokenPayload): string;
  verify(token: string): TokenPayload;
}

import { UserRole } from '../../domain/enums/user-role.enum.js';

export interface CreateUserDto {
  /** tenantId of the PARKING_ADMIN creating this user — from JWT */
  tenantId: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  /** List of permitted branch IDs. Required for OPERATOR role if they shouldn't have global access. */
  branchIds: string[];
}

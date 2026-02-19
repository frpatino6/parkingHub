import { UserRole } from '../../domain/enums/user-role.enum.js';

export interface CreateUserDto {
  /** tenantId of the PARKING_ADMIN creating this user — from JWT */
  tenantId: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  /** Required when role === OPERATOR */
  branchId?: string;
}

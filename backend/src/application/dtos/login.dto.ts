import { UserRole } from '../../domain/enums/user-role.enum.js';

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResult {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    tenantId: string;
    branchId?: string;
  };
}

import { UserRole } from '../enums/user-role.enum.js';

export interface UserProps {
  id?: string;
  tenantId: string;
  /** OPERATOR is assigned to a specific branch; PARKING_ADMIN can access all branches of the tenant */
  branchId?: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  private readonly _id?: string;
  private readonly _props: UserProps;

  constructor(props: UserProps) {
    this._id = props.id;
    this._props = {
      ...props,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    };
  }

  get id(): string | undefined { return this._id; }
  get tenantId(): string { return this._props.tenantId; }
  get branchId(): string | undefined { return this._props.branchId; }
  get name(): string { return this._props.name; }
  get email(): string { return this._props.email; }
  get passwordHash(): string { return this._props.passwordHash; }
  get role(): UserRole { return this._props.role; }
  get active(): boolean { return this._props.active; }
  get createdAt(): Date | undefined { return this._props.createdAt; }
  get updatedAt(): Date | undefined { return this._props.updatedAt; }

  hasRole(...roles: UserRole[]): boolean {
    return roles.includes(this._props.role);
  }

  activate(): void {
    this._props.active = true;
    this._props.updatedAt = new Date();
  }

  deactivate(): void {
    this._props.active = false;
    this._props.updatedAt = new Date();
  }
}

import { UserRole } from '../enums/user-role.enum.js';

export interface UserProps {
  id?: string;
  tenantId: string;
  /** List of permitted branch IDs. Empty array means access to ALL branches. */
  branchIds: string[];
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
  get branchIds(): string[] { return this._props.branchIds; }
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

  withPasswordHash(newHash: string): User {
    return new User({ ...this._props, id: this._id, passwordHash: newHash, updatedAt: new Date() });
  }
}

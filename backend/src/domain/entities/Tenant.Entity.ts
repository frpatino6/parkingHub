export interface TenantProps {
  id?: string;
  name: string;
  nit: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Tenant {
  private readonly _id?: string;
  private readonly _props: TenantProps;

  constructor(props: TenantProps) {
    this._id = props.id;
    this._props = {
      ...props,
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date()
    };
  }

  get id(): string | undefined {
    return this._id;
  }

  get name(): string {
    return this._props.name;
  }

  get nit(): string {
    return this._props.nit;
  }

  get active(): boolean {
    return this._props.active;
  }

  get createdAt(): Date | undefined {
    return this._props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this._props.updatedAt;
  }

  // Domain logic examples
  activate(): void {
    this._props.active = true;
    this._props.updatedAt = new Date();
  }

  deactivate(): void {
    this._props.active = false;
    this._props.updatedAt = new Date();
  }
}

export interface BranchProps {
  id?: string;
  tenantId: string;
  name: string;
  address: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Branch {
  private readonly _id?: string;
  private readonly _props: BranchProps;

  constructor(props: BranchProps) {
    this._id = props.id;
    this._props = {
      ...props,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    };
  }

  get id(): string | undefined { return this._id; }
  get tenantId(): string { return this._props.tenantId; }
  get name(): string { return this._props.name; }
  get address(): string { return this._props.address; }
  get active(): boolean { return this._props.active; }
  get createdAt(): Date | undefined { return this._props.createdAt; }
  get updatedAt(): Date | undefined { return this._props.updatedAt; }

  activate(): void {
    this._props.active = true;
    this._props.updatedAt = new Date();
  }

  deactivate(): void {
    this._props.active = false;
    this._props.updatedAt = new Date();
  }
}

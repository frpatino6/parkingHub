import { AuditAction } from '../enums/audit-action.enum.js';

export interface AuditLogProps {
  id?: string;
  tenantId: string;
  branchId?: string;
  userId: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
  createdAt?: Date;
}

/**
 * Immutable record of a critical business action.
 * No mutating methods — audit logs are never updated after creation.
 */
export class AuditLog {
  private readonly _id?: string;
  private readonly _props: AuditLogProps;

  constructor(props: AuditLogProps) {
    this._id = props.id;
    this._props = {
      ...props,
      createdAt: props.createdAt ?? new Date(),
    };
  }

  get id(): string | undefined { return this._id; }
  get tenantId(): string { return this._props.tenantId; }
  get branchId(): string | undefined { return this._props.branchId; }
  get userId(): string { return this._props.userId; }
  get action(): AuditAction { return this._props.action; }
  get entityType(): string { return this._props.entityType; }
  get entityId(): string { return this._props.entityId; }
  get metadata(): Record<string, unknown> | undefined { return this._props.metadata; }
  get createdAt(): Date | undefined { return this._props.createdAt; }
}

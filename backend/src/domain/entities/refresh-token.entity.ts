export interface RefreshTokenProps {
  id?: string;
  userId: string;
  tenantId: string;
  tokenHash: string;
  expiresAt: Date;
  createdAt?: Date;
}

export class RefreshToken {
  readonly id?: string;
  readonly userId: string;
  readonly tenantId: string;
  readonly tokenHash: string;
  readonly expiresAt: Date;
  readonly createdAt?: Date;

  constructor(props: RefreshTokenProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.tenantId = props.tenantId;
    this.tokenHash = props.tokenHash;
    this.expiresAt = props.expiresAt;
    this.createdAt = props.createdAt;
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }
}

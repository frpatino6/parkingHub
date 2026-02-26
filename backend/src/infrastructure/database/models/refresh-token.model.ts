import mongoose, { Schema, Document } from 'mongoose';

export interface RefreshTokenDoc extends Document {
  userId: string;
  tenantId: string;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
}

const RefreshTokenSchema = new Schema<RefreshTokenDoc>(
  {
    userId: { type: String, required: true, index: true },
    tenantId: { type: String, required: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const RefreshTokenModel = mongoose.model<RefreshTokenDoc>('RefreshToken', RefreshTokenSchema);

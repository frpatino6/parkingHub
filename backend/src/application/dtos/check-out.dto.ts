import { PaymentMethod } from '../../domain/enums/payment-method.enum.js';

export interface CheckOutDto {
  /** Extracted from JWT — never from request body */
  tenantId: string;
  branchId: string;
  operatorId: string;
  /** QR code scanned at exit */
  qrCode: string;
  paymentMethod: PaymentMethod;
}

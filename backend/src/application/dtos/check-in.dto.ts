import { VehicleType } from '../../domain/enums/vehicle-type.enum.js';

export interface CheckInDto {
  /** Extracted from JWT — never from request body */
  tenantId: string;
  branchId: string;
  operatorId: string;
  vehicleType: VehicleType;
  /** Vehicle plate (placa) */
  plate: string;
}

export interface CheckInResult {
  ticketId: string;
  qrCode: string;
  qrImageDataUrl: string;
  plate: string;
  vehicleType: VehicleType;
  checkIn: Date;
}

import { VehicleType } from '../enums/VehicleType.enum';

/** Result returned by the check-in API. */
export interface CheckInResult {
  ticketId: string;
  qrCode: string;
  qrImageDataUrl: string;
  plate: string;
  vehicleType: VehicleType;
  checkIn: string; // ISO date string
}

import { VehicleType } from '../enums/VehicleType.enum';

/** Full ticket information including current calculated fee. */
export interface TicketInfo {
  id: string;
  plate: string;
  vehicleType: VehicleType;
  status: string;
  checkIn: string; // ISO date string
  durationMinutes: number;
  currentAmountCOP: number;
  qrCode: string;
}

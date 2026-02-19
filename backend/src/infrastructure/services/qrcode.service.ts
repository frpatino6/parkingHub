import QRCode from 'qrcode';
import { QrCodeService } from '../../application/ports/qr-code.service.port.js';

export class QrCodeServiceImpl implements QrCodeService {
  async generateImage(payload: string): Promise<string> {
    return QRCode.toDataURL(payload);
  }
}

export interface QrCodeService {
  /** Generates a base64 data URL (PNG) for the given text payload. */
  generateImage(payload: string): Promise<string>;
}

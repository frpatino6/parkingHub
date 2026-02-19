import bcrypt from 'bcryptjs';
import { HashingService } from '../../application/ports/hashing.service.port.js';

export class BcryptHashingService implements HashingService {
  private readonly saltRounds = 12;

  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.saltRounds);
  }

  async compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}

import { Request, Response, NextFunction } from 'express';
import { LoginUseCase } from '../../../application/use-cases/auth/Login.UseCase.js';
import { RefreshTokenUseCase } from '../../../application/use-cases/auth/RefreshToken.UseCase.js';

export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
  ) {}

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.loginUseCase.execute({
        email: req.body.email as string,
        password: req.body.password as string,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.refreshTokenUseCase.execute({
        refreshToken: req.body.refreshToken as string,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  };
}

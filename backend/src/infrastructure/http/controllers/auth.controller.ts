import { Request, Response, NextFunction } from 'express';
import { LoginUseCase } from '../../../application/use-cases/auth/login.use-case.js';

export class AuthController {
  constructor(private readonly loginUseCase: LoginUseCase) {}

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
}

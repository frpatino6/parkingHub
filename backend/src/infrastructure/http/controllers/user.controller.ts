import { Request, Response, NextFunction } from 'express';
import { CreateUserUseCase } from '../../../application/use-cases/user/create-user.use-case.js';
import { User } from '../../../domain/entities/user.entity.js';
import { UserRole } from '../../../domain/enums/user-role.enum.js';

export class UserController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.createUserUseCase.execute({
        tenantId: req.auth!.tenantId,
        name: req.body.name as string,
        email: req.body.email as string,
        password: req.body.password as string,
        role: req.body.role as UserRole,
        branchId: req.body.branchId as string | undefined,
      });
      res.status(201).json(this.toResponse(user));
    } catch (err) {
      next(err);
    }
  };

  private toResponse(user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      branchId: user.branchId,
      active: user.active,
    };
  }
}

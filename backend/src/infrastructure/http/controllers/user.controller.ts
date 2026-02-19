import { Request, Response, NextFunction } from 'express';
import { GetUsersUseCase } from '../../../application/use-cases/user/GetUsers.UseCase.js';
import { UpdateUserUseCase } from '../../../application/use-cases/user/UpdateUser.UseCase.js';
import { ResetPasswordUseCase } from '../../../application/use-cases/user/ResetPassword.UseCase.js';
import { CreateUserUseCase } from '../../../application/use-cases/user/CreateUser.UseCase.js';
import { User } from '../../../domain/entities/User.Entity.js';
import { UserRole } from '../../../domain/enums/user-role.enum.js';

export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUsersUseCase: GetUsersUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
  ) {}

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

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await this.getUsersUseCase.execute();
      res.json(users.map(u => this.toResponse(u)));
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.updateUserUseCase.execute({
        userId: req.params['id'] as string,
        name: req.body.name as string,
        role: req.body.role as UserRole,
        active: req.body.active as boolean,
        branchId: req.body.branchId as string,
      });
      res.json(this.toResponse(user));
    } catch (err) {
      next(err);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.resetPasswordUseCase.execute({
        userId: req.params['id'] as string,
        newPassword: req.body.password as string,
      });
      res.json(this.toResponse(user));
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

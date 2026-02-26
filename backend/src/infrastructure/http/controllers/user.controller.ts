import { Request, Response, NextFunction } from 'express';
import { GetUsersUseCase } from '../../../application/use-cases/user/GetUsers.UseCase.js';
import { GetUsersPaginatedUseCase } from '../../../application/use-cases/user/GetUsersPaginated.UseCase.js';
import { UpdateUserUseCase } from '../../../application/use-cases/user/UpdateUser.UseCase.js';
import { ResetPasswordUseCase } from '../../../application/use-cases/user/ResetPassword.UseCase.js';
import { CreateUserUseCase } from '../../../application/use-cases/user/CreateUser.UseCase.js';
import { ChangeOwnPasswordUseCase } from '../../../application/use-cases/user/ChangeOwnPassword.UseCase.js';
import { User } from '../../../domain/entities/user.entity.js';
import { UserRole } from '../../../domain/enums/user-role.enum.js';

export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUsersUseCase: GetUsersUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly getUsersPaginatedUseCase: GetUsersPaginatedUseCase,
    private readonly changeOwnPasswordUseCase: ChangeOwnPasswordUseCase,
  ) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.createUserUseCase.execute({
        tenantId: req.auth!.tenantId,
        name: req.body.name as string,
        email: req.body.email as string,
        password: req.body.password as string,
        role: req.body.role as UserRole,
        branchIds: req.body.branchIds as string[] || [],
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
        branchIds: req.body.branchIds as string[],
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

  getAllPaginated = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Math.max(1, Number(req.query['page']) || 1);
      const limit = Math.min(100, Math.max(1, Number(req.query['limit']) || 20));
      const result = await this.getUsersPaginatedUseCase.execute({ page, limit });
      res.json({
        items: result.items.map((u: User) => this.toResponse(u)),
        total: result.total,
        page,
        limit,
      });
    } catch (err) {
      next(err);
    }
  };

  changeOwnPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.changeOwnPasswordUseCase.execute({
        userId: req.auth!.userId,
        tenantId: req.auth!.tenantId,
        currentPassword: req.body.currentPassword as string,
        newPassword: req.body.newPassword as string,
      });
      res.json({ message: 'Password changed successfully' });
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
      branchIds: user.branchIds,
      active: user.active,
    };
  }
}


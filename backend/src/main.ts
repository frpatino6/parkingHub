import 'dotenv/config';
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import { Router } from 'express';
import { connectDatabase } from './infrastructure/database/connection.js';
import { createServer } from './infrastructure/http/server.js';
import { logger } from './infrastructure/config/logger.js';
import { config } from './infrastructure/config/env.js';

// ─── Infrastructure: Services ─────────────────────────────────────────────────
import { BcryptHashingService } from './infrastructure/services/bcrypt-hashing.service.js';
import { JwtTokenService } from './infrastructure/services/jwt-token.service.js';
import { QrCodeServiceImpl } from './infrastructure/services/qrcode.service.js';
import { PricingEngineService } from './application/services/pricing-engine.service.js';

// ─── Infrastructure: Repositories ─────────────────────────────────────────────
import { MongoTenantRepository } from './infrastructure/database/repositories/MongoTenant.Repository.js';
import { MongoBranchRepository } from './infrastructure/database/repositories/MongoBranch.Repository.js';
import { MongoUserRepository } from './infrastructure/database/repositories/MongoUser.Repository.js';
import { MongoTicketRepository } from './infrastructure/database/repositories/MongoTicket.Repository.js';
import { MongoCashCutRepository } from './infrastructure/database/repositories/MongoCashCut.Repository.js';
import { MongoAuditLogRepository } from './infrastructure/database/repositories/MongoAuditLog.Repository.js';
import { MongoPricingConfigRepository } from './infrastructure/database/repositories/MongoPricingConfig.Repository.js';
import { MongoFinancialMovementRepository } from './infrastructure/database/repositories/MongoFinancialMovement.Repository.js';

// ─── Application: Use Cases ───────────────────────────────────────────────────
import { LoginUseCase } from './application/use-cases/auth/Login.UseCase.js';
import { CheckInUseCase } from './application/use-cases/ticket/CheckIn.UseCase.js';
import { CheckOutUseCase } from './application/use-cases/ticket/CheckOut.UseCase.js';
import { GetTicketByQrUseCase } from './application/use-cases/ticket/GetTicketByQr.UseCase.js';
import { GetActiveTicketsUseCase } from './application/use-cases/ticket/GetActiveTickets.UseCase.js';
import { CancelTicketUseCase } from './application/use-cases/ticket/CancelTicket.UseCase.js';
import { GetTicketsByPlateUseCase } from './application/use-cases/ticket/GetTicketsByPlate.UseCase.js';
import { OpenCashCutUseCase } from './application/use-cases/cash-cut/OpenCashCut.UseCase.js';
import { CloseCashCutUseCase } from './application/use-cases/cash-cut/CloseCashCut.UseCase.js';
import { GetCurrentCashCutUseCase } from './application/use-cases/cash-cut/GetCurrentCashCut.UseCase.js';
import { CreateFinancialMovementUseCase } from './application/use-cases/cash-cut/CreateFinancialMovement.UseCase.js';
import { GetFinancialMovementsUseCase } from './application/use-cases/cash-cut/GetFinancialMovements.UseCase.js';
import { GetMovementsReportUseCase } from './application/use-cases/financial/GetMovementsReport.UseCase.js';
import { CreateUserUseCase } from './application/use-cases/user/CreateUser.UseCase.js';
import { GetUsersUseCase } from './application/use-cases/user/GetUsers.UseCase.js';
import { UpdateUserUseCase } from './application/use-cases/user/UpdateUser.UseCase.js';
import { ResetPasswordUseCase } from './application/use-cases/user/ResetPassword.UseCase.js';
import { CreateBranchUseCase } from './application/use-cases/branch/CreateBranch.UseCase.js';
import { GetBranchesByTenantUseCase } from './application/use-cases/branch/GetBranchesByTenant.UseCase.js';
import { CreatePricingConfigUseCase } from './application/use-cases/pricing/CreatePricingConfig.UseCase.js';
import { GetPricingConfigsUseCase } from './application/use-cases/pricing/GetPricingConfigs.UseCase.js';
import { UpdatePricingConfigUseCase } from './application/use-cases/pricing/UpdatePricingConfig.UseCase.js';

// ─── Infrastructure: HTTP ─────────────────────────────────────────────────────
import { authMiddleware, requireRole } from './infrastructure/http/middlewares/auth.middleware.js';
import { tenantContextMiddleware } from './infrastructure/http/middlewares/TenantContext.Middleware.js';
import { requireOpenCashCut } from './infrastructure/http/middlewares/RequireOpenCashCut.Middleware.js';
import { AuthController } from './infrastructure/http/controllers/Auth.Controller.js';
import { TicketController } from './infrastructure/http/controllers/Ticket.Controller.js';
import { CashCutController } from './infrastructure/http/controllers/CashCut.Controller.js';
import { UserController } from './infrastructure/http/controllers/User.Controller.js';
import { BranchController } from './infrastructure/http/controllers/Branch.Controller.js';
import { PricingConfigController } from './infrastructure/http/controllers/PricingConfig.Controller.js';
import { createAuthRoutes } from './infrastructure/http/routes/auth.routes.js';
import { createTicketRoutes } from './infrastructure/http/routes/ticket.routes.js';
import { createCashCutRoutes } from './infrastructure/http/routes/cash-cut.routes.js';
import { createUserRoutes } from './infrastructure/http/routes/user.routes.js';
import { createBranchRoutes } from './infrastructure/http/routes/branch.routes.js';
import { createPricingConfigRoutes } from './infrastructure/http/routes/pricing-config.routes.js';
import { UserRole } from './domain/enums/user-role.enum.js';

async function bootstrap(): Promise<void> {
  await connectDatabase();

  // ── Services ──────────────────────────────────────────────────────────────
  const hashingService = new BcryptHashingService();
  const tokenService = new JwtTokenService(config.JWT_SECRET);
  const qrCodeService = new QrCodeServiceImpl();
  const pricingEngine = new PricingEngineService();

  // ── Repositories ──────────────────────────────────────────────────────────
  const userRepo = new MongoUserRepository();
  const branchRepo = new MongoBranchRepository();
  const ticketRepo = new MongoTicketRepository();
  const cashCutRepo = new MongoCashCutRepository();
  const auditLogRepo = new MongoAuditLogRepository();
  const pricingConfigRepo = new MongoPricingConfigRepository();
  const movementRepo = new MongoFinancialMovementRepository();

  // ── Use Cases ─────────────────────────────────────────────────────────────
  const loginUseCase = new LoginUseCase(userRepo, hashingService, tokenService);
  const checkInUseCase = new CheckInUseCase(ticketRepo, cashCutRepo, auditLogRepo, qrCodeService);
  const checkOutUseCase = new CheckOutUseCase(
    ticketRepo,
    pricingConfigRepo,
    cashCutRepo,
    auditLogRepo,
    pricingEngine,
  );
  const getTicketByQrUseCase = new GetTicketByQrUseCase(ticketRepo, pricingConfigRepo, pricingEngine);
  const getActiveTicketsUseCase = new GetActiveTicketsUseCase(ticketRepo);
  const cancelTicketUseCase = new CancelTicketUseCase(ticketRepo, auditLogRepo);
  const getTicketsByPlateUseCase = new GetTicketsByPlateUseCase(ticketRepo);
  const openCashCutUseCase = new OpenCashCutUseCase(cashCutRepo, auditLogRepo);
  const closeCashCutUseCase = new CloseCashCutUseCase(cashCutRepo, auditLogRepo);
  const getCurrentCashCutUseCase = new GetCurrentCashCutUseCase(cashCutRepo);
  const createMovementUseCase = new CreateFinancialMovementUseCase(movementRepo, cashCutRepo, auditLogRepo);
  const getMovementsUseCase = new GetFinancialMovementsUseCase(movementRepo);
  const getMovementsReportUseCase = new GetMovementsReportUseCase(movementRepo);
  const createUserUseCase = new CreateUserUseCase(userRepo, auditLogRepo, hashingService);
  const getUsersUseCase = new GetUsersUseCase(userRepo);
  const updateUserUseCase = new UpdateUserUseCase(userRepo, auditLogRepo);
  const resetPasswordUseCase = new ResetPasswordUseCase(userRepo, auditLogRepo, hashingService);
  const createBranchUseCase = new CreateBranchUseCase(branchRepo, auditLogRepo);
  const getBranchesByTenantUseCase = new GetBranchesByTenantUseCase(branchRepo);
  const createPricingConfigUseCase = new CreatePricingConfigUseCase(pricingConfigRepo, auditLogRepo);
  const getPricingConfigsUseCase = new GetPricingConfigsUseCase(pricingConfigRepo);
  const updatePricingConfigUseCase = new UpdatePricingConfigUseCase(pricingConfigRepo);

  // ── Controllers ───────────────────────────────────────────────────────────
  const authController = new AuthController(loginUseCase);
  const ticketController = new TicketController(
    checkInUseCase,
    checkOutUseCase,
    getTicketByQrUseCase,
    getActiveTicketsUseCase,

    cancelTicketUseCase,
    getTicketsByPlateUseCase,
  );
  const cashCutController = new CashCutController(
    openCashCutUseCase,
    closeCashCutUseCase,
    getCurrentCashCutUseCase,
    createMovementUseCase,
    getMovementsUseCase,
    getMovementsReportUseCase,
  );
  const userController = new UserController(
    createUserUseCase,
    getUsersUseCase,
    updateUserUseCase,
    resetPasswordUseCase,
  );
  const branchController = new BranchController(createBranchUseCase, getBranchesByTenantUseCase);
  const pricingConfigController = new PricingConfigController(
    createPricingConfigUseCase,
    getPricingConfigsUseCase,
    updatePricingConfigUseCase
  );

  // ── Middleware ────────────────────────────────────────────────────────────
  const authenticate = authMiddleware(tokenService);
  const adminOnly = requireRole(UserRole.PARKING_ADMIN, UserRole.SUPER_ADMIN);
  const operatorOrAdmin = requireRole(UserRole.OPERATOR, UserRole.PARKING_ADMIN, UserRole.SUPER_ADMIN);

  // ── Router ────────────────────────────────────────────────────────────────
  const apiRouter = Router();

  apiRouter.use('/auth', createAuthRoutes(authController));


  // Global Tenant Context for all protected routes
  apiRouter.use(authenticate, tenantContextMiddleware);

  apiRouter.use('/tickets', operatorOrAdmin, requireOpenCashCut(cashCutRepo), createTicketRoutes(ticketController));
  apiRouter.use(
    '/cash-cuts',
    operatorOrAdmin,
    createCashCutRoutes(cashCutController),
  );
  apiRouter.use('/users', adminOnly, createUserRoutes(userController));
  apiRouter.use('/branches', adminOnly, createBranchRoutes(branchController));
  apiRouter.use(
    '/pricing-configs',
    adminOnly,
    createPricingConfigRoutes(pricingConfigController),
  );

  const app = createServer(apiRouter);
  app.listen(config.PORT, () => logger.info({ port: config.PORT }, 'Server listening'));
}

bootstrap().catch((err) => {
  logger.fatal({ err }, 'Bootstrap failed');
  process.exit(1);
});

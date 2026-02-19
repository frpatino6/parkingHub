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
import { MongoTenantRepository } from './infrastructure/database/repositories/mongo-tenant.repository.js';
import { MongoBranchRepository } from './infrastructure/database/repositories/mongo-branch.repository.js';
import { MongoUserRepository } from './infrastructure/database/repositories/mongo-user.repository.js';
import { MongoTicketRepository } from './infrastructure/database/repositories/mongo-ticket.repository.js';
import { MongoCashCutRepository } from './infrastructure/database/repositories/mongo-cash-cut.repository.js';
import { MongoAuditLogRepository } from './infrastructure/database/repositories/mongo-audit-log.repository.js';
import { MongoPricingConfigRepository } from './infrastructure/database/repositories/mongo-pricing-config.repository.js';

// ─── Application: Use Cases ───────────────────────────────────────────────────
import { LoginUseCase } from './application/use-cases/auth/login.use-case.js';
import { CheckInUseCase } from './application/use-cases/ticket/check-in.use-case.js';
import { CheckOutUseCase } from './application/use-cases/ticket/check-out.use-case.js';
import { CancelTicketUseCase } from './application/use-cases/ticket/cancel-ticket.use-case.js';
import { OpenCashCutUseCase } from './application/use-cases/cash-cut/open-cash-cut.use-case.js';
import { CloseCashCutUseCase } from './application/use-cases/cash-cut/close-cash-cut.use-case.js';
import { CreateUserUseCase } from './application/use-cases/user/create-user.use-case.js';
import { CreateBranchUseCase } from './application/use-cases/branch/create-branch.use-case.js';
import { CreatePricingConfigUseCase } from './application/use-cases/pricing/create-pricing-config.use-case.js';

// ─── Infrastructure: HTTP ─────────────────────────────────────────────────────
import { authMiddleware, requireRole } from './infrastructure/http/middlewares/auth.middleware.js';
import { AuthController } from './infrastructure/http/controllers/auth.controller.js';
import { TicketController } from './infrastructure/http/controllers/ticket.controller.js';
import { CashCutController } from './infrastructure/http/controllers/cash-cut.controller.js';
import { UserController } from './infrastructure/http/controllers/user.controller.js';
import { BranchController } from './infrastructure/http/controllers/branch.controller.js';
import { PricingConfigController } from './infrastructure/http/controllers/pricing-config.controller.js';
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

  // ── Use Cases ─────────────────────────────────────────────────────────────
  const loginUseCase = new LoginUseCase(userRepo, hashingService, tokenService);
  const checkInUseCase = new CheckInUseCase(ticketRepo, auditLogRepo, qrCodeService);
  const checkOutUseCase = new CheckOutUseCase(
    ticketRepo,
    pricingConfigRepo,
    cashCutRepo,
    auditLogRepo,
    pricingEngine,
  );
  const cancelTicketUseCase = new CancelTicketUseCase(ticketRepo, auditLogRepo);
  const openCashCutUseCase = new OpenCashCutUseCase(cashCutRepo, auditLogRepo);
  const closeCashCutUseCase = new CloseCashCutUseCase(cashCutRepo, auditLogRepo);
  const createUserUseCase = new CreateUserUseCase(userRepo, auditLogRepo, hashingService);
  const createBranchUseCase = new CreateBranchUseCase(branchRepo, auditLogRepo);
  const createPricingConfigUseCase = new CreatePricingConfigUseCase(pricingConfigRepo, auditLogRepo);

  // ── Controllers ───────────────────────────────────────────────────────────
  const authController = new AuthController(loginUseCase);
  const ticketController = new TicketController(checkInUseCase, checkOutUseCase, cancelTicketUseCase);
  const cashCutController = new CashCutController(openCashCutUseCase, closeCashCutUseCase);
  const userController = new UserController(createUserUseCase);
  const branchController = new BranchController(createBranchUseCase);
  const pricingConfigController = new PricingConfigController(createPricingConfigUseCase);

  // ── Middleware ────────────────────────────────────────────────────────────
  const authenticate = authMiddleware(tokenService);
  const adminOnly = requireRole(UserRole.PARKING_ADMIN, UserRole.SUPER_ADMIN);
  const operatorOrAdmin = requireRole(UserRole.OPERATOR, UserRole.PARKING_ADMIN, UserRole.SUPER_ADMIN);

  // ── Router ────────────────────────────────────────────────────────────────
  const apiRouter = Router();

  apiRouter.use('/auth', createAuthRoutes(authController));
  apiRouter.use('/tickets', authenticate, operatorOrAdmin, createTicketRoutes(ticketController));
  apiRouter.use(
    '/cash-cuts',
    authenticate,
    requireRole(UserRole.OPERATOR),
    createCashCutRoutes(cashCutController),
  );
  apiRouter.use('/users', authenticate, adminOnly, createUserRoutes(userController));
  apiRouter.use('/branches', authenticate, adminOnly, createBranchRoutes(branchController));
  apiRouter.use(
    '/pricing-configs',
    authenticate,
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

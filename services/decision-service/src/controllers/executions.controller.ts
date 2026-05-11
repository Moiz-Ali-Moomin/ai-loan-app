import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { z, ZodError } from 'zod';
import { createLogger } from '@loan-platform/logger';
import { ExecutionService } from '../modules/execution/execution.service.js';
import { ApprovalService } from '../modules/approvals/approval.service.js';
import { JwtAuthGuard, RolesGuard, CurrentUser, Roles } from '../auth/jwt.guard.js';
import { UserRole, ExecutionStatus, type AuthenticatedUser } from '../common/types.js';
import { FlowNotFoundError, FlowNotPublishedError, IdempotencyConflictError } from '../common/errors.js';

const logger = createLogger('decision-service:executions-controller');

// ─── Schemas ──────────────────────────────────────────────────────────────────

const ExecuteFlowSchema = z.object({
  flow_id: z.string().uuid(),
  flow_snapshot_id: z.string().uuid().optional(),
  application_id: z.string().uuid().optional(),
  workflow_run_id: z.string().uuid().optional(),
  input: z.record(z.unknown()),
  idempotency_key: z.string().max(256).optional(),
  correlation_id: z.string().optional(),
  timeout_ms: z.number().int().positive().max(86_400_000).optional(),
});

// ─── Controller ────────────────────────────────────────────────────────────────

@Controller('api/v1/decision')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExecutionsController {
  constructor(
    private readonly executionService: ExecutionService,
    private readonly approvalService: ApprovalService,
  ) {}

  @Post('execute')
  @HttpCode(HttpStatus.ACCEPTED)
  async execute(
    @Body() body: unknown,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    try {
      const input = ExecuteFlowSchema.parse(body);
      const result = await this.executionService.executeFlow({
        tenantId: user.tenantId,
        flowId: input.flow_id,
        flowSnapshotId: input.flow_snapshot_id,
        applicationId: input.application_id,
        workflowRunId: input.workflow_run_id,
        input: input.input,
        idempotencyKey: input.idempotency_key,
        correlationId: input.correlation_id,
        initiatedBy: user.sub,
        initiatedByType: 'USER',
        timeoutMs: input.timeout_ms,
      });
      return { success: true, data: result };
    } catch (err) {
      return this.handleError(err);
    }
  }

  @Get('executions')
  async listExecutions(
    @CurrentUser() user: AuthenticatedUser,
    @Query('status') status?: string,
    @Query('flow_id') flowId?: string,
    @Query('application_id') applicationId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const result = await this.executionService.listExecutions(user.tenantId, {
      status: status as ExecutionStatus | undefined,
      flowId,
      applicationId,
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
    });
    return { success: true, ...result };
  }

  @Get(':id')
  async getExecution(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    try {
      const execution = await this.executionService.getExecution(id, user.tenantId);
      return { success: true, data: execution };
    } catch (err) {
      return this.handleError(err);
    }
  }

  @Post('retry/:id')
  @HttpCode(HttpStatus.ACCEPTED)
  @Roles(UserRole.ADMIN, UserRole.UNDERWRITER)
  async retryExecution(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    try {
      const result = await this.executionService.retryExecution(id, user.tenantId, user.sub);
      return { success: true, data: result };
    } catch (err) {
      return this.handleError(err);
    }
  }

  @Post('cancel/:id')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN, UserRole.UNDERWRITER)
  async cancelExecution(
    @Param('id') id: string,
    @Body() body: { reason?: string },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    try {
      await this.executionService.cancelExecution(id, user.tenantId, body.reason ?? 'User requested cancellation');
      return { success: true };
    } catch (err) {
      return this.handleError(err);
    }
  }

  @Get(':id/approvals')
  async getExecutionApprovals(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const approvals = await this.approvalService.getApprovalsByExecution(id, user.tenantId);
    return { success: true, data: approvals, total: approvals.length };
  }

  private handleError(err: unknown): never {
    if (err instanceof ZodError) {
      throw new BadRequestException({ error: 'Validation failed', details: err.issues });
    }
    if (err instanceof FlowNotFoundError) throw new NotFoundException(err.message);
    if (err instanceof FlowNotPublishedError) throw new BadRequestException(err.message);
    if (err instanceof IdempotencyConflictError) throw new BadRequestException(err.message);
    logger.error('Execution controller error', { err });
    throw err;
  }
}

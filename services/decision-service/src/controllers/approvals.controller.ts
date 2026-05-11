import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { z, ZodError } from 'zod';
import { createLogger } from '@loan-platform/logger';
import { ApprovalService } from '../modules/approvals/approval.service.js';
import { JwtAuthGuard, RolesGuard, CurrentUser, Roles } from '../auth/jwt.guard.js';
import { UserRole, type AuthenticatedUser } from '../common/types.js';
import { ApprovalNotFoundError, ApprovalAlreadyDecidedError, TenantIsolationError } from '../common/errors.js';

const logger = createLogger('decision-service:approvals-controller');

const ApproveSchema = z.object({ notes: z.string().max(2000).optional() });
const RejectSchema = z.object({ notes: z.string().max(2000).optional() });
const DelegateSchema = z.object({
  delegate_to: z.string().min(1),
  notes: z.string().max(2000).optional(),
});

@Controller('api/v1/approvals')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApprovalsController {
  constructor(private readonly approvalService: ApprovalService) {}

  @Get()
  async listPending(@CurrentUser() user: AuthenticatedUser) {
    const approvals = await this.approvalService.getPendingApprovals(user.tenantId);
    return { success: true, data: approvals, total: approvals.length };
  }

  @Get(':id')
  async getApproval(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    try {
      const approval = await this.approvalService.getApproval(id, user.tenantId);
      return { success: true, data: approval };
    } catch (err) {
      return this.handleError(err);
    }
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN, UserRole.UNDERWRITER, UserRole.REVIEWER)
  async approve(
    @Param('id') id: string,
    @Body() body: unknown,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    try {
      const input = ApproveSchema.parse(body);
      const approval = await this.approvalService.approve({
        approvalId: id,
        tenantId: user.tenantId,
        decidedBy: user.sub,
        notes: input.notes,
      });
      logger.info('Approval approved via API', { approvalId: id, decidedBy: user.sub });
      return { success: true, data: { id: approval.id, status: approval.status, decidedAt: approval.decidedAt } };
    } catch (err) {
      return this.handleError(err);
    }
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN, UserRole.UNDERWRITER, UserRole.REVIEWER)
  async reject(
    @Param('id') id: string,
    @Body() body: unknown,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    try {
      const input = RejectSchema.parse(body);
      const approval = await this.approvalService.reject({
        approvalId: id,
        tenantId: user.tenantId,
        decidedBy: user.sub,
        notes: input.notes,
      });
      logger.info('Approval rejected via API', { approvalId: id, decidedBy: user.sub });
      return { success: true, data: { id: approval.id, status: approval.status, decidedAt: approval.decidedAt } };
    } catch (err) {
      return this.handleError(err);
    }
  }

  @Post(':id/delegate')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN, UserRole.UNDERWRITER, UserRole.REVIEWER)
  async delegate(
    @Param('id') id: string,
    @Body() body: unknown,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    try {
      const input = DelegateSchema.parse(body);
      const delegated = await this.approvalService.delegate({
        approvalId: id,
        tenantId: user.tenantId,
        delegateTo: input.delegate_to,
        delegatedBy: user.sub,
        notes: input.notes,
      });
      return { success: true, data: { newApprovalId: delegated.id, delegatedTo: delegated.assignedTo } };
    } catch (err) {
      return this.handleError(err);
    }
  }

  private handleError(err: unknown): never {
    if (err instanceof ZodError) {
      throw new BadRequestException({ error: 'Validation failed', details: err.issues });
    }
    if (err instanceof ApprovalNotFoundError) throw new NotFoundException(err.message);
    if (err instanceof ApprovalAlreadyDecidedError) throw new BadRequestException(err.message);
    if (err instanceof TenantIsolationError) throw new NotFoundException('Not found');
    logger.error('Approval controller error', { err });
    throw err;
  }
}

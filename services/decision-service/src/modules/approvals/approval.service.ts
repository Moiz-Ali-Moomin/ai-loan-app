import { Injectable } from '@nestjs/common';
import { createLogger } from '@loan-platform/logger';
import { withSpan } from '@loan-platform/telemetry';
import { KafkaTopic } from '@loan-platform/shared-types';
import type { KafkaProducerClient } from '@loan-platform/kafka';
import { ApprovalRequest } from '../../domain/approval-request.entity.js';
import { ApprovalRepository } from '../../repositories/approval.repository.js';
import { CacheService } from '../../infrastructure/cache.service.js';
import { ExecutionService } from '../execution/execution.service.js';
import { ApprovalNotFoundError, ApprovalAlreadyDecidedError, TenantIsolationError } from '../../common/errors.js';
import { ApprovalStatus, type ApprovalPriority } from '../../common/types.js';
import { approvalDecisionsTotal, approvalWaitDuration } from '../../utils/engine-metrics.js';

const logger = createLogger('decision-service:approval-service');

export interface ApproveInput {
  approvalId: string;
  tenantId: string;
  decidedBy: string;
  notes?: string;
}

export interface RejectInput {
  approvalId: string;
  tenantId: string;
  decidedBy: string;
  notes?: string;
}

export interface DelegateInput {
  approvalId: string;
  tenantId: string;
  delegateTo: string;
  delegatedBy: string;
  notes?: string;
}

@Injectable()
export class ApprovalService {
  constructor(
    private readonly approvalRepository: ApprovalRepository,
    private readonly executionService: ExecutionService,
    private readonly cache: CacheService,
    private readonly kafkaProducer: KafkaProducerClient,
  ) {}

  async approve(input: ApproveInput): Promise<ApprovalRequest> {
    return withSpan('decision-service', 'approval:approve', { approvalId: input.approvalId }, async () => {
      const approval = await this.findAndAssertTenant(input.approvalId, input.tenantId);

      const waitMs = Date.now() - approval.createdAt.getTime();
      approval.approve(input.decidedBy, input.notes);
      await this.approvalRepository.update(approval);

      // Signal the Temporal workflow to resume
      await this.executionService.sendApprovalSignal(approval.executionId, input.tenantId, {
        approvalId: approval.id,
        decision: 'APPROVE',
        decidedBy: input.decidedBy,
        notes: input.notes,
      });

      approvalDecisionsTotal.add(1, { decision: 'APPROVE', tenantId: input.tenantId });
      approvalWaitDuration.record(waitMs, { decision: 'APPROVE' });

      await this.publishApprovalEvent(approval, 'APPROVED');
      await this.cache.invalidatePendingApprovals(input.tenantId);

      logger.info('Approval approved', { approvalId: input.approvalId, decidedBy: input.decidedBy });
      return approval;
    });
  }

  async reject(input: RejectInput): Promise<ApprovalRequest> {
    return withSpan('decision-service', 'approval:reject', { approvalId: input.approvalId }, async () => {
      const approval = await this.findAndAssertTenant(input.approvalId, input.tenantId);

      const waitMs = Date.now() - approval.createdAt.getTime();
      approval.reject(input.decidedBy, input.notes);
      await this.approvalRepository.update(approval);

      await this.executionService.sendApprovalSignal(approval.executionId, input.tenantId, {
        approvalId: approval.id,
        decision: 'REJECT',
        decidedBy: input.decidedBy,
        notes: input.notes,
      });

      approvalDecisionsTotal.add(1, { decision: 'REJECT', tenantId: input.tenantId });
      approvalWaitDuration.record(waitMs, { decision: 'REJECT' });

      await this.publishApprovalEvent(approval, 'REJECTED');
      await this.cache.invalidatePendingApprovals(input.tenantId);

      logger.info('Approval rejected', { approvalId: input.approvalId, decidedBy: input.decidedBy });
      return approval;
    });
  }

  async delegate(input: DelegateInput): Promise<ApprovalRequest> {
    const approval = await this.findAndAssertTenant(input.approvalId, input.tenantId);

    approval.delegate(input.delegateTo, input.delegatedBy, input.notes);
    await this.approvalRepository.update(approval);

    // Create a new approval request for the delegate
    const delegated = ApprovalRequest.create({
      tenantId: input.tenantId,
      executionId: approval.executionId,
      nodeId: approval.nodeId,
      applicationId: approval.applicationId,
      assignedTo: input.delegateTo,
      assignedRole: approval.assignedRole,
      priority: approval.priority,
      contextSnapshot: approval.contextSnapshot,
      dueDurationMs: approval.dueAt.getTime() - Date.now(),
      temporalWorkflowId: approval.temporalWorkflowId,
      temporalSignalName: approval.temporalSignalName,
    });

    await this.approvalRepository.save(delegated);
    await this.cache.invalidatePendingApprovals(input.tenantId);

    logger.info('Approval delegated', { approvalId: input.approvalId, delegateTo: input.delegateTo });
    return delegated;
  }

  async getPendingApprovals(tenantId: string): Promise<ApprovalRequest[]> {
    const cached = await this.cache.getPendingApprovals(tenantId);
    if (cached) return cached as ApprovalRequest[];

    const approvals = await this.approvalRepository.findPendingByTenant(tenantId);
    await this.cache.setPendingApprovals(tenantId, approvals);
    return approvals;
  }

  async getApproval(approvalId: string, tenantId: string): Promise<ApprovalRequest> {
    return this.findAndAssertTenant(approvalId, tenantId);
  }

  async getApprovalsByExecution(executionId: string, tenantId: string): Promise<ApprovalRequest[]> {
    return this.approvalRepository.findByExecution(executionId, tenantId);
  }

  private async findAndAssertTenant(approvalId: string, tenantId: string): Promise<ApprovalRequest> {
    const approval = await this.approvalRepository.findById(approvalId, tenantId);
    if (!approval) throw new ApprovalNotFoundError(approvalId);
    if (approval.tenantId !== tenantId) throw new TenantIsolationError();
    return approval;
  }

  private async publishApprovalEvent(approval: ApprovalRequest, outcome: string): Promise<void> {
    this.kafkaProducer.publish(
      KafkaTopic.APPROVAL_COMPLETED,
      `APPROVAL_${outcome}`,
      {
        approvalId: approval.id,
        executionId: approval.executionId,
        applicationId: approval.applicationId,
        decision: approval.decision,
        decidedBy: approval.decidedBy,
        decidedAt: approval.decidedAt?.toISOString(),
      },
      {
        tenantId: approval.tenantId,
        correlationId: approval.executionId,
        source: 'decision-service',
        key: approval.executionId,
      }
    ).catch(err => logger.error('Failed to publish approval event', { err, approvalId: approval.id }));
  }
}

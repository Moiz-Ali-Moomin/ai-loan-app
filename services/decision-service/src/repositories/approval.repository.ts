import { Injectable, Inject } from '@nestjs/common';
import { createLogger } from '@loan-platform/logger';
import type { DatabasePool } from '@loan-platform/database';
import { DB_POOL_TOKEN } from './decision.repository.js';
import { ApprovalRequest } from '../domain/approval-request.entity.js';
import { ApprovalStatus, type ApprovalPriority } from '../common/types.js';

const logger = createLogger('decision-service:approval-repository');

interface ApprovalRow {
  id: string;
  tenant_id: string;
  execution_id: string;
  node_id: string;
  application_id: string | null;
  assigned_to: string | null;
  assigned_role: string | null;
  status: string;
  priority: string;
  decision: string | null;
  decided_by: string | null;
  decided_at: string | null;
  decision_notes: string | null;
  context_snapshot: Record<string, unknown>;
  due_at: string;
  escalate_at: string | null;
  escalated_to: string | null;
  escalated_at: string | null;
  delegated_from: string | null;
  temporal_workflow_id: string | null;
  temporal_signal_name: string | null;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class ApprovalRepository {
  constructor(@Inject(DB_POOL_TOKEN) private readonly pool: DatabasePool) {}

  async save(approval: ApprovalRequest): Promise<void> {
    await this.pool.query(
      `INSERT INTO approval_requests (
         id, tenant_id, execution_id, node_id, application_id,
         assigned_to, assigned_role, status, priority,
         decision, decided_by, decided_at, decision_notes,
         context_snapshot, due_at, escalate_at,
         escalated_to, escalated_at, delegated_from,
         temporal_workflow_id, temporal_signal_name,
         created_at, updated_at
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)`,
      [
        approval.id, approval.tenantId, approval.executionId, approval.nodeId,
        approval.applicationId ?? null,
        approval.assignedTo ?? null, approval.assignedRole ?? null,
        approval.status, approval.priority,
        approval.decision ?? null, approval.decidedBy ?? null,
        approval.decidedAt?.toISOString() ?? null, approval.decisionNotes ?? null,
        JSON.stringify(approval.contextSnapshot),
        approval.dueAt.toISOString(),
        approval.escalateAt?.toISOString() ?? null,
        approval.escalatedTo ?? null,
        approval.escalatedAt?.toISOString() ?? null,
        approval.delegatedFrom ?? null,
        approval.temporalWorkflowId ?? null,
        approval.temporalSignalName ?? null,
        approval.createdAt.toISOString(), approval.updatedAt.toISOString(),
      ]
    );
    logger.debug('Approval request saved', { approvalId: approval.id, executionId: approval.executionId });
  }

  async update(approval: ApprovalRequest): Promise<void> {
    await this.pool.query(
      `UPDATE approval_requests SET
         status = $2, decision = $3, decided_by = $4, decided_at = $5,
         decision_notes = $6, escalated_to = $7, escalated_at = $8,
         updated_at = NOW()
       WHERE id = $1 AND tenant_id = $9`,
      [
        approval.id, approval.status, approval.decision ?? null,
        approval.decidedBy ?? null, approval.decidedAt?.toISOString() ?? null,
        approval.decisionNotes ?? null,
        approval.escalatedTo ?? null, approval.escalatedAt?.toISOString() ?? null,
        approval.tenantId,
      ]
    );
  }

  async findById(approvalId: string, tenantId: string): Promise<ApprovalRequest | null> {
    const { rows } = await this.pool.query<ApprovalRow>(
      'SELECT * FROM approval_requests WHERE id = $1 AND tenant_id = $2',
      [approvalId, tenantId]
    );
    if (!rows[0]) return null;
    return this.hydrate(rows[0]);
  }

  async findByExecution(executionId: string, tenantId: string): Promise<ApprovalRequest[]> {
    const { rows } = await this.pool.query<ApprovalRow>(
      'SELECT * FROM approval_requests WHERE execution_id = $1 AND tenant_id = $2 ORDER BY created_at',
      [executionId, tenantId]
    );
    return rows.map(r => this.hydrate(r));
  }

  async findPendingByTenant(tenantId: string, limit = 50): Promise<ApprovalRequest[]> {
    const { rows } = await this.pool.query<ApprovalRow>(
      `SELECT * FROM approval_requests
       WHERE tenant_id = $1 AND status = 'PENDING'
       ORDER BY priority DESC, due_at ASC LIMIT $2`,
      [tenantId, limit]
    );
    return rows.map(r => this.hydrate(r));
  }

  async expireOverdue(): Promise<number> {
    const { rowCount } = await this.pool.query(
      `UPDATE approval_requests SET status = 'EXPIRED', updated_at = NOW()
       WHERE status = 'PENDING' AND due_at < NOW()`,
      []
    );
    return rowCount ?? 0;
  }

  private hydrate(row: ApprovalRow): ApprovalRequest {
    return new ApprovalRequest({
      id: row.id,
      tenantId: row.tenant_id,
      executionId: row.execution_id,
      nodeId: row.node_id,
      applicationId: row.application_id ?? undefined,
      assignedTo: row.assigned_to ?? undefined,
      assignedRole: row.assigned_role ?? undefined,
      status: row.status as ApprovalStatus,
      priority: row.priority as ApprovalPriority,
      decision: row.decision as never,
      decidedBy: row.decided_by ?? undefined,
      decidedAt: row.decided_at ? new Date(row.decided_at) : undefined,
      decisionNotes: row.decision_notes ?? undefined,
      contextSnapshot: row.context_snapshot,
      dueAt: new Date(row.due_at),
      escalateAt: row.escalate_at ? new Date(row.escalate_at) : undefined,
      escalatedTo: row.escalated_to ?? undefined,
      escalatedAt: row.escalated_at ? new Date(row.escalated_at) : undefined,
      delegatedFrom: row.delegated_from ?? undefined,
      temporalWorkflowId: row.temporal_workflow_id ?? undefined,
      temporalSignalName: row.temporal_signal_name ?? undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }
}

import { prisma, Prisma } from '../prisma.js';
import type { AuditLog } from '../prisma.js';

export type CreateAuditLogInput = {
  tenantId: string;
  loanRequestId?: string;
  workflowRunId?: string;
  eventType: string;
  actorId?: string;
  actorType: string;
  serviceName: string;
  payload?: any;
  traceId?: string;
  spanId?: string;
  correlationId?: string;
  version?: string;
  environment?: string;
  ipAddress?: string;
  userAgent?: string;
  hash: string;
  previousHash?: string;
  signature?: string;
};

export class AuditLogRepository {
  /**
   * Reads from the partitioned audit_logs table.
   * Prisma handles reads over partitioned tables correctly.
   */
  async findByTenantId(tenantId: string, take: number = 50): Promise<AuditLog[]> {
    return prisma.auditLog.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take,
    });
  }

  /**
   * Writes to the partitioned audit_logs table.
   * MUST use raw SQL because Prisma does not fully support partitioned table composite PK insert-and-return logic
   * gracefully when interacting with SQL RULEs (INSTEAD NOTHING on update/delete).
   */
  async create(data: CreateAuditLogInput): Promise<void> {
    const payloadJson = data.payload ? JSON.stringify(data.payload) : '{}';
    
    // We omit returning the record to avoid trigger/rule side-effects in Prisma
    await prisma.$executeRaw`
      INSERT INTO audit_logs (
        tenant_id, loan_request_id, workflow_run_id, event_type, actor_id, actor_type,
        service_name, payload, trace_id, span_id, correlation_id, version,
        environment, ip_address, user_agent, hash, previous_hash, signature
      ) VALUES (
        ${data.tenantId}::uuid, 
        ${data.loanRequestId ? Prisma.sql`${data.loanRequestId}::uuid` : null}, 
        ${data.workflowRunId ? Prisma.sql`${data.workflowRunId}::uuid` : null}, 
        ${data.eventType}, 
        ${data.actorId ? Prisma.sql`${data.actorId}::uuid` : null}, 
        ${data.actorType},
        ${data.serviceName}, 
        ${payloadJson}::jsonb, 
        ${data.traceId}, 
        ${data.spanId}, 
        ${data.correlationId}, 
        ${data.version ?? '1.0'},
        ${data.environment}, 
        ${data.ipAddress ? Prisma.sql`${data.ipAddress}::inet` : null}, 
        ${data.userAgent}, 
        ${data.hash}, 
        ${data.previousHash}, 
        ${data.signature}
      );
    `;
  }
}

export const auditLogRepository = new AuditLogRepository();

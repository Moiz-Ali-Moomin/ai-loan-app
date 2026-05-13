import { createHash, randomUUID } from 'crypto';
import type { AuditRecord, AuditMetadata, DecisionLineage } from '@loan-platform/shared-types';
import { signAuditRecord, verifyAuditSignature } from '@loan-platform/crypto';
import { createLogger } from '@loan-platform/logger';
import { prisma as _prisma, Prisma } from '@loan-platform/database';

const logger = createLogger('audit-service:repository');

type PrismaClient = typeof _prisma;
type PrismaTx = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'>;

function buildHashInput(params: {
  id: string;
  tenantId: string;
  loanRequestId?: string;
  eventType: string;
  actorType: string;
  serviceName: string;
  payload: Record<string, unknown>;
  traceId: string;
  previousHash?: string;
  timestamp: string;
}): string {
  return JSON.stringify({
    id: params.id,
    tenantId: params.tenantId,
    loanRequestId: params.loanRequestId,
    eventType: params.eventType,
    actorType: params.actorType,
    serviceName: params.serviceName,
    payload: params.payload,
    traceId: params.traceId,
    previousHash: params.previousHash,
    timestamp: params.timestamp,
  });
}

export class AuditRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createRecord(params: {
    tenantId: string;
    loanRequestId?: string;
    workflowRunId?: string;
    eventType: string;
    actorId?: string;
    actorType: string;
    serviceName: string;
    payload: Record<string, unknown>;
    metadata: AuditMetadata;
  }): Promise<AuditRecord> {
    const id = randomUUID();
    const timestamp = new Date().toISOString();

    const record = await this.prisma.$transaction(async (tx: PrismaTx) => {
      const prev = await tx.auditLog.findFirst({
        where: { tenantId: params.tenantId },
        orderBy: { createdAt: 'desc' },
        select: { hash: true },
      });
      const previousHash = prev?.hash ?? undefined;

      const hashInput = buildHashInput({
        id,
        tenantId: params.tenantId,
        loanRequestId: params.loanRequestId,
        eventType: params.eventType,
        actorType: params.actorType,
        serviceName: params.serviceName,
        payload: params.payload,
        traceId: params.metadata.traceId,
        previousHash,
        timestamp,
      });

      const hash = createHash('sha256').update(hashInput).digest('hex');

      let signature: string | null = null;
      try {
        signature = signAuditRecord(hashInput);
      } catch {
        logger.warn('AUDIT_HMAC_KEY not set — audit record will not be HMAC-signed');
      }

      return tx.auditLog.create({
        data: {
          id,
          tenantId: params.tenantId,
          loanRequestId: params.loanRequestId ?? null,
          workflowRunId: params.workflowRunId ?? null,
          eventType: params.eventType,
          actorId: params.actorId ?? null,
          actorType: params.actorType,
          serviceName: params.serviceName,
          payload: params.payload as Prisma.InputJsonValue,
          traceId: params.metadata.traceId,
          spanId: params.metadata.spanId ?? null,
          correlationId: params.metadata.correlationId,
          version: params.metadata.version,
          environment: params.metadata.environment,
          hash,
          previousHash: previousHash ?? null,
          signature,
        },
      });
    });

    logger.info('Audit record created', {
      id,
      eventType: params.eventType,
      tenantId: params.tenantId,
      loanRequestId: params.loanRequestId,
      traceId: params.metadata.traceId,
      hmacSigned: record.signature !== null,
    });

    return record as unknown as AuditRecord;
  }

  async getByLoanRequest(loanRequestId: string): Promise<AuditRecord[]> {
    const records = await this.prisma.auditLog.findMany({
      where: { loanRequestId },
      orderBy: { createdAt: 'asc' },
    });
    return records as unknown as AuditRecord[];
  }

  async getDecisionLineage(loanRequestId: string): Promise<DecisionLineage> {
    const auditRecords = await this.prisma.auditLog.findMany({
      where: { loanRequestId },
      orderBy: { createdAt: 'asc' },
    });
    const policyRows = await this.prisma.policyEvaluation.findMany({
      where: { loanRequestId },
      select: { policyPath: true, policyVersion: true, decision: true, evaluatedAt: true },
    });
    const aiRows = await this.prisma.aiDecision.findMany({
      where: { loanRequestId },
      select: { modelVersion: true, promptVersion: true, riskScore: true, recommendation: true, decidedAt: true },
    });
    const approvalRows = await this.prisma.approvalRecord.findMany({
      where: { loanRequestId },
      select: { reviewerId: true, decision: true, completedAt: true },
    });
    const workflowRun = await this.prisma.workflowRun.findFirst({
      where: { loanRequestId },
      select: { id: true },
    });

    const timeline = auditRecords.map((r) => ({
      timestamp: r.createdAt.toISOString(),
      event: r.eventType,
      actor: r.actorType,
      details: r.serviceName,
    }));

    return {
      loanRequestId,
      workflowRunId: workflowRun?.id ?? '',
      events: auditRecords as unknown as AuditRecord[],
      policyVersions: policyRows.map((r) => ({
        policyName: r.policyPath,
        version: r.policyVersion,
        evaluatedAt: r.evaluatedAt.toISOString(),
        decision: r.decision,
      })),
      aiDecisions: aiRows.map((r) => ({
        modelVersion: r.modelVersion,
        promptVersion: r.promptVersion,
        riskScore: Number(r.riskScore),
        recommendation: r.recommendation,
        decidedAt: r.decidedAt.toISOString(),
      })),
      humanApprovals: approvalRows.map((r) => ({
        reviewerId: r.reviewerId ?? '',
        decision: r.decision ?? '',
        decidedAt: r.completedAt?.toISOString() ?? '',
      })),
      timeline,
    };
  }

  async verifyChainIntegrity(loanRequestId: string): Promise<{
    valid: boolean;
    brokenAt?: string;
    hmacValid?: boolean;
    hmacFailedAt?: string;
    totalRecords: number;
  }> {
    const records = await this.prisma.auditLog.findMany({
      where: { loanRequestId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true, hash: true, previousHash: true, signature: true,
        tenantId: true, loanRequestId: true, eventType: true,
        actorType: true, serviceName: true, payload: true,
        traceId: true, createdAt: true,
      },
    });

    let hmacValid = true;
    let hmacFailedAt: string | undefined;

    for (let i = 1; i < records.length; i++) {
      if (records[i].previousHash !== records[i - 1].hash) {
        logger.warn('Audit chain integrity violation', { id: records[i].id, loanRequestId });
        return { valid: false, brokenAt: records[i].id, totalRecords: records.length };
      }
    }

    for (const r of records) {
      if (!r.signature) continue;
      const hashInput = buildHashInput({
        id: r.id,
        tenantId: r.tenantId,
        loanRequestId: r.loanRequestId ?? undefined,
        eventType: r.eventType,
        actorType: r.actorType,
        serviceName: r.serviceName,
        payload: r.payload as Record<string, unknown>,
        traceId: r.traceId ?? '',
        previousHash: r.previousHash ?? undefined,
        timestamp: r.createdAt.toISOString(),
      });

      try {
        if (!verifyAuditSignature(hashInput, r.signature)) {
          hmacValid = false;
          hmacFailedAt = r.id;
          logger.warn('Audit HMAC signature invalid', { id: r.id, loanRequestId });
          break;
        }
      } catch {
        break;
      }
    }

    return { valid: true, hmacValid, hmacFailedAt, totalRecords: records.length };
  }
}

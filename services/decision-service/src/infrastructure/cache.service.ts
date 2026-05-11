import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { createClient, type RedisClientType } from 'redis';
import { createLogger } from '@loan-platform/logger';
import { cacheHitsTotal, cacheMissesTotal } from '../utils/engine-metrics.js';

const logger = createLogger('decision-service:cache');

const FLOW_TTL_SECONDS = 300;      // 5 min — flow snapshots are immutable once published
const DECISION_TTL_SECONDS = 60;   // 1 min — recent decision summaries
const APPROVAL_TTL_SECONDS = 30;   // 30s — approval queue is volatile

@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly client: RedisClientType;
  private connected = false;

  constructor() {
    this.client = createClient({ url: process.env['REDIS_URL'] ?? 'redis://localhost:6379' }) as RedisClientType;
    this.client.on('error', err => logger.error('Redis error', { err }));
    this.client.on('connect', () => { this.connected = true; logger.info('Redis connected'); });
    this.client.on('disconnect', () => { this.connected = false; });
  }

  async connect(): Promise<void> {
    if (!this.connected) await this.client.connect();
  }

  async onModuleDestroy(): Promise<void> {
    if (this.connected) await this.client.disconnect();
  }

  // ─── Flow snapshot cache ───────────────────────────────────────────────────

  async getFlowSnapshot(flowId: string, tenantId: string): Promise<unknown | null> {
    return this.get(`flow_snapshot:${tenantId}:${flowId}`, 'flow_snapshot');
  }

  async setFlowSnapshot(flowId: string, tenantId: string, snapshot: unknown): Promise<void> {
    await this.set(`flow_snapshot:${tenantId}:${flowId}`, snapshot, FLOW_TTL_SECONDS);
  }

  async invalidateFlowSnapshot(flowId: string, tenantId: string): Promise<void> {
    await this.del(`flow_snapshot:${tenantId}:${flowId}`);
  }

  // ─── Flow list cache ───────────────────────────────────────────────────────

  async getFlowList(tenantId: string): Promise<unknown | null> {
    return this.get(`flow_list:${tenantId}`, 'flow_list');
  }

  async setFlowList(tenantId: string, flows: unknown): Promise<void> {
    await this.set(`flow_list:${tenantId}`, flows, 60);
  }

  async invalidateFlowList(tenantId: string): Promise<void> {
    await this.del(`flow_list:${tenantId}`);
  }

  // ─── Decision cache ────────────────────────────────────────────────────────

  async getDecision(decisionId: string, tenantId: string): Promise<unknown | null> {
    return this.get(`decision:${tenantId}:${decisionId}`, 'decision');
  }

  async setDecision(decisionId: string, tenantId: string, decision: unknown): Promise<void> {
    await this.set(`decision:${tenantId}:${decisionId}`, decision, DECISION_TTL_SECONDS);
  }

  // ─── Approval cache ────────────────────────────────────────────────────────

  async getPendingApprovals(tenantId: string): Promise<unknown | null> {
    return this.get(`approvals:pending:${tenantId}`, 'approvals');
  }

  async setPendingApprovals(tenantId: string, approvals: unknown): Promise<void> {
    await this.set(`approvals:pending:${tenantId}`, approvals, APPROVAL_TTL_SECONDS);
  }

  async invalidatePendingApprovals(tenantId: string): Promise<void> {
    await this.del(`approvals:pending:${tenantId}`);
  }

  // ─── Idempotency ───────────────────────────────────────────────────────────

  async setIdempotencyLock(key: string, executionId: string, ttlSeconds = 86400): Promise<boolean> {
    if (!this.connected) return false;
    const result = await this.client.set(
      `idempotency:${key}`, executionId,
      { NX: true, EX: ttlSeconds }
    );
    return result === 'OK';
  }

  async getIdempotencyValue(key: string): Promise<string | null> {
    if (!this.connected) return null;
    return this.client.get(`idempotency:${key}`);
  }

  // ─── Internals ─────────────────────────────────────────────────────────────

  private async get(key: string, cacheType: string): Promise<unknown | null> {
    if (!this.connected) return null;
    try {
      const raw = await this.client.get(key);
      if (raw !== null) {
        cacheHitsTotal.add(1, { cacheType });
        return JSON.parse(raw);
      }
      cacheMissesTotal.add(1, { cacheType });
      return null;
    } catch {
      return null;
    }
  }

  private async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    if (!this.connected) return;
    try {
      await this.client.set(key, JSON.stringify(value), { EX: ttlSeconds });
    } catch (err) {
      logger.error('Cache set failed', { err, key });
    }
  }

  private async del(key: string): Promise<void> {
    if (!this.connected) return;
    await this.client.del(key).catch(() => {});
  }
}

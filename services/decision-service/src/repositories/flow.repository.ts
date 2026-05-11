import { Injectable, Inject } from '@nestjs/common';
import { createHash } from 'crypto';
import { createLogger } from '@loan-platform/logger';
import type { DatabasePool } from '@loan-platform/database';
import { DB_POOL_TOKEN } from './decision.repository.js';
import { DecisionFlow, DecisionNode } from '../domain/decision-flow.entity.js';
import {
  FlowStatus,
  DecisionNodeType,
  type BranchCondition,
  type NodeConfig,
} from '../common/types.js';
import { FlowNotFoundError } from '../common/errors.js';
import type { FlowSnapshot } from '../workflows/decision-graph.activities.js';

const logger = createLogger('decision-service:flow-repository');

interface FlowRow {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  version: string;
  status: string;
  created_by: string;
  updated_by: string | null;
  metadata: Record<string, unknown>;
  tags: string[];
  published_at: string | null;
  deprecated_at: string | null;
  created_at: string;
  updated_at: string;
}

interface NodeRow {
  id: string;
  flow_id: string;
  tenant_id: string;
  name: string;
  type: string;
  config: NodeConfig;
  next_node_id: string | null;
  fallback_node_id: string | null;
  branches: BranchCondition[];
  timeout_ms: number;
  retry_attempts: number;
  retry_delay_ms: number;
  position_x: number;
  position_y: number;
}

@Injectable()
export class FlowRepository {
  constructor(@Inject(DB_POOL_TOKEN) private readonly pool: DatabasePool) {}

  async save(flow: DecisionFlow): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        `INSERT INTO decision_flows (id, tenant_id, name, description, version, status, created_by, updated_by, metadata, tags, published_at, deprecated_at, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
         ON CONFLICT (id) DO UPDATE SET
           status = EXCLUDED.status,
           updated_by = EXCLUDED.updated_by,
           metadata = EXCLUDED.metadata,
           tags = EXCLUDED.tags,
           published_at = EXCLUDED.published_at,
           deprecated_at = EXCLUDED.deprecated_at,
           updated_at = EXCLUDED.updated_at`,
        [
          flow.id, flow.tenantId, flow.name, flow.description ?? null,
          flow.version, flow.status, flow.createdBy, flow.updatedBy ?? null,
          JSON.stringify(flow.metadata), flow.tags,
          flow.publishedAt?.toISOString() ?? null,
          flow.deprecatedAt?.toISOString() ?? null,
          flow.createdAt.toISOString(), flow.updatedAt.toISOString(),
        ]
      );

      // Upsert nodes
      for (const node of flow.nodes) {
        await client.query(
          `INSERT INTO decision_nodes (id, flow_id, tenant_id, name, type, config, next_node_id, fallback_node_id, branches, timeout_ms, retry_attempts, retry_delay_ms, position_x, position_y)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name, type = EXCLUDED.type, config = EXCLUDED.config,
             next_node_id = EXCLUDED.next_node_id, fallback_node_id = EXCLUDED.fallback_node_id,
             branches = EXCLUDED.branches, timeout_ms = EXCLUDED.timeout_ms,
             retry_attempts = EXCLUDED.retry_attempts, retry_delay_ms = EXCLUDED.retry_delay_ms`,
          [
            node.id, flow.id, flow.tenantId, node.name, node.type,
            JSON.stringify(node.config),
            node.nextNodeId ?? null, node.fallbackNodeId ?? null,
            JSON.stringify(node.branches),
            node.timeoutMs, node.retryAttempts, node.retryDelayMs,
            node.positionX, node.positionY,
          ]
        );
      }

      await client.query('COMMIT');
      logger.debug('Flow saved', { flowId: flow.id, nodeCount: flow.nodes.length });
    } catch (err) {
      await client.query('ROLLBACK');
      logger.error('Failed to save flow', { err, flowId: flow.id });
      throw err;
    } finally {
      client.release();
    }
  }

  async publish(flow: DecisionFlow, publishedBy: string): Promise<string> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Serialize the full flow graph as an immutable snapshot
      const snapshotData = flow.serialize();
      const checksum = createHash('sha256').update(JSON.stringify(snapshotData)).digest('hex');

      // Save snapshot
      const { rows: snap } = await client.query<{ id: string }>(
        `INSERT INTO flow_snapshots (flow_id, tenant_id, version, checksum, snapshot, published_by)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
        [flow.id, flow.tenantId, flow.version, checksum, JSON.stringify(snapshotData), publishedBy]
      );
      const snapshotId = snap[0]!.id;

      // Mark flow as PUBLISHED
      await client.query(
        `UPDATE decision_flows SET status = 'PUBLISHED', published_at = NOW(), updated_by = $2, updated_at = NOW()
         WHERE id = $1 AND tenant_id = $3`,
        [flow.id, publishedBy, flow.tenantId]
      );

      await client.query('COMMIT');
      logger.info('Flow published', { flowId: flow.id, snapshotId, version: flow.version });
      return snapshotId;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async findById(id: string, tenantId: string): Promise<DecisionFlow | null> {
    const { rows: flowRows } = await this.pool.query<FlowRow>(
      'SELECT * FROM decision_flows WHERE id = $1 AND tenant_id = $2',
      [id, tenantId]
    );
    if (!flowRows[0]) return null;

    const { rows: nodeRows } = await this.pool.query<NodeRow>(
      'SELECT * FROM decision_nodes WHERE flow_id = $1 AND tenant_id = $2 ORDER BY position_y, position_x',
      [id, tenantId]
    );

    return this.hydrateFlow(flowRows[0], nodeRows);
  }

  async findByTenant(tenantId: string, status?: FlowStatus, limit = 50): Promise<DecisionFlow[]> {
    const conditions = ['tenant_id = $1'];
    const params: unknown[] = [tenantId];
    if (status) { conditions.push(`status = $2`); params.push(status); }

    const { rows: flowRows } = await this.pool.query<FlowRow>(
      `SELECT * FROM decision_flows WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC LIMIT $${params.length + 1}`,
      [...params, limit]
    );

    const flows: DecisionFlow[] = [];
    for (const row of flowRows) {
      const { rows: nodeRows } = await this.pool.query<NodeRow>(
        'SELECT * FROM decision_nodes WHERE flow_id = $1',
        [row.id]
      );
      flows.push(this.hydrateFlow(row, nodeRows));
    }
    return flows;
  }

  async findSnapshotById(snapshotId: string, tenantId: string): Promise<FlowSnapshot | null> {
    const { rows } = await this.pool.query<{ snapshot: FlowSnapshot; id: string; checksum: string }>(
      'SELECT id, snapshot, checksum FROM flow_snapshots WHERE id = $1 AND tenant_id = $2',
      [snapshotId, tenantId]
    );
    if (!rows[0]) return null;
    return this.normalizeSnapshot(rows[0].snapshot, rows[0].id);
  }

  async findLatestSnapshot(flowId: string, tenantId: string): Promise<FlowSnapshot | null> {
    const { rows } = await this.pool.query<{ snapshot: FlowSnapshot; id: string }>(
      `SELECT id, snapshot FROM flow_snapshots WHERE flow_id = $1 AND tenant_id = $2
       ORDER BY published_at DESC LIMIT 1`,
      [flowId, tenantId]
    );
    if (!rows[0]) return null;
    return this.normalizeSnapshot(rows[0].snapshot, rows[0].id);
  }

  private normalizeSnapshot(snapshot: FlowSnapshot, snapshotId: string): FlowSnapshot {
    // The entry node is the START-type node in the snapshot
    const nodes = snapshot.nodes ?? [];
    const entryNode = nodes.find((n: { type: string }) => n.type === 'START');
    return {
      ...snapshot,
      id: snapshotId,
      entryNodeId: entryNode?.id ?? nodes[0]?.id ?? '',
    };
  }

  private hydrateFlow(row: FlowRow, nodeRows: NodeRow[]): DecisionFlow {
    const nodes = nodeRows.map(n => new DecisionNode({
      id: n.id,
      flowId: n.flow_id,
      tenantId: n.tenant_id,
      name: n.name,
      type: n.type as DecisionNodeType,
      config: n.config,
      nextNodeId: n.next_node_id ?? undefined,
      fallbackNodeId: n.fallback_node_id ?? undefined,
      branches: n.branches,
      timeoutMs: n.timeout_ms,
      retryAttempts: n.retry_attempts,
      retryDelayMs: n.retry_delay_ms,
      positionX: n.position_x,
      positionY: n.position_y,
    }));

    return new DecisionFlow({
      id: row.id,
      tenantId: row.tenant_id,
      name: row.name,
      description: row.description ?? undefined,
      version: row.version,
      status: row.status as FlowStatus,
      createdBy: row.created_by,
      updatedBy: row.updated_by ?? undefined,
      metadata: row.metadata,
      tags: row.tags,
      nodes,
      publishedAt: row.published_at ? new Date(row.published_at) : undefined,
      deprecatedAt: row.deprecated_at ? new Date(row.deprecated_at) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }
}

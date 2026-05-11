import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { createLogger } from '@loan-platform/logger';
import { withSpan } from '@loan-platform/telemetry';
import { KafkaTopic } from '@loan-platform/shared-types';
import type { KafkaProducerClient } from '@loan-platform/kafka';
import { DecisionFlow, DecisionNode } from '../../domain/decision-flow.entity.js';
import { FlowRepository } from '../../repositories/flow.repository.js';
import { CacheService } from '../../infrastructure/cache.service.js';
import {
  FlowStatus,
  DecisionNodeType,
  type NodeConfig,
  type BranchCondition,
} from '../../common/types.js';
import {
  FlowNotFoundError,
  ValidationError,
} from '../../common/errors.js';
import { flowPublishTotal } from '../../utils/engine-metrics.js';

const logger = createLogger('decision-service:flow-service');

export interface CreateFlowInput {
  tenantId: string;
  name: string;
  description?: string;
  version?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  createdBy: string;
  nodes: Array<{
    name: string;
    type: DecisionNodeType;
    config: NodeConfig;
    nextNodeId?: string;        // can be a temp ref key resolved after insert
    fallbackNodeId?: string;
    branches?: BranchCondition[];
    timeoutMs?: number;
    retryAttempts?: number;
    retryDelayMs?: number;
    positionX?: number;
    positionY?: number;
  }>;
}

export interface UpdateFlowInput {
  description?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  updatedBy: string;
}

@Injectable()
export class FlowService {
  constructor(
    private readonly flowRepository: FlowRepository,
    private readonly cache: CacheService,
    private readonly kafkaProducer: KafkaProducerClient,
  ) {}

  async createFlow(input: CreateFlowInput): Promise<DecisionFlow> {
    return withSpan('decision-service', 'flows:create', { tenantId: input.tenantId }, async () => {
      this.validateFlowStructure(input.nodes);

      // Assign stable UUIDs and build node objects
      const nodeIdMap = new Map<number, string>();
      const nodes = input.nodes.map((n, idx) => {
        const id = randomUUID();
        nodeIdMap.set(idx, id);
        return { ...n, id };
      });

      // Resolve nextNodeId / fallbackNodeId by index if numeric strings were passed
      const resolvedNodes = nodes.map((n, idx) => {
        const node = DecisionNode.create({
          flowId: '',      // will be set after flow is created
          tenantId: input.tenantId,
          name: n.name,
          type: n.type,
          config: n.config,
          branches: n.branches ?? [],
          timeoutMs: n.timeoutMs ?? 30000,
          retryAttempts: n.retryAttempts ?? 3,
          retryDelayMs: n.retryDelayMs ?? 1000,
          positionX: n.positionX ?? idx * 200,
          positionY: n.positionY ?? 0,
        });
        return node;
      });

      const flow = DecisionFlow.create({
        tenantId: input.tenantId,
        name: input.name,
        description: input.description,
        version: input.version ?? '1.0.0',
        createdBy: input.createdBy,
        tags: input.tags ?? [],
        metadata: input.metadata ?? {},
        nodes: resolvedNodes,
      });

      await this.flowRepository.save(flow);
      await this.cache.invalidateFlowList(input.tenantId);

      logger.info('Flow created', { flowId: flow.id, name: flow.name, nodeCount: resolvedNodes.length });
      return flow;
    });
  }

  async publishFlow(flowId: string, tenantId: string, publishedBy: string): Promise<{ snapshotId: string }> {
    return withSpan('decision-service', 'flows:publish', { flowId, tenantId }, async () => {
      const flow = await this.flowRepository.findById(flowId, tenantId);
      if (!flow) throw new FlowNotFoundError(flowId);

      if (flow.status === FlowStatus.PUBLISHED) {
        throw new ValidationError('Flow is already published');
      }

      flow.publish(publishedBy);
      const snapshotId = await this.flowRepository.publish(flow, publishedBy);

      await this.cache.invalidateFlowSnapshot(flowId, tenantId);
      await this.cache.invalidateFlowList(tenantId);

      flowPublishTotal.add(1, { tenantId });

      // Publish Kafka event for other services to react to new flow versions
      this.kafkaProducer.publish(
        KafkaTopic.FLOW_PUBLISHED,
        'FLOW_PUBLISHED',
        { flowId, snapshotId, version: flow.version, publishedBy, publishedAt: new Date().toISOString() },
        { tenantId, correlationId: randomUUID(), source: 'decision-service', key: flowId }
      ).catch(err => logger.error('Failed to publish FLOW_PUBLISHED event', { err, flowId }));

      logger.info('Flow published', { flowId, snapshotId, version: flow.version });
      return { snapshotId };
    });
  }

  async getFlow(flowId: string, tenantId: string): Promise<DecisionFlow> {
    const flow = await this.flowRepository.findById(flowId, tenantId);
    if (!flow) throw new FlowNotFoundError(flowId);
    return flow;
  }

  async listFlows(tenantId: string, status?: FlowStatus): Promise<DecisionFlow[]> {
    if (!status) {
      const cached = await this.cache.getFlowList(tenantId);
      if (cached) return cached as DecisionFlow[];
    }
    const flows = await this.flowRepository.findByTenant(tenantId, status);
    if (!status) await this.cache.setFlowList(tenantId, flows);
    return flows;
  }

  async deprecateFlow(flowId: string, tenantId: string, deprecatedBy: string): Promise<void> {
    const flow = await this.flowRepository.findById(flowId, tenantId);
    if (!flow) throw new FlowNotFoundError(flowId);
    flow.deprecate(deprecatedBy);
    await this.flowRepository.save(flow);
    await this.cache.invalidateFlowSnapshot(flowId, tenantId);
    await this.cache.invalidateFlowList(tenantId);
  }

  private validateFlowStructure(nodes: CreateFlowInput['nodes']): void {
    const hasStart = nodes.some(n => n.type === DecisionNodeType.START);
    const hasEnd = nodes.some(n => n.type === DecisionNodeType.END);

    if (!hasStart) throw new ValidationError('Flow must have a START node');
    if (!hasEnd) throw new ValidationError('Flow must have an END node');
    if (nodes.length < 2) throw new ValidationError('Flow must have at least 2 nodes');

    const startNodes = nodes.filter(n => n.type === DecisionNodeType.START);
    if (startNodes.length > 1) throw new ValidationError('Flow must have exactly one START node');
  }
}

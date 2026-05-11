import { randomUUID } from 'crypto';
import { FlowStatus, DecisionNodeType, type NodeConfig, type BranchCondition } from '../common/types.js';

export interface DecisionNodeProps {
  id: string;
  flowId: string;
  tenantId: string;
  name: string;
  type: DecisionNodeType;
  config: NodeConfig;
  nextNodeId?: string;
  fallbackNodeId?: string;
  branches: BranchCondition[];
  timeoutMs: number;
  retryAttempts: number;
  retryDelayMs: number;
  positionX: number;
  positionY: number;
}

export class DecisionNode {
  readonly id: string;
  readonly flowId: string;
  readonly tenantId: string;
  readonly name: string;
  readonly type: DecisionNodeType;
  readonly config: NodeConfig;
  readonly nextNodeId?: string;
  readonly fallbackNodeId?: string;
  readonly branches: BranchCondition[];
  readonly timeoutMs: number;
  readonly retryAttempts: number;
  readonly retryDelayMs: number;
  readonly positionX: number;
  readonly positionY: number;

  constructor(props: DecisionNodeProps) {
    this.id = props.id;
    this.flowId = props.flowId;
    this.tenantId = props.tenantId;
    this.name = props.name;
    this.type = props.type;
    this.config = props.config;
    this.nextNodeId = props.nextNodeId;
    this.fallbackNodeId = props.fallbackNodeId;
    this.branches = props.branches;
    this.timeoutMs = props.timeoutMs;
    this.retryAttempts = props.retryAttempts;
    this.retryDelayMs = props.retryDelayMs;
    this.positionX = props.positionX;
    this.positionY = props.positionY;
  }

  isTerminal(): boolean {
    return this.type === DecisionNodeType.END;
  }

  isEntry(): boolean {
    return this.type === DecisionNodeType.START;
  }

  requiresApproval(): boolean {
    return this.type === DecisionNodeType.APPROVAL || this.type === DecisionNodeType.HUMAN_REVIEW;
  }

  static create(props: Omit<DecisionNodeProps, 'id'>): DecisionNode {
    return new DecisionNode({ ...props, id: randomUUID() });
  }
}

export interface DecisionFlowProps {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  version: string;
  status: FlowStatus;
  createdBy: string;
  updatedBy?: string;
  metadata: Record<string, unknown>;
  tags: string[];
  nodes: DecisionNode[];
  publishedAt?: Date;
  deprecatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class DecisionFlow {
  readonly id: string;
  readonly tenantId: string;
  readonly name: string;
  readonly description?: string;
  readonly version: string;
  private _status: FlowStatus;
  readonly createdBy: string;
  private _updatedBy?: string;
  readonly metadata: Record<string, unknown>;
  readonly tags: string[];
  private _nodes: DecisionNode[];
  private _publishedAt?: Date;
  private _deprecatedAt?: Date;
  readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(props: DecisionFlowProps) {
    this.id = props.id;
    this.tenantId = props.tenantId;
    this.name = props.name;
    this.description = props.description;
    this.version = props.version;
    this._status = props.status;
    this.createdBy = props.createdBy;
    this._updatedBy = props.updatedBy;
    this.metadata = props.metadata;
    this.tags = props.tags;
    this._nodes = props.nodes;
    this._publishedAt = props.publishedAt;
    this._deprecatedAt = props.deprecatedAt;
    this.createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get status(): FlowStatus { return this._status; }
  get updatedBy(): string | undefined { return this._updatedBy; }
  get nodes(): DecisionNode[] { return [...this._nodes]; }
  get publishedAt(): Date | undefined { return this._publishedAt; }
  get deprecatedAt(): Date | undefined { return this._deprecatedAt; }
  get updatedAt(): Date { return this._updatedAt; }

  publish(publishedBy: string): void {
    if (this._status === FlowStatus.PUBLISHED) return;
    this.validatePublishable();
    this._status = FlowStatus.PUBLISHED;
    this._publishedAt = new Date();
    this._updatedBy = publishedBy;
    this._updatedAt = new Date();
  }

  deprecate(deprecatedBy: string): void {
    if (this._status !== FlowStatus.PUBLISHED) {
      throw new Error('Only published flows can be deprecated');
    }
    this._status = FlowStatus.DEPRECATED;
    this._deprecatedAt = new Date();
    this._updatedBy = deprecatedBy;
    this._updatedAt = new Date();
  }

  isPublished(): boolean { return this._status === FlowStatus.PUBLISHED; }
  isDraft(): boolean { return this._status === FlowStatus.DRAFT; }

  entryNode(): DecisionNode | undefined {
    return this._nodes.find(n => n.type === DecisionNodeType.START);
  }

  nodeById(id: string): DecisionNode | undefined {
    return this._nodes.find(n => n.id === id);
  }

  serialize(): Record<string, unknown> {
    return {
      id: this.id,
      tenantId: this.tenantId,
      name: this.name,
      version: this.version,
      nodes: this._nodes.map(n => ({
        id: n.id,
        name: n.name,
        type: n.type,
        config: n.config,
        nextNodeId: n.nextNodeId,
        fallbackNodeId: n.fallbackNodeId,
        branches: n.branches,
        timeoutMs: n.timeoutMs,
        retryAttempts: n.retryAttempts,
        retryDelayMs: n.retryDelayMs,
      })),
    };
  }

  private validatePublishable(): void {
    const entry = this.entryNode();
    if (!entry) throw new Error('Flow must have a START node');
    const terminal = this._nodes.find(n => n.type === DecisionNodeType.END);
    if (!terminal) throw new Error('Flow must have an END node');
    if (this._nodes.length < 2) throw new Error('Flow must have at least 2 nodes');
  }

  static create(props: Omit<DecisionFlowProps, 'id' | 'createdAt' | 'updatedAt' | 'status'>): DecisionFlow {
    return new DecisionFlow({
      ...props,
      id: randomUUID(),
      status: FlowStatus.DRAFT,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

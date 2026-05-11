import { randomUUID } from 'crypto';
import {
  ExecutionStatus,
  NodeExecutionStatus,
  type TraceEntry,
  type FinalDecision,
} from '../common/types.js';

export interface NodeExecutionRecord {
  id: string;
  executionId: string;
  tenantId: string;
  nodeId: string;
  nodeType: string;
  nodeName: string;
  status: NodeExecutionStatus;
  input: Record<string, unknown>;
  output?: unknown;
  error?: Record<string, unknown>;
  durationMs?: number;
  retryCount: number;
  startedAt: Date;
  completedAt?: Date;
}

export interface DecisionExecutionProps {
  id: string;
  tenantId: string;
  flowId: string;
  flowSnapshotId?: string;
  applicationId?: string;
  workflowRunId?: string;
  temporalWorkflowId?: string;
  temporalRunId?: string;
  status: ExecutionStatus;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  executionTrace: TraceEntry[];
  finalDecision?: FinalDecision;
  riskScore?: number;
  confidence?: number;
  explanation?: Record<string, unknown>;
  idempotencyKey?: string;
  correlationId: string;
  initiatedBy?: string;
  initiatedByType: 'USER' | 'SYSTEM' | 'WORKFLOW' | 'API';
  startedAt?: Date;
  completedAt?: Date;
  pausedAt?: Date;
  timeoutAt?: Date;
  processingMs?: number;
  createdAt: Date;
}

export class DecisionExecution {
  readonly id: string;
  readonly tenantId: string;
  readonly flowId: string;
  readonly flowSnapshotId?: string;
  readonly applicationId?: string;
  readonly workflowRunId?: string;
  private _temporalWorkflowId?: string;
  private _temporalRunId?: string;
  private _status: ExecutionStatus;
  readonly input: Record<string, unknown>;
  private _output?: Record<string, unknown>;
  private _executionTrace: TraceEntry[];
  private _finalDecision?: FinalDecision;
  private _riskScore?: number;
  private _confidence?: number;
  private _explanation?: Record<string, unknown>;
  readonly idempotencyKey?: string;
  readonly correlationId: string;
  readonly initiatedBy?: string;
  readonly initiatedByType: 'USER' | 'SYSTEM' | 'WORKFLOW' | 'API';
  private _startedAt?: Date;
  private _completedAt?: Date;
  private _pausedAt?: Date;
  readonly timeoutAt?: Date;
  private _processingMs?: number;
  readonly createdAt: Date;

  constructor(props: DecisionExecutionProps) {
    this.id = props.id;
    this.tenantId = props.tenantId;
    this.flowId = props.flowId;
    this.flowSnapshotId = props.flowSnapshotId;
    this.applicationId = props.applicationId;
    this.workflowRunId = props.workflowRunId;
    this._temporalWorkflowId = props.temporalWorkflowId;
    this._temporalRunId = props.temporalRunId;
    this._status = props.status;
    this.input = props.input;
    this._output = props.output;
    this._executionTrace = [...props.executionTrace];
    this._finalDecision = props.finalDecision;
    this._riskScore = props.riskScore;
    this._confidence = props.confidence;
    this._explanation = props.explanation;
    this.idempotencyKey = props.idempotencyKey;
    this.correlationId = props.correlationId;
    this.initiatedBy = props.initiatedBy;
    this.initiatedByType = props.initiatedByType;
    this._startedAt = props.startedAt;
    this._completedAt = props.completedAt;
    this._pausedAt = props.pausedAt;
    this.timeoutAt = props.timeoutAt;
    this._processingMs = props.processingMs;
    this.createdAt = props.createdAt;
  }

  get status(): ExecutionStatus { return this._status; }
  get temporalWorkflowId(): string | undefined { return this._temporalWorkflowId; }
  get temporalRunId(): string | undefined { return this._temporalRunId; }
  get output(): Record<string, unknown> | undefined { return this._output; }
  get executionTrace(): TraceEntry[] { return [...this._executionTrace]; }
  get finalDecision(): FinalDecision | undefined { return this._finalDecision; }
  get riskScore(): number | undefined { return this._riskScore; }
  get confidence(): number | undefined { return this._confidence; }
  get explanation(): Record<string, unknown> | undefined { return this._explanation; }
  get startedAt(): Date | undefined { return this._startedAt; }
  get completedAt(): Date | undefined { return this._completedAt; }
  get pausedAt(): Date | undefined { return this._pausedAt; }
  get processingMs(): number | undefined { return this._processingMs; }

  start(temporalWorkflowId: string, temporalRunId: string): void {
    this._status = ExecutionStatus.RUNNING;
    this._temporalWorkflowId = temporalWorkflowId;
    this._temporalRunId = temporalRunId;
    this._startedAt = new Date();
  }

  pause(): void {
    this._status = ExecutionStatus.PAUSED;
    this._pausedAt = new Date();
  }

  awaitApproval(): void {
    this._status = ExecutionStatus.AWAITING_APPROVAL;
    this._pausedAt = new Date();
  }

  complete(result: {
    output: Record<string, unknown>;
    finalDecision: FinalDecision;
    riskScore: number;
    confidence: number;
    explanation: Record<string, unknown>;
  }): void {
    this._status = ExecutionStatus.COMPLETED;
    this._output = result.output;
    this._finalDecision = result.finalDecision;
    this._riskScore = result.riskScore;
    this._confidence = result.confidence;
    this._explanation = result.explanation;
    this._completedAt = new Date();
    if (this._startedAt) {
      this._processingMs = this._completedAt.getTime() - this._startedAt.getTime();
    }
  }

  fail(error: string): void {
    this._status = ExecutionStatus.FAILED;
    this._completedAt = new Date();
    if (this._startedAt) {
      this._processingMs = this._completedAt.getTime() - this._startedAt.getTime();
    }
    this._output = { error };
  }

  timeout(): void {
    this._status = ExecutionStatus.TIMED_OUT;
    this._completedAt = new Date();
  }

  appendTrace(entry: TraceEntry): void {
    this._executionTrace.push(entry);
  }

  isTerminal(): boolean {
    return [
      ExecutionStatus.COMPLETED,
      ExecutionStatus.FAILED,
      ExecutionStatus.TIMED_OUT,
      ExecutionStatus.CANCELLED,
    ].includes(this._status);
  }

  static create(props: {
    tenantId: string;
    flowId: string;
    flowSnapshotId?: string;
    applicationId?: string;
    workflowRunId?: string;
    input: Record<string, unknown>;
    idempotencyKey?: string;
    correlationId: string;
    initiatedBy?: string;
    initiatedByType: 'USER' | 'SYSTEM' | 'WORKFLOW' | 'API';
    timeoutAt?: Date;
  }): DecisionExecution {
    return new DecisionExecution({
      ...props,
      id: randomUUID(),
      status: ExecutionStatus.PENDING,
      executionTrace: [],
      createdAt: new Date(),
    });
  }
}

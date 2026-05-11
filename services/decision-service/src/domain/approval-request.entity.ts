import { randomUUID } from 'crypto';
import {
  ApprovalStatus,
  ApprovalDecision,
  ApprovalPriority,
} from '../common/types.js';
import { ApprovalAlreadyDecidedError } from '../common/errors.js';

export interface ApprovalRequestProps {
  id: string;
  tenantId: string;
  executionId: string;
  nodeId: string;
  applicationId?: string;
  assignedTo?: string;
  assignedRole?: string;
  status: ApprovalStatus;
  priority: ApprovalPriority;
  decision?: ApprovalDecision;
  decidedBy?: string;
  decidedAt?: Date;
  decisionNotes?: string;
  contextSnapshot: Record<string, unknown>;
  dueAt: Date;
  escalateAt?: Date;
  escalatedTo?: string;
  escalatedAt?: Date;
  delegatedFrom?: string;
  temporalWorkflowId?: string;
  temporalSignalName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ApprovalRequest {
  readonly id: string;
  readonly tenantId: string;
  readonly executionId: string;
  readonly nodeId: string;
  readonly applicationId?: string;
  private _assignedTo?: string;
  private _assignedRole?: string;
  private _status: ApprovalStatus;
  readonly priority: ApprovalPriority;
  private _decision?: ApprovalDecision;
  private _decidedBy?: string;
  private _decidedAt?: Date;
  private _decisionNotes?: string;
  readonly contextSnapshot: Record<string, unknown>;
  readonly dueAt: Date;
  readonly escalateAt?: Date;
  private _escalatedTo?: string;
  private _escalatedAt?: Date;
  readonly delegatedFrom?: string;
  readonly temporalWorkflowId?: string;
  readonly temporalSignalName?: string;
  readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(props: ApprovalRequestProps) {
    this.id = props.id;
    this.tenantId = props.tenantId;
    this.executionId = props.executionId;
    this.nodeId = props.nodeId;
    this.applicationId = props.applicationId;
    this._assignedTo = props.assignedTo;
    this._assignedRole = props.assignedRole;
    this._status = props.status;
    this.priority = props.priority;
    this._decision = props.decision;
    this._decidedBy = props.decidedBy;
    this._decidedAt = props.decidedAt;
    this._decisionNotes = props.decisionNotes;
    this.contextSnapshot = props.contextSnapshot;
    this.dueAt = props.dueAt;
    this.escalateAt = props.escalateAt;
    this._escalatedTo = props.escalatedTo;
    this._escalatedAt = props.escalatedAt;
    this.delegatedFrom = props.delegatedFrom;
    this.temporalWorkflowId = props.temporalWorkflowId;
    this.temporalSignalName = props.temporalSignalName;
    this.createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get status(): ApprovalStatus { return this._status; }
  get assignedTo(): string | undefined { return this._assignedTo; }
  get assignedRole(): string | undefined { return this._assignedRole; }
  get decision(): ApprovalDecision | undefined { return this._decision; }
  get decidedBy(): string | undefined { return this._decidedBy; }
  get decidedAt(): Date | undefined { return this._decidedAt; }
  get decisionNotes(): string | undefined { return this._decisionNotes; }
  get escalatedTo(): string | undefined { return this._escalatedTo; }
  get escalatedAt(): Date | undefined { return this._escalatedAt; }
  get updatedAt(): Date { return this._updatedAt; }

  approve(decidedBy: string, notes?: string): void {
    this.assertPending();
    this._status = ApprovalStatus.APPROVED;
    this._decision = ApprovalDecision.APPROVE;
    this._decidedBy = decidedBy;
    this._decidedAt = new Date();
    this._decisionNotes = notes;
    this._updatedAt = new Date();
  }

  reject(decidedBy: string, notes?: string): void {
    this.assertPending();
    this._status = ApprovalStatus.REJECTED;
    this._decision = ApprovalDecision.REJECT;
    this._decidedBy = decidedBy;
    this._decidedAt = new Date();
    this._decisionNotes = notes;
    this._updatedAt = new Date();
  }

  delegate(to: string, decidedBy: string, notes?: string): void {
    this.assertPending();
    this._status = ApprovalStatus.DELEGATED;
    this._decision = ApprovalDecision.DELEGATE;
    this._decidedBy = decidedBy;
    this._decidedAt = new Date();
    this._decisionNotes = notes;
    this._escalatedTo = to;
    this._escalatedAt = new Date();
    this._updatedAt = new Date();
  }

  expire(): void {
    if (this._status !== ApprovalStatus.PENDING) return;
    this._status = ApprovalStatus.EXPIRED;
    this._updatedAt = new Date();
  }

  isExpired(): boolean {
    return this._status === ApprovalStatus.EXPIRED || new Date() > this.dueAt;
  }

  isTerminal(): boolean {
    return [
      ApprovalStatus.APPROVED,
      ApprovalStatus.REJECTED,
      ApprovalStatus.EXPIRED,
    ].includes(this._status);
  }

  private assertPending(): void {
    if (this._status !== ApprovalStatus.PENDING && this._status !== ApprovalStatus.DELEGATED) {
      throw new ApprovalAlreadyDecidedError(this.id, this._status);
    }
  }

  static create(props: {
    tenantId: string;
    executionId: string;
    nodeId: string;
    applicationId?: string;
    assignedTo?: string;
    assignedRole?: string;
    priority?: ApprovalPriority;
    contextSnapshot: Record<string, unknown>;
    dueDurationMs: number;
    escalateAfterMs?: number;
    temporalWorkflowId?: string;
    temporalSignalName?: string;
  }): ApprovalRequest {
    const now = new Date();
    return new ApprovalRequest({
      ...props,
      id: randomUUID(),
      status: ApprovalStatus.PENDING,
      priority: props.priority ?? ApprovalPriority.NORMAL,
      contextSnapshot: props.contextSnapshot,
      dueAt: new Date(now.getTime() + props.dueDurationMs),
      escalateAt: props.escalateAfterMs
        ? new Date(now.getTime() + props.escalateAfterMs)
        : undefined,
      createdAt: now,
      updatedAt: now,
    });
  }
}

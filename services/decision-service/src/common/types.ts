// ─── Shared domain types for the decision engine ─────────────────────────────

export type TenantId = string;
export type UserId = string;
export type FlowId = string;
export type NodeId = string;
export type ExecutionId = string;

export enum DecisionNodeType {
  START = 'START',
  RULE = 'RULE',
  CONDITION = 'CONDITION',
  AI = 'AI',
  SCORE = 'SCORE',
  APPROVAL = 'APPROVAL',
  ACTION = 'ACTION',
  WEBHOOK = 'WEBHOOK',
  DELAY = 'DELAY',
  HUMAN_REVIEW = 'HUMAN_REVIEW',
  END = 'END',
}

export enum FlowStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  DEPRECATED = 'DEPRECATED',
  ARCHIVED = 'ARCHIVED',
}

export enum ExecutionStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  AWAITING_APPROVAL = 'AWAITING_APPROVAL',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  TIMED_OUT = 'TIMED_OUT',
  CANCELLED = 'CANCELLED',
}

export enum NodeExecutionStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED',
  TIMED_OUT = 'TIMED_OUT',
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
  DELEGATED = 'DELEGATED',
}

export enum ApprovalDecision {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  DELEGATE = 'DELEGATE',
  REQUEST_INFO = 'REQUEST_INFO',
}

export enum ApprovalPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export type FinalDecision = 'APPROVE' | 'REJECT' | 'MANUAL_REVIEW' | 'ESCALATE';

// ─── Role definitions ─────────────────────────────────────────────────────────

export enum UserRole {
  ADMIN = 'admin',
  UNDERWRITER = 'underwriter',
  REVIEWER = 'reviewer',
  AUDITOR = 'auditor',
  ANALYST = 'analyst',
  VIEWER = 'viewer',
}

export interface AuthenticatedUser {
  sub: string;
  tenantId: string;
  role: UserRole;
  email: string;
  iat: number;
  exp: number;
}

// ─── Branch condition types ───────────────────────────────────────────────────

export interface BranchCondition {
  condition: string;      // e.g. "output.riskScore > 0.8"
  nodeId: NodeId;
  label?: string;
}

// ─── Node config shapes per type ─────────────────────────────────────────────

export interface RuleNodeConfig {
  policyPath: string;
  failOnViolation?: boolean;
}

export interface ConditionNodeConfig {
  expression: string;     // evaluated against execution context
  trueBranchNodeId: NodeId;
  falseBranchNodeId: NodeId;
}

export interface AINodeConfig {
  decisionType: 'UNDERWRITING' | 'KYC' | 'AML' | 'REVIEW';
  timeoutMs?: number;
}

export interface ScoreNodeConfig {
  thresholds: {
    APPROVE: number;
    REJECT: number;
  };
}

export interface ApprovalNodeConfig {
  assignedRole: string;
  dueDurationMs: number;
  escalateAfterMs?: number;
  priority?: ApprovalPriority;
}

export interface WebhookNodeConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT';
  headers?: Record<string, string>;
  timeoutMs?: number;
}

export interface DelayNodeConfig {
  delayMs: number;
}

export type NodeConfig =
  | RuleNodeConfig
  | ConditionNodeConfig
  | AINodeConfig
  | ScoreNodeConfig
  | ApprovalNodeConfig
  | WebhookNodeConfig
  | DelayNodeConfig
  | Record<string, unknown>;

// ─── Execution context (passed between nodes) ─────────────────────────────────

export interface ExecutionContext {
  executionId: ExecutionId;
  tenantId: TenantId;
  flowId: FlowId;
  applicationId?: string;
  workflowRunId?: string;
  correlationId: string;
  traceId: string;
  input: Record<string, unknown>;
  // Accumulated outputs from all completed nodes
  nodeOutputs: Record<NodeId, unknown>;
  // Scalar decision state accumulated across nodes
  riskScore?: number;
  confidence?: number;
  finalDecision?: FinalDecision;
  policyOutcomes?: unknown[];
  escalationReasons?: string[];
  // Metadata
  initiatedBy?: string;
  initiatedByType: 'USER' | 'SYSTEM' | 'WORKFLOW' | 'API';
  startedAt: string;
}

// ─── Execution trace entry ────────────────────────────────────────────────────

export interface TraceEntry {
  nodeId: NodeId;
  nodeName: string;
  nodeType: DecisionNodeType;
  status: NodeExecutionStatus;
  durationMs: number;
  startedAt: string;
  completedAt?: string;
  output?: unknown;
  error?: string;
  retryCount: number;
}

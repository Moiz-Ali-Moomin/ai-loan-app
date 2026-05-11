export class DecisionEngineError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly retryable: boolean = false,
  ) {
    super(message);
    this.name = 'DecisionEngineError';
  }
}

export class FlowNotFoundError extends DecisionEngineError {
  constructor(flowId: string) {
    super(`Decision flow not found: ${flowId}`, 'FLOW_NOT_FOUND', false);
  }
}

export class FlowNotPublishedError extends DecisionEngineError {
  constructor(flowId: string) {
    super(`Decision flow is not published: ${flowId}`, 'FLOW_NOT_PUBLISHED', false);
  }
}

export class NodeExecutionError extends DecisionEngineError {
  constructor(nodeId: string, nodeType: string, cause: string, retryable = true) {
    super(`Node ${nodeType}(${nodeId}) failed: ${cause}`, 'NODE_EXECUTION_FAILED', retryable);
  }
}

export class NodeTimeoutError extends DecisionEngineError {
  constructor(nodeId: string, timeoutMs: number) {
    super(`Node ${nodeId} timed out after ${timeoutMs}ms`, 'NODE_TIMEOUT', true);
  }
}

export class ApprovalNotFoundError extends DecisionEngineError {
  constructor(approvalId: string) {
    super(`Approval request not found: ${approvalId}`, 'APPROVAL_NOT_FOUND', false);
  }
}

export class ApprovalAlreadyDecidedError extends DecisionEngineError {
  constructor(approvalId: string, status: string) {
    super(`Approval ${approvalId} already in terminal state: ${status}`, 'APPROVAL_ALREADY_DECIDED', false);
  }
}

export class TenantIsolationError extends DecisionEngineError {
  constructor() {
    super('Resource does not belong to the authenticated tenant', 'TENANT_ISOLATION_VIOLATION', false);
  }
}

export class IdempotencyConflictError extends DecisionEngineError {
  constructor(key: string) {
    super(`Execution with idempotency key already exists: ${key}`, 'IDEMPOTENCY_CONFLICT', false);
  }
}

export class ValidationError extends DecisionEngineError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', false);
  }
}

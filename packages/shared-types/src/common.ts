export type UUID = string;
export type ISOTimestamp = string;
export type TenantId = string;

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  traceId?: string;
}

export interface ResponseMeta {
  traceId: string;
  requestId: string;
  timestamp: ISOTimestamp;
  duration?: number;
}

export interface TraceContext {
  traceId: string;
  spanId: string;
  correlationId: string;
  tenantId?: TenantId;
}

export enum ServiceName {
  API_GATEWAY = 'api-gateway',
  WORKFLOW_SERVICE = 'workflow-service',
  POLICY_SERVICE = 'policy-service',
  AI_EXECUTION_SERVICE = 'ai-execution-service',
  AUDIT_SERVICE = 'audit-service',
  EVENT_CONSUMER = 'event-consumer',
  FRONTEND = 'frontend',
}

import pino from 'pino';
import { trace } from '@opentelemetry/api';

export interface LogContext {
  traceId?: string;
  spanId?: string;
  correlationId?: string;
  tenantId?: string;
  loanRequestId?: string;
  workflowRunId?: string;
  service?: string;
  [key: string]: unknown;
}

function getTraceContext(): { traceId?: string; spanId?: string } {
  const span = trace.getActiveSpan();
  if (!span) return {};
  const ctx = span.spanContext();
  return {
    traceId: ctx.traceId,
    spanId: ctx.spanId,
  };
}

function createLogger(serviceName: string) {
  const isDev = process.env['NODE_ENV'] === 'development';

  const base = pino({
    level: process.env['LOG_LEVEL'] ?? 'info',
    base: { service: serviceName },
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level(label) {
        return { level: label.toUpperCase() };
      },
    },
    ...(isDev && {
      transport: {
        target: 'pino-pretty',
        options: { colorize: true, singleLine: false },
      },
    }),
  });

  return {
    info(msg: string, ctx?: LogContext): void {
      base.info({ ...getTraceContext(), ...ctx }, msg);
    },
    warn(msg: string, ctx?: LogContext): void {
      base.warn({ ...getTraceContext(), ...ctx }, msg);
    },
    error(msg: string, ctx?: LogContext & { err?: unknown }): void {
      base.error({ ...getTraceContext(), ...ctx }, msg);
    },
    debug(msg: string, ctx?: LogContext): void {
      base.debug({ ...getTraceContext(), ...ctx }, msg);
    },
    fatal(msg: string, ctx?: LogContext): void {
      base.fatal({ ...getTraceContext(), ...ctx }, msg);
    },
    child(ctx: LogContext) {
      return createChildLogger(base, ctx);
    },
  };
}

function createChildLogger(parent: pino.Logger, ctx: LogContext) {
  const child = parent.child(ctx);
  return {
    info: (msg: string, extra?: LogContext) => child.info({ ...getTraceContext(), ...extra }, msg),
    warn: (msg: string, extra?: LogContext) => child.warn({ ...getTraceContext(), ...extra }, msg),
    error: (msg: string, extra?: LogContext & { err?: unknown }) => child.error({ ...getTraceContext(), ...extra }, msg),
    debug: (msg: string, extra?: LogContext) => child.debug({ ...getTraceContext(), ...extra }, msg),
    fatal: (msg: string, extra?: LogContext) => child.fatal({ ...getTraceContext(), ...extra }, msg),
    child: (newCtx: LogContext) => createChildLogger(child, newCtx),
  };
}

export { createLogger };
export type Logger = ReturnType<typeof createLogger>;

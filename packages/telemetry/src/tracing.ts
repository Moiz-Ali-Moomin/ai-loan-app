import { trace, context, propagation, SpanStatusCode, SpanKind } from '@opentelemetry/api';
import type { Span, Context, Attributes } from '@opentelemetry/api';
import type { SpanOptions } from './types.js';

export function createSpan(tracerName: string, options: SpanOptions): Span {
  const tracer = trace.getTracer(tracerName);
  return tracer.startSpan(options.name, {
    kind: SpanKind.INTERNAL,
    attributes: options.attributes as Attributes,
  });
}

export async function withSpan<T>(
  tracerName: string,
  spanName: string,
  attributes: Record<string, string | number | boolean>,
  fn: (span: Span) => Promise<T>
): Promise<T> {
  const tracer = trace.getTracer(tracerName);
  return tracer.startActiveSpan(spanName, { attributes: attributes as Attributes }, async (span) => {
    try {
      const result = await fn(span);
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      span.recordException(error instanceof Error ? error : new Error(String(error)));
      throw error;
    } finally {
      span.end();
    }
  });
}

export function getActiveSpan(): Span | undefined {
  return trace.getActiveSpan();
}

export function injectTraceHeaders(headers: Record<string, string>): void {
  propagation.inject(context.active(), headers);
}

export function extractTraceContext(headers: Record<string, string>): Context {
  return propagation.extract(context.active(), headers);
}

export function addSpanAttributes(attributes: Record<string, string | number | boolean>): void {
  const span = trace.getActiveSpan();
  if (span) {
    span.setAttributes(attributes as Attributes);
  }
}

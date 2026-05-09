import type { FastifyRequest, FastifyReply } from 'fastify';
import type { Logger } from '@loan-platform/logger';

export interface JwtPayload {
  sub: string;
  tenantId: string;
  role: string;
  email: string;
  iat: number;
  exp: number;
}

export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    await request.jwtVerify();
  } catch {
    await reply.status(401).send({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
        traceId: request.id,
      },
    });
  }
}

export function requireRole(roles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const user = request.user as JwtPayload | undefined;
    if (!user || !roles.includes(user.role)) {
      await reply.status(403).send({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions',
          traceId: request.id,
        },
      });
    }
  };
}

export function injectTraceContext(logger: Logger) {
  return async (request: FastifyRequest): Promise<void> => {
    const traceId = (request.headers['x-trace-id'] as string) ?? request.id;
    const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

    request.headers['x-trace-id'] = traceId;
    request.headers['x-correlation-id'] = correlationId;

    logger.debug('Trace context injected', { traceId, correlationId });
  };
}

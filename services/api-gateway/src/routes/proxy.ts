/**
 * Thin proxy routes that forward requests from the API Gateway to
 * downstream services. This keeps a single origin for the frontend.
 */
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import axios from 'axios';
import { requireAuth } from '../middleware/auth.js';
import { config } from '../config/index.js';

async function forward(
  upstreamBase: string,
  path: string,
  method: string,
  body: unknown,
  headers: Record<string, string>
): Promise<unknown> {
  const response = await axios.request({
    method: method as 'GET' | 'POST',
    url: `${upstreamBase}${path}`,
    data: method !== 'GET' ? body : undefined,
    params: method === 'GET' && body ? body : undefined,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    timeout: 15_000,
  });
  return response.data;
}

export default async function proxyRoutes(fastify: FastifyInstance) {
  // ── AI Service Proxy ─────────────────────────────────────────

  fastify.get(
    '/ai/decisions',
    { preHandler: [requireAuth] },
    async (request: FastifyRequest<{ Querystring: { limit?: number } }>, reply: FastifyReply) => {
      const data = await forward(config.services.ai, '/api/v1/ai/decisions', 'GET', request.query, proxyHeaders(request));
      return reply.send(data);
    }
  );

  fastify.get(
    '/ai/decisions/:loanRequestId',
    { preHandler: [requireAuth] },
    async (request: FastifyRequest<{ Params: { loanRequestId: string } }>, reply: FastifyReply) => {
      const data = await forward(config.services.ai, `/api/v1/ai/decisions/${request.params.loanRequestId}`, 'GET', undefined, proxyHeaders(request));
      return reply.send(data);
    }
  );

  // ── Audit Service Proxy ──────────────────────────────────────

  fastify.get(
    '/audit/activity',
    { preHandler: [requireAuth] },
    async (request: FastifyRequest<{ Querystring: { limit?: number; tenantId?: string } }>, reply: FastifyReply) => {
      const data = await forward(config.services.audit, '/api/v1/audit/activity', 'GET', request.query, proxyHeaders(request));
      return reply.send(data);
    }
  );

  fastify.get(
    '/audit/loans/:loanRequestId',
    { preHandler: [requireAuth] },
    async (request: FastifyRequest<{ Params: { loanRequestId: string } }>, reply: FastifyReply) => {
      const data = await forward(config.services.audit, `/api/v1/audit/loans/${request.params.loanRequestId}`, 'GET', undefined, proxyHeaders(request));
      return reply.send(data);
    }
  );

  fastify.get(
    '/audit/loans/:loanRequestId/lineage',
    { preHandler: [requireAuth] },
    async (request: FastifyRequest<{ Params: { loanRequestId: string } }>, reply: FastifyReply) => {
      const data = await forward(config.services.audit, `/api/v1/audit/loans/${request.params.loanRequestId}/lineage`, 'GET', undefined, proxyHeaders(request));
      return reply.send(data);
    }
  );

  fastify.get(
    '/audit/loans/:loanRequestId/integrity',
    { preHandler: [requireAuth] },
    async (request: FastifyRequest<{ Params: { loanRequestId: string } }>, reply: FastifyReply) => {
      const data = await forward(config.services.audit, `/api/v1/audit/loans/${request.params.loanRequestId}/integrity`, 'GET', undefined, proxyHeaders(request));
      return reply.send(data);
    }
  );

  // ── Policy Service Proxy ─────────────────────────────────────

  fastify.get(
    '/policies/evaluations',
    { preHandler: [requireAuth] },
    async (request: FastifyRequest<{ Querystring: { limit?: number } }>, reply: FastifyReply) => {
      const data = await forward(config.services.policy, '/api/v1/policies/evaluations', 'GET', request.query, proxyHeaders(request));
      return reply.send(data);
    }
  );

  fastify.get(
    '/policies/versions',
    { preHandler: [requireAuth] },
    async (request: FastifyRequest<{ Querystring: { name?: string; active?: string } }>, reply: FastifyReply) => {
      const data = await forward(config.services.policy, '/api/v1/policies/versions', 'GET', request.query, proxyHeaders(request));
      return reply.send(data);
    }
  );
}

function proxyHeaders(request: FastifyRequest): Record<string, string> {
  return {
    'X-Trace-Id': (request.headers['x-trace-id'] as string) ?? request.id,
    'X-Correlation-Id': (request.headers['x-correlation-id'] as string) ?? request.id,
  };
}

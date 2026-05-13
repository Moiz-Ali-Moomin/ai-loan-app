import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { compare } from 'bcryptjs';
import { createLogger } from '@loan-platform/logger';

const logger = createLogger('api-gateway:auth');

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  // Accept either a tenant UUID or a slug (e.g. "default")
  tenantId: z.string().min(1),
});

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post(
    '/auth/login',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { email, password, tenantId } = LoginSchema.parse(request.body);
      const prisma = fastify.prisma;

      // Resolve tenant — accept UUID or slug
      const tenant = await prisma.tenant.findFirst({
        where: UUID_RE.test(tenantId) ? { id: tenantId } : { slug: tenantId },
        select: { id: true },
      });

      if (!tenant) {
        return reply.status(401).send({
          success: false,
          error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
        });
      }

      const user = await prisma.user.findFirst({
        where: { email, tenantId: tenant.id, isActive: true },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          tenantId: true,
          passwordHash: true,
        },
      });

      if (!user) {
        return reply.status(401).send({
          success: false,
          error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
        });
      }

      // Timing-safe comparison — always run even if hash is absent to prevent user enumeration
      const hash = user.passwordHash ?? '';
      const valid = hash.length > 0 && await compare(password, hash);
      if (!valid) {
        return reply.status(401).send({
          success: false,
          error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
        });
      }

      const token = fastify.jwt.sign({
        sub: user.id,
        tenantId: user.tenantId,
        role: user.role,
        email: user.email,
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      logger.info('User logged in', { userId: user.id, tenantId: tenant.id, email });

      return reply.send({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            tenantId: user.tenantId,
          },
        },
      });
    }
  );

  fastify.get(
    '/auth/me',
    { preHandler: [async (req, rep) => { try { await req.jwtVerify(); } catch { await rep.status(401).send({ success: false }); } }] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      return reply.send({ success: true, data: request.user });
    }
  );
}

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { compare } from 'bcryptjs';
import { createLogger } from '@loan-platform/logger';

const logger = createLogger('api-gateway:auth');

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  tenantId: z.string().uuid(),
});

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post(
    '/auth/login',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { email, password, tenantId } = LoginSchema.parse(request.body);
      const pool = fastify.pg;

      const { rows } = await pool.query(
        `SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.tenant_id,
                u.password_hash, t.slug as tenant_slug
         FROM users u JOIN tenants t ON t.id = u.tenant_id
         WHERE u.email = $1 AND u.tenant_id = $2 AND u.is_active = true`,
        [email, tenantId]
      );

      if (rows.length === 0) {
        return reply.status(401).send({
          success: false,
          error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
        });
      }

      const user = rows[0];

      // Timing-safe bcrypt comparison — always compare even if hash is absent
      // to prevent user enumeration via timing differences.
      const passwordHash: string = user.password_hash ?? '';
      const passwordValid = passwordHash.length > 0 && await compare(password, passwordHash);
      if (!passwordValid) {
        return reply.status(401).send({
          success: false,
          error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
        });
      }

      const token = fastify.jwt.sign({
        sub: user.id,
        tenantId: user.tenant_id,
        role: user.role,
        email: user.email,
      });

      await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

      logger.info('User logged in', { userId: user.id, tenantId, email });

      return reply.send({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role,
            tenantId: user.tenant_id,
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

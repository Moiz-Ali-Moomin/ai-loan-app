import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { prisma } from '@loan-platform/database';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: typeof prisma;
  }
}

const prismaPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorate('prisma', prisma);

  fastify.addHook('onClose', async (instance) => {
    instance.log.info('Disconnecting Prisma Client');
    await instance.prisma.$disconnect();
  });
};

export default fp(prismaPlugin, {
  name: 'prisma-plugin',
});

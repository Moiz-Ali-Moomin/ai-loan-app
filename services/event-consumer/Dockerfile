FROM node:20-bookworm-slim AS base
WORKDIR /app

FROM base AS deps
COPY package.json turbo.json ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/telemetry/package.json ./packages/telemetry/
COPY packages/logger/package.json ./packages/logger/
COPY packages/database/package.json ./packages/database/
COPY packages/kafka/package.json ./packages/kafka/
COPY packages/crypto/package.json ./packages/crypto/
COPY services/event-consumer/package.json ./services/event-consumer/
RUN npm install --workspaces --include-workspace-root

FROM base AS builder
COPY package.json ./
COPY turbo.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY tsconfig.base.json ./
COPY packages ./packages
COPY services/event-consumer ./services/event-consumer
RUN npm run build -w packages/shared-types && npm run build -w packages/telemetry && npm run build -w packages/logger && npm run build -w packages/database && npm run build -w packages/kafka && npm run build -w services/event-consumer

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nodeapp
COPY --from=builder --chown=nodeapp:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodeapp:nodejs /app/packages ./packages
COPY --from=builder --chown=nodeapp:nodejs /app/services/event-consumer/dist ./services/event-consumer/dist
COPY --from=builder --chown=nodeapp:nodejs /app/services/event-consumer/package.json ./services/event-consumer/
USER nodeapp
EXPOSE 3005
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=5 \
  CMD node -e "require('http').get('http://localhost:3005/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"
CMD ["node", "services/event-consumer/dist/consumer.js"]

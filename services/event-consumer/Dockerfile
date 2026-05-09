FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

FROM base AS deps
COPY package.json turbo.json ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/telemetry/package.json ./packages/telemetry/
COPY packages/logger/package.json ./packages/logger/
COPY packages/database/package.json ./packages/database/
COPY packages/kafka/package.json ./packages/kafka/
COPY services/event-consumer/package.json ./services/event-consumer/
RUN npm install --workspaces --include-workspace-root

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY tsconfig.base.json ./
COPY packages ./packages
COPY services/event-consumer ./services/event-consumer
RUN npm run build -w packages/shared-types && npm run build -w packages/telemetry && npm run build -w packages/logger && npm run build -w packages/database && npm run build -w packages/kafka && npm run build -w services/event-consumer

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nodeapp
COPY --from=builder --chown=nodeapp:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodeapp:nodejs /app/packages ./packages
COPY --from=builder --chown=nodeapp:nodejs /app/services/event-consumer/dist ./services/event-consumer/dist
COPY --from=builder --chown=nodeapp:nodejs /app/services/event-consumer/package.json ./services/event-consumer/
USER nodeapp
EXPOSE 3005
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3005/health || exit 1
CMD ["node", "services/event-consumer/dist/consumer.js"]

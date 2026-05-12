FROM node:20-bookworm-slim AS base
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

FROM base AS deps
COPY package.json turbo.json ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/telemetry/package.json ./packages/telemetry/
COPY packages/logger/package.json ./packages/logger/
COPY packages/database/package.json ./packages/database/
COPY packages/kafka/package.json ./packages/kafka/
COPY services/workflow-service/package.json ./services/workflow-service/
RUN npm install --workspaces --include-workspace-root

FROM base AS builder
COPY package.json ./
COPY turbo.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY tsconfig.base.json ./
COPY packages ./packages
COPY services/workflow-service ./services/workflow-service
RUN npm run build -w packages/shared-types && \
    npm run build -w packages/telemetry && \
    npm run build -w packages/logger && \
    npm run build -w packages/database && \
    npm run build -w packages/kafka && \
    npm run build -w services/workflow-service

FROM node:20-bookworm-slim AS runner
ENV NODE_ENV=production
WORKDIR /app
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nodeapp
COPY --from=builder --chown=nodeapp:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodeapp:nodejs /app/packages ./packages
COPY --from=builder --chown=nodeapp:nodejs /app/services/workflow-service/dist ./services/workflow-service/dist
COPY --from=builder --chown=nodeapp:nodejs /app/services/workflow-service/package.json ./services/workflow-service/
COPY --chown=nodeapp:nodejs services/workflow-service/start.sh ./services/workflow-service/start.sh
RUN chmod +x ./services/workflow-service/start.sh
USER nodeapp
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
  CMD node --input-type=commonjs -e "require('http').get('http://localhost:3001/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"
CMD ["/bin/sh", "services/workflow-service/start.sh"]

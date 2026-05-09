FROM node:20-bookworm-slim AS base
WORKDIR /app

FROM base AS deps
COPY package.json turbo.json ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/telemetry/package.json ./packages/telemetry/
COPY packages/logger/package.json ./packages/logger/
COPY packages/database/package.json ./packages/database/
COPY packages/kafka/package.json ./packages/kafka/
COPY services/policy-service/package.json ./services/policy-service/
RUN npm install --workspaces --include-workspace-root

FROM base AS builder
COPY package.json ./
COPY turbo.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY tsconfig.base.json ./
COPY packages ./packages
COPY services/policy-service ./services/policy-service
RUN npm run build -w packages/shared-types && npm run build -w packages/telemetry && npm run build -w packages/logger && npm run build -w packages/database && npm run build -w packages/kafka && npm run build -w services/policy-service

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nodeapp
COPY --from=builder --chown=nodeapp:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodeapp:nodejs /app/packages ./packages
COPY --from=builder --chown=nodeapp:nodejs /app/services/policy-service/dist ./services/policy-service/dist
COPY --from=builder --chown=nodeapp:nodejs /app/services/policy-service/package.json ./services/policy-service/
USER nodeapp
EXPOSE 3002
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3002/health || exit 1
CMD ["node", "services/policy-service/dist/server.js"]

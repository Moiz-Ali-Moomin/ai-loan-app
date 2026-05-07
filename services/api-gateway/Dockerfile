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
COPY services/api-gateway/package.json ./services/api-gateway/
RUN npm install --workspaces --include-workspace-root

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY tsconfig.base.json ./
COPY packages ./packages
COPY services/api-gateway ./services/api-gateway
RUN npm run build -w packages/shared-types
RUN npm run build -w packages/telemetry
RUN npm run build -w packages/logger
RUN npm run build -w packages/database
RUN npm run build -w packages/kafka
RUN npm run build -w services/api-gateway

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nodeapp
COPY --from=builder --chown=nodeapp:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodeapp:nodejs /app/packages ./packages
COPY --from=builder --chown=nodeapp:nodejs /app/services/api-gateway/dist ./services/api-gateway/dist
COPY --from=builder --chown=nodeapp:nodejs /app/services/api-gateway/package.json ./services/api-gateway/
USER nodeapp
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/health || exit 1
CMD ["node", "services/api-gateway/dist/server.js"]

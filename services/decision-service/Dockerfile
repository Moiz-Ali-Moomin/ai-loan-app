FROM node:20-bookworm-slim AS base
WORKDIR /app

FROM base AS deps
COPY package.json turbo.json ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/telemetry/package.json ./packages/telemetry/
COPY packages/logger/package.json ./packages/logger/
COPY packages/database/package.json ./packages/database/
COPY packages/kafka/package.json ./packages/kafka/
COPY services/decision-service/package.json ./services/decision-service/
RUN npm install --workspaces --include-workspace-root

FROM base AS builder
COPY package.json ./
COPY turbo.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY tsconfig.base.json ./
COPY packages ./packages
COPY services/decision-service ./services/decision-service
RUN npm run build -w packages/shared-types
RUN npm run build -w packages/telemetry
RUN npm run build -w packages/logger
RUN npm run build -w packages/database
RUN npm run build -w packages/kafka
WORKDIR /app/services/decision-service
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nodeapp
COPY --from=builder --chown=nodeapp:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodeapp:nodejs /app/packages ./packages
COPY --from=builder --chown=nodeapp:nodejs /app/services/decision-service/dist ./services/decision-service/dist
COPY --from=builder --chown=nodeapp:nodejs /app/services/decision-service/package.json ./services/decision-service/
USER nodeapp
EXPOSE 3007
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node --input-type=commonjs -e "require('http').get('http://localhost:3007/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"
CMD ["node", "services/decision-service/dist/main.js"]

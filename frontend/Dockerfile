FROM node:22-alpine AS base
WORKDIR /app

# ── deps: install production + dev dependencies ──────────────────────────────
FROM base AS deps
COPY package.json ./
RUN npm install

# ── dev: bake config files in; src is mounted at runtime ─────────────────────
FROM deps AS dev
COPY next.config.js tsconfig.json postcss.config.js tailwind.config.ts ./
EXPOSE 3000
CMD ["npx", "next", "dev", "-p", "3000"]

# ── builder: full production build ───────────────────────────────────────────
FROM deps AS builder
COPY . ./
RUN npm run build

# ── runner: minimal production image ─────────────────────────────────────────
FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --quiet --tries=1 --server-response --spider http://localhost:3000/dashboard 2>&1 | grep -qE "HTTP/1\.[01] [23]" || exit 1

ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]

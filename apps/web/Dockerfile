FROM node:22-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json* ./
COPY apps/web/package.json ./apps/web/
COPY packages/db/package.json ./packages/db/
COPY packages/epg-core/package.json ./packages/epg-core/
COPY packages/epg-sources/package.json ./packages/epg-sources/
COPY packages/analytics/package.json ./packages/analytics/
COPY packages/m3u-matcher/package.json ./packages/m3u-matcher/
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build -w @freeepg/db
RUN npm run build -w @freeepg/epg-core
RUN npm run build -w @freeepg/epg-sources
RUN npm run build -w @freeepg/analytics
RUN npm run build -w @freeepg/m3u-matcher
RUN npm run build -w @freeepg/web

FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/packages/db/drizzle ./packages/db/drizzle
COPY apps/web/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
RUN mkdir -p /data/epg && chown nextjs:nodejs /data/epg
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "apps/web/server.js"]

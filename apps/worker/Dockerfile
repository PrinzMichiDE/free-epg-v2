FROM node:22-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json* ./
COPY apps/worker/package.json ./apps/worker/
COPY packages/db/package.json ./packages/db/
COPY packages/epg-core/package.json ./packages/epg-core/
COPY packages/epg-sources/package.json ./packages/epg-sources/
COPY packages/analytics/package.json ./packages/analytics/
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build -w @freeepg/db
RUN npm run build -w @freeepg/epg-core
RUN npm run build -w @freeepg/epg-sources
RUN npm run build -w @freeepg/analytics
RUN npm run build -w @freeepg/worker

FROM base AS runner
ENV NODE_ENV=production
RUN mkdir -p /data/epg
COPY --from=builder /app/apps/worker/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
WORKDIR /app
CMD ["node", "dist/index.js"]

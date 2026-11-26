# API (and, from M1, worker) image (AD §12.3). Build from the repo root:
#   docker build -f apps/api/Dockerfile -t skipa-api .
# The workspace layout is kept (apps/api + the packages it imports as .ts source) because Node's
# type stripping does not run on files under node_modules (ADR-33), which `pnpm deploy` would create.
# App files stay owned by root: the `node` user can read them but not change them. The only
# writable place is FILES_DIR, mounted as a volume.

FROM node:24-bookworm-slim AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc* ./
COPY apps/api/package.json apps/api/
COPY packages/contracts/package.json packages/contracts/
COPY packages/domain/package.json packages/domain/
COPY packages/config/package.json packages/config/
RUN pnpm install --prod --frozen-lockfile --filter @skipa/api... --ignore-scripts

FROM node:24-bookworm-slim AS source
WORKDIR /app
COPY package.json ./
COPY apps/api/package.json apps/api/
COPY apps/api/src apps/api/src
COPY apps/api/scripts/db-migrate.ts apps/api/scripts/db-seed.ts apps/api/scripts/
COPY db/migrations db/migrations
COPY packages/contracts/package.json packages/contracts/
COPY packages/contracts/src packages/contracts/src
COPY packages/domain/package.json packages/domain/
COPY packages/domain/src packages/domain/src
RUN find . -name '*.test.ts' -delete

FROM node:24-bookworm-slim
RUN apt-get update \
 && apt-get install -y --no-install-recommends tini \
 && rm -rf /var/lib/apt/lists/* \
 && rm -rf /usr/local/lib/node_modules /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack \
 && mkdir -p /srv/skipa/files && chown node:node /srv/skipa/files
WORKDIR /app
ENV NODE_ENV=production TZ=UTC FILES_DIR=/srv/skipa/files
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages/contracts/node_modules ./packages/contracts/node_modules
COPY --from=source /app ./
USER node
EXPOSE 4000
HEALTHCHECK --interval=15s --timeout=3s --start-period=20s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:4000/health/live').then((r) => process.exit(r.ok ? 0 : 1), () => process.exit(1))"]
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "apps/api/src/server.ts"]

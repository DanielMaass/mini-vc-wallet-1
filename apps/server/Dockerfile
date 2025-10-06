# --- Base dependencies stage ---
FROM node:22-alpine AS deps
WORKDIR /workspace
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY tsconfig.base.json ./
RUN pnpm fetch
COPY apps/server/package.json apps/server/package.json
COPY apps/client/package.json apps/client/package.json
COPY packages/trpc/package.json packages/trpc/package.json
COPY packages/contracts/package.json packages/contracts/package.json
RUN pnpm install --prod=false

# --- Build stage ---
FROM node:22-alpine AS build
WORKDIR /workspace
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
ENV NODE_ENV=production
COPY --from=deps /workspace/node_modules ./node_modules
COPY . .
# Build shared workspace libs and then the server package
RUN pnpm --filter @mini-vc-wallet-1/trpc run build \
	&& pnpm --filter @mini-vc-wallet-1/contracts run build \
	&& pnpm --filter @server/app run build
## Prepare a production deployable bundle for the server
RUN pnpm deploy --legacy --filter @server/app --prod /tmp/deploy \
	&& mkdir -p /tmp/deploy/dist \
	&& cp -r apps/server/dist/* /tmp/deploy/dist/

# --- Production runtime ---
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=build /tmp/deploy/ .
EXPOSE 3000
CMD ["node","dist/main.js"]

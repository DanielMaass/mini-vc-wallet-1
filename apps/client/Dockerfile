# --- Build stage ---
FROM node:22-alpine AS build
WORKDIR /workspace
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY tsconfig.base.json ./
RUN corepack enable && pnpm fetch
COPY apps/client/package.json apps/client/package.json
COPY apps/server/package.json apps/server/package.json
COPY packages/trpc/package.json packages/trpc/package.json
COPY packages/contracts/package.json packages/contracts/package.json
RUN pnpm install --prod=false
COPY . .
# Build shared workspace libs and server (for AppRouter d.ts), then the client
RUN pnpm --filter @mini-vc-wallet-1/trpc run build \
	&& pnpm --filter @mini-vc-wallet-1/contracts run build \
	&& pnpm --filter @server/app run build \
	&& pnpm --filter @client/app run build

# --- Nginx serve stage ---
FROM nginx:1.27-alpine AS runner
COPY --from=build /workspace/apps/client/dist /usr/share/nginx/html
COPY apps/client/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx","-g","daemon off;"]

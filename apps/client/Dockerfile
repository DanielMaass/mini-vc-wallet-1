# --- Build stage ---
FROM node:22-alpine AS build
WORKDIR /workspace
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY tsconfig.base.json ./
RUN corepack enable && pnpm fetch
COPY apps/client/package.json apps/client/package.json
RUN pnpm install --filter client... --prod=false
COPY . .
RUN pnpm --filter client build

# --- Nginx serve stage ---
FROM nginx:1.27-alpine AS runner
COPY --from=build /workspace/apps/client/dist /usr/share/nginx/html
COPY apps/client/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx","-g","daemon off;"]

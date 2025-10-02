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
RUN pnpm install --filter server... --prod=false

# --- Build stage ---
FROM node:22-alpine AS build
WORKDIR /workspace
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
ENV NODE_ENV=production
COPY --from=deps /workspace/node_modules ./node_modules
COPY . .
# Build only the server package
RUN pnpm --filter server build

# --- Production runtime ---
FROM node:22-alpine AS runner
WORKDIR /app
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=build /workspace/apps/server/dist ./dist
COPY apps/server/package.json ./package.json
RUN pnpm install --prod --ignore-scripts
EXPOSE 3000
CMD ["node","dist/main.js"]

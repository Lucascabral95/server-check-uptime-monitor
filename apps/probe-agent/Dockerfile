FROM node:22-alpine AS build

WORKDIR /workspace

COPY package.json package-lock.json ./
COPY apps/backend-uptime/package.json ./apps/backend-uptime/package.json
COPY apps/probe-agent/package.json ./apps/probe-agent/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/contracts/package.json ./packages/contracts/package.json

RUN npm ci --workspace=probe-agent --include-workspace-root

COPY apps/probe-agent ./apps/probe-agent

RUN npm run build --workspace=probe-agent

FROM node:22-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /workspace/apps/probe-agent/dist ./dist

USER node

CMD ["node", "dist/index.js"]

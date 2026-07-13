FROM node:22-alpine AS dependencies

WORKDIR /workspace

COPY package.json package-lock.json ./
COPY apps/backend-uptime/package.json ./apps/backend-uptime/package.json
COPY apps/probe-agent/package.json ./apps/probe-agent/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/contracts/package.json ./packages/contracts/package.json

RUN npm ci --install-strategy=nested --workspace=backend-uptime --include-workspace-root

FROM dependencies AS build

COPY apps/backend-uptime ./apps/backend-uptime

WORKDIR /workspace/apps/backend-uptime

RUN npm run prisma:generate && npm run build

FROM build AS migrate

CMD ["npm", "run", "prisma:migrate:deploy"]

FROM node:22-alpine AS runtime

WORKDIR /workspace

ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY apps/backend-uptime/package.json ./apps/backend-uptime/package.json
COPY apps/probe-agent/package.json ./apps/probe-agent/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/contracts/package.json ./packages/contracts/package.json

RUN npm ci --omit=dev --install-strategy=nested --workspace=backend-uptime --include-workspace-root \
  && npm cache clean --force

COPY --from=build /workspace/apps/backend-uptime/dist ./apps/backend-uptime/dist
COPY --from=build /workspace/node_modules/.prisma ./node_modules/.prisma

USER node

WORKDIR /workspace/apps/backend-uptime

EXPOSE 4000

CMD ["node", "dist/src/main.js"]

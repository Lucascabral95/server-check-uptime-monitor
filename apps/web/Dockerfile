FROM node:22-alpine AS dependencies

WORKDIR /workspace

COPY package.json package-lock.json ./
COPY apps/backend-uptime/package.json ./apps/backend-uptime/package.json
COPY apps/probe-agent/package.json ./apps/probe-agent/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/contracts/package.json ./packages/contracts/package.json

RUN npm ci --workspace=web --include-workspace-root

FROM dependencies AS build

ARG NEXT_PUBLIC_API_URL_BACKEND
ARG NEXT_PUBLIC_URL_FRONTEND
ARG NEXT_PUBLIC_COGNITO_USER_POOL_ID
ARG NEXT_PUBLIC_COGNITO_CLIENT_ID

ENV NEXT_PUBLIC_API_URL_BACKEND=$NEXT_PUBLIC_API_URL_BACKEND
ENV NEXT_PUBLIC_URL_FRONTEND=$NEXT_PUBLIC_URL_FRONTEND
ENV NEXT_PUBLIC_COGNITO_USER_POOL_ID=$NEXT_PUBLIC_COGNITO_USER_POOL_ID
ENV NEXT_PUBLIC_COGNITO_CLIENT_ID=$NEXT_PUBLIC_COGNITO_CLIENT_ID

COPY apps/web ./apps/web

WORKDIR /workspace/apps/web

RUN npm run build

FROM node:22-alpine AS runtime

WORKDIR /workspace

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0

COPY package.json package-lock.json ./
COPY apps/backend-uptime/package.json ./apps/backend-uptime/package.json
COPY apps/probe-agent/package.json ./apps/probe-agent/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/contracts/package.json ./packages/contracts/package.json

RUN npm ci --omit=dev --workspace=web --include-workspace-root \
  && npm cache clean --force

COPY --from=build /workspace/apps/web/.next ./apps/web/.next
COPY --from=build /workspace/apps/web/public ./apps/web/public
COPY --from=build /workspace/apps/web/next.config.ts ./apps/web/next.config.ts

USER node

WORKDIR /workspace/apps/web

EXPOSE 3000

CMD ["npm", "run", "start"]

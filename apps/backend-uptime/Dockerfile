FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY prisma.config.ts ./

RUN npm install

COPY prisma ./prisma
COPY src ./src

RUN npx prisma generate

RUN npm run build

RUN addgroup -S app && adduser -S app -G app \
  && chown -R app:app /app
USER app

EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]

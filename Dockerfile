# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS prod
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4200

COPY package.json package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/app/prisma ./app/prisma
COPY --from=build /app/prisma.config.ts ./prisma.config.ts

EXPOSE 4200

CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]

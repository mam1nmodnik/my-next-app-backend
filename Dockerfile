# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

FROM node:22-alpine AS build
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json tsconfig.json prisma.config.ts ./
COPY app ./app

RUN npm run build

FROM node:22-alpine AS prod-deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4200

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist/app ./app

RUN mkdir -p node_modules/@ \
  && cp -R app/src node_modules/@/src \
  && cp -R app/prisma node_modules/@/prisma

EXPOSE 4200

CMD ["node", "app/main.js"]

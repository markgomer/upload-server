# FROM oven/bun:latest
#

FROM oven/bun:canary-alpine AS base

# ---

FROM base AS dependencies

WORKDIR /usr/src/app

COPY package.json bun.lock ./

RUN bun i

# ---

FROM base AS build

WORKDIR /usr/src/app

COPY . .
COPY --from=dependencies /usr/src/app/node_modules ./node_modules

RUN bun run build

# prune
RUN rm -rf node_modules && bun install --production

# ---

FROM oven/bun:canary-alpine AS deploy

USER 1000

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/package.json ./package.json

EXPOSE 3333

CMD ["bun", "start"]


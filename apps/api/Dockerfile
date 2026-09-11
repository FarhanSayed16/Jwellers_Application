# syntax=docker/dockerfile:1
# Demo / production API image for Render (or any container host).
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY packages ./packages
RUN npm ci -w @jwellers/api --include-workspace-root=false || npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY apps/api ./apps/api
COPY clients ./clients
WORKDIR /app/apps/api
RUN npx tsc -p tsconfig.json

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/package.json ./package.json
COPY --from=deps /app/node_modules ./node_modules
COPY clients ./clients
EXPOSE 4000
CMD ["node", "dist/index.js"]

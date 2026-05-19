# ── Stage 1: Build Angular app ─────────────────────────────────────────────────
FROM node:14-alpine AS builder

WORKDIR /app

COPY client/package.json client/package-lock.json* ./
RUN npm install --legacy-peer-deps

COPY client/ .
RUN npm run build-prod

# ── Stage 2: Serve with Nginx ──────────────────────────────────────────────────
FROM nginx:1.21-alpine

# LABEL maintainer="Bektur Mambetov"

COPY --from=builder /app/dist /usr/share/nginx/html
COPY client/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

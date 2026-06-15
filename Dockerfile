# ─── Dependencies ────────────────────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY package.json package-lock.json* ./
RUN npm ci

# ─── Build ───────────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
ENV NEXT_TELEMETRY_DISABLED=1
# NEXT_PUBLIC_* vars are inlined into client code at build time, so the public
# app URL must be present during `next build` (QR codes, share links, OAuth).
ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
RUN npm run build

# ─── Runtime ─────────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Optional: the Claude Agent SDK uses the `claude` CLI + a subscription token for
# AI features. Uncomment to bundle it; AI degrades gracefully if absent.
# RUN npm i -g @anthropic-ai/claude-code

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
# Overlay the full node_modules (superset of the standalone-traced set) so the
# Prisma CLI has all of its transitive deps (e.g. `effect`) available to run
# `migrate deploy` at startup. Standalone server.js still resolves correctly.
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
# Apply any pending DB migrations (idempotent), then start the server. The
# migrate step is non-blocking (`;`) so a transient DB hiccup can't crash-loop
# the container; its output is logged for visibility. `migrate deploy` is safe
# to re-run on every boot.
CMD ["sh", "-c", "echo '--- prisma migrate deploy ---'; node node_modules/prisma/build/index.js migrate deploy 2>&1; echo '--- migrate exit:' $? '---'; node server.js"]

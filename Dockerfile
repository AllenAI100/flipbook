# ===== BUILD STAGE =====
FROM node:20-alpine AS builder
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

# Install deps (use cached layers)
COPY package.json pnpm-lock.yaml* package-lock.json* yarn.lock* ./
# Prefer pnpm if available, else npm
RUN if [ -f pnpm-lock.yaml ]; then       corepack enable && corepack prepare pnpm@latest --activate && pnpm i --frozen-lockfile;     elif [ -f yarn.lock ]; then       corepack enable && yarn install --frozen-lockfile;     else       npm ci;     fi

# Copy the rest and build
COPY . .
RUN if [ -f pnpm-lock.yaml ]; then       pnpm build;     elif [ -f yarn.lock ]; then       yarn build;     else       npm run build;     fi

# ===== RUNTIME STAGE =====
FROM node:20-alpine AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

# Create non-root user
RUN addgroup -S nextjs && adduser -S nextjs -G nextjs
USER nextjs

# Copy standalone server and static assets
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Expose and start
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]

# ===== BUILD STAGE =====
FROM node:20-alpine AS builder
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies for build)
RUN npm ci || npm install

# Verify next is installed
RUN ls -la node_modules/.bin/next && \
    node_modules/.bin/next --version || \
    (echo "next not found, reinstalling..." && npm install next)

# Copy source code
COPY . .

# Build the application
# Use direct path to next binary or npx to avoid PATH issues
RUN ./node_modules/.bin/next build || npx next build

# ===== RUNTIME STAGE =====
FROM node:20-alpine AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
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

# ============================================
# Stage 1: Build
# ============================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./
COPY packages/client/package.json ./packages/client/
COPY packages/server/package.json ./packages/server/
COPY packages/common/package.json ./packages/common/

# Install ALL dependencies (needed for build)
RUN yarn install --frozen-lockfile --network-timeout 100000

# Copy source code
COPY packages ./packages
COPY scripts ./scripts
COPY tsconfig.json ./

# Build the application
ENV BUILD_MODE=production
RUN yarn build

# ============================================
# Stage 2: Production Runtime
# ============================================
FROM node:18-alpine

WORKDIR /app

# Copy package files for production install
COPY package.json yarn.lock ./
COPY packages/client/package.json ./packages/client/
COPY packages/server/package.json ./packages/server/
COPY packages/common/package.json ./packages/common/

# Install ONLY production dependencies (much faster)
RUN yarn install --frozen-lockfile --production --network-timeout 100000

# Copy built files from builder
COPY --from=builder /app/packages/client/public ./packages/client/public
COPY --from=builder /app/packages/server/dist ./packages/server/dist
COPY --from=builder /app/packages/common/src ./packages/common/src

# Copy serve script (optional, not used in CMD)
COPY scripts/serve.sh ./scripts/serve.sh

# Environment
ENV NODE_ENV=production

# Don't set PORT here - let Railway set it
# Railway will set PORT=8080 automatically

EXPOSE 8080

# Debug: List files before starting (helps diagnose issues)
RUN echo "=== Checking built files ===" && \
    ls -la packages/client/public/ && \
    ls -la packages/server/dist/ && \
    echo "=== Files check complete ==="

# Start server (which serves both client + game)
CMD ["node", "packages/server/dist/index.js"]

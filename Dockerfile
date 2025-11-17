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

# Force cache bust - Railway won't cache this layer
RUN date > /tmp/build-timestamp

RUN echo "========================================" && \
    echo "Starting build at $(date)" && \
    echo "BUILD_MODE: ${BUILD_MODE}" && \
    cat /tmp/build-timestamp && \
    echo "========================================" && \
    yarn build 2>&1 && \
    echo "========================================" && \
    echo "Build completed! Verifying files..." && \
    echo "" && \
    echo "📁 Client public directory:" && \
    ls -lah packages/client/public/ && \
    echo "" && \
    echo "📁 Server dist directory:" && \
    ls -lah packages/server/dist/ && \
    echo "========================================" && \
    if [ ! -f packages/client/public/script.js ]; then \
      echo "❌ ERROR: script.js not found!"; \
      echo "This means esbuild failed to create the client bundle."; \
      exit 1; \
    fi && \
    if [ ! -f packages/server/dist/index.js ]; then \
      echo "❌ ERROR: index.js not found!"; \
      echo "This means esbuild failed to create the server bundle."; \
      exit 1; \
    fi && \
    echo "✅ Build verification passed - all files exist!" && \
    echo "✅ script.js size: $(stat -c%s packages/client/public/script.js) bytes" && \
    echo "✅ index.js size: $(stat -c%s packages/server/dist/index.js) bytes"

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
RUN echo "========================================" && \
    echo "Checking runtime files..." && \
    echo "Client files:" && \
    ls -lh packages/client/public/ | head -20 && \
    echo "Server files:" && \
    ls -lh packages/server/dist/ | head -20 && \
    echo "========================================"

# Start server (which serves both client + game)
CMD ["node", "packages/server/dist/index.js"]

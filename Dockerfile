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

# Check what files exist BEFORE build
RUN echo "========== BEFORE BUILD ==========" && \
    echo "Client src exists:" && ls -la packages/client/src/ | head -5 && \
    echo "Client public exists:" && ls -la packages/client/public/ && \
    echo "=================================="

# Force cache bust
RUN date > /tmp/build-timestamp && cat /tmp/build-timestamp

# Run build with full output
RUN echo "========== STARTING BUILD ==========" && \
    yarn build && \
    echo "========== BUILD COMPLETE ==========" && \
    echo "" && \
    echo "Client public after build:" && \
    ls -lah packages/client/public/ && \
    echo "" && \
    echo "Server dist after build:" && \
    ls -lah packages/server/dist/ && \
    echo "====================================" && \
    echo "" && \
    if [ ! -f packages/client/public/script.js ]; then \
      echo "❌ FATAL: script.js NOT FOUND"; \
      echo "Client build failed!"; \
      ls -R packages/client/; \
      exit 1; \
    fi && \
    if [ ! -f packages/server/dist/index.js ]; then \
      echo "❌ FATAL: index.js NOT FOUND"; \
      exit 1; \
    fi && \
    echo "✅ script.js: $(stat -c%s packages/client/public/script.js) bytes" && \
    echo "✅ index.js: $(stat -c%s packages/server/dist/index.js) bytes"

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

# Verify files in runtime stage
RUN echo "========== RUNTIME STAGE CHECK ==========" && \
    echo "📁 Client public directory:" && \
    ls -lah packages/client/public/ && \
    echo "" && \
    echo "📁 Server dist directory:" && \
    ls -lah packages/server/dist/ && \
    echo "" && \
    if [ ! -f packages/client/public/script.js ]; then \
      echo "❌ ERROR: script.js missing in runtime stage!"; \
      echo "Files that were copied:"; \
      find packages/client/public/ -type f; \
      exit 1; \
    fi && \
    if [ ! -f packages/client/public/index.html ]; then \
      echo "❌ ERROR: index.html missing in runtime stage!"; \
      exit 1; \
    fi && \
    echo "✅ All required files present in runtime stage" && \
    echo "=========================================="

# Start server (which serves both client + game)
CMD ["node", "packages/server/dist/index.js"]

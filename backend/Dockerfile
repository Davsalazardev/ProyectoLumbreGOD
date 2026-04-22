FROM node:20-alpine AS builder

WORKDIR /app

# Install OpenSSL, required for Prisma on Alpine
RUN apk add --no-cache openssl build-base python3

# Configure npm for better network handling
RUN npm config set fetch-timeout 120000 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000

COPY package*.json ./

# Install all dependencies in builder stage (including dev dependencies)
# This avoids npm ci failures in production stage
RUN npm ci --verbose

COPY . .
RUN npx prisma generate --schema=src/prisma/schema.prisma
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install only runtime dependencies
RUN apk add --no-cache wget openssl

COPY package*.json ./

# Copy pre-built node_modules from builder stage
# This avoids network issues during npm install in production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/prisma ./src/prisma

# Startup script
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 4000

CMD ["./docker-entrypoint.sh"]

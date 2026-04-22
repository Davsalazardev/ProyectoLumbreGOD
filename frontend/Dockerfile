FROM node:20-alpine AS builder

WORKDIR /app

# Configure npm for better network handling
RUN npm config set fetch-timeout 120000 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# Production: serve with nginx
FROM nginx:alpine AS runner

# Copy build output
COPY --from=builder /app/build /usr/share/nginx/html

# nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

# Stage 1: Build the React application
FROM node:20-alpine AS build

WORKDIR /app

# Copy package manifests first to leverage Docker layer caching
COPY package.json package-lock.json ./

# Install project dependencies deterministically
RUN npm ci

# Copy source code and configuration files required for Vite build
COPY tsconfig.json vite.config.ts index.html ./
COPY src/ ./src/
COPY public/ ./public/
COPY frontend/ ./frontend/

# Build static production bundle
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:1.27-alpine

# Copy built production static files from builder stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration for SPA routing & reverse proxying
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]

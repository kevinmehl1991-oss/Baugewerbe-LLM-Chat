# Frontend Dockerfile - Multi-Stage Build
# Stage 1: Build
FROM node:18-alpine AS build

WORKDIR /app

# Package files kopieren
COPY package*.json ./

# Dependencies installieren
RUN npm ci

# App-Code kopieren
COPY public ./public
COPY src ./src

# Build erstellen
RUN npm run build

# Stage 2: Production mit Nginx
FROM nginx:alpine

# Build-Dateien von Build-Stage kopieren
COPY --from=build /app/build /usr/share/nginx/html

# Nginx-Konfiguration kopieren
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Port exponieren
EXPOSE 80

# Health Check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Nginx starten
CMD ["nginx", "-g", "daemon off;"]

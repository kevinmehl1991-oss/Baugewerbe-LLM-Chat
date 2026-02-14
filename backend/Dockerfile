# Backend Dockerfile
FROM node:18-alpine

# Arbeitsverzeichnis erstellen
WORKDIR /app

# Package files kopieren
COPY package*.json ./

# Dependencies installieren
RUN npm ci --only=production

# App-Code kopieren
COPY src ./src

# Port exponieren
EXPOSE 3001

# Health Check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# App starten
CMD ["node", "src/index.js"]

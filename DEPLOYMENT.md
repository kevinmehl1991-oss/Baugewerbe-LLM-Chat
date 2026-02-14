# Deployment-Guide für Bau-Chat-System

## 📦 Deployment-Optionen

Das Bau-Chat-System kann auf verschiedene Arten deployed werden:

1. **Docker Compose** (empfohlen für einfaches Setup)
2. **Vercel** (Frontend) + **Render/Railway** (Backend)
3. **AWS/Azure/GCP** (für Enterprise-Deployment)
4. **Lokaler Server**

---

## 🐳 Option 1: Docker Compose (Empfohlen)

### Voraussetzungen
- Docker & Docker Compose installiert
- Anthropic API Key

### Setup

1. **Projekt klonen oder Dateien herunterladen**

2. **Umgebungsvariablen einrichten**

Erstelle eine `.env` Datei im Root-Verzeichnis:

```bash
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxx
```

3. **Docker Container starten**

```bash
docker-compose up -d
```

4. **App aufrufen**

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

5. **Container verwalten**

```bash
# Status prüfen
docker-compose ps

# Logs anzeigen
docker-compose logs -f

# Container stoppen
docker-compose down

# Neu bauen
docker-compose up -d --build
```

---

## ☁️ Option 2: Cloud Deployment

### Frontend auf Vercel

1. **Vercel Account erstellen**: https://vercel.com

2. **Projekt verbinden**
```bash
cd frontend
npm install -g vercel
vercel login
vercel
```

3. **Umgebungsvariablen setzen**

In Vercel Dashboard → Project Settings → Environment Variables:
```
REACT_APP_API_URL=https://dein-backend.onrender.com
```

4. **Deploy**
```bash
vercel --prod
```

### Backend auf Render

1. **Render Account erstellen**: https://render.com

2. **New Web Service** erstellen
   - Repository verbinden
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && node src/index.js`

3. **Umgebungsvariablen setzen**
```
ANTHROPIC_API_KEY=sk-ant-xxxxx
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://dein-frontend.vercel.app
```

4. **Deploy** - Render baut automatisch bei jedem Push

### Backend auf Railway

1. **Railway Account erstellen**: https://railway.app

2. **New Project** → Deploy from GitHub

3. **Umgebungsvariablen setzen** (identisch zu Render)

4. **Deploy** - automatisch bei jedem Push

---

## 🖥️ Option 3: Lokaler Server

### Voraussetzungen
- Node.js 18+
- Nginx oder Apache (optional)

### Backend-Setup

```bash
cd backend
npm install
```

Erstelle `.env`:
```bash
ANTHROPIC_API_KEY=sk-ant-xxxxx
PORT=3001
NODE_ENV=production
FRONTEND_URL=http://deine-domain.de
```

Mit PM2 (empfohlen):
```bash
npm install -g pm2
pm2 start src/index.js --name bau-chat-backend
pm2 save
pm2 startup
```

Oder mit systemd:
```bash
sudo nano /etc/systemd/system/bau-chat-backend.service
```

```ini
[Unit]
Description=BauChat Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/pfad/zu/backend
ExecStart=/usr/bin/node /pfad/zu/backend/src/index.js
Restart=on-failure
Environment="ANTHROPIC_API_KEY=sk-ant-xxxxx"
Environment="PORT=3001"
Environment="NODE_ENV=production"

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable bau-chat-backend
sudo systemctl start bau-chat-backend
```

### Frontend-Setup

```bash
cd frontend
npm install
npm run build
```

Build-Dateien sind in `build/` - kopiere sie nach Nginx:

```bash
sudo cp -r build/* /var/www/bau-chat
```

Nginx-Konfiguration (`/etc/nginx/sites-available/bau-chat`):

```nginx
server {
    listen 80;
    server_name deine-domain.de;
    root /var/www/bau-chat;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/bau-chat /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### SSL mit Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d deine-domain.de
```

---

## 🚀 Option 4: AWS Deployment

### Backend auf AWS Lambda + API Gateway

1. **Backend als Lambda-Function**

Erstelle `lambda.js`:
```javascript
import serverless from 'serverless-http';
import app from './src/index.js';

export const handler = serverless(app);
```

2. **Serverless Framework verwenden**

```bash
npm install -g serverless
cd backend
serverless deploy
```

### Frontend auf AWS S3 + CloudFront

```bash
cd frontend
npm run build
aws s3 sync build/ s3://dein-bucket --delete
aws cloudfront create-invalidation --distribution-id XXX --paths "/*"
```

---

## 📊 Monitoring & Logs

### Docker
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

### PM2
```bash
pm2 logs bau-chat-backend
pm2 monit
```

### Cloud Platforms
- Vercel: Built-in Analytics & Logs
- Render: Real-time Logs im Dashboard
- Railway: Logs Tab im Projekt

---

## 🔒 Sicherheit

### API-Key-Schutz
- NIEMALS API-Keys im Frontend
- Verwende Umgebungsvariablen
- Rotiere Keys regelmäßig

### Rate Limiting
- Bereits im Backend implementiert
- 50 Requests / 15 Minuten pro IP

### HTTPS
- Verwende IMMER HTTPS in Produktion
- Let's Encrypt für kostenlose Zertifikate

### CORS
- Konfiguriere erlaubte Origins in `.env`
- Vermeide `*` in Produktion

---

## 🔧 Troubleshooting

### "API Key not found"
→ Prüfe `.env` Datei und Umgebungsvariablen

### "CORS Error"
→ Setze `FRONTEND_URL` in Backend `.env`

### "Cannot connect to backend"
→ Prüfe `REACT_APP_API_URL` in Frontend `.env`

### Port bereits belegt
→ Ändere `PORT` in Backend `.env`

---

## 📈 Performance-Optimierung

### Backend
- Cache häufige Normen-Abfragen
- Connection Pooling
- Compression aktivieren

### Frontend
- Code Splitting
- Lazy Loading
- CDN für statische Assets

---

## 💾 Backup

### Docker
```bash
docker-compose exec backend sh -c 'tar -czf /tmp/backup.tar.gz /app'
docker cp bau-chat-backend:/tmp/backup.tar.gz ./backup.tar.gz
```

### Datenbank (wenn verwendet)
```bash
# PostgreSQL Beispiel
pg_dump bau_chat_db > backup.sql
```

---

## 🔄 Updates

### Docker
```bash
git pull
docker-compose down
docker-compose up -d --build
```

### Cloud
- Vercel: Automatisch bei Git Push
- Render/Railway: Automatisch bei Git Push

### Lokaler Server
```bash
git pull
cd backend && npm install
pm2 restart bau-chat-backend

cd ../frontend && npm install && npm run build
sudo cp -r build/* /var/www/bau-chat
```

---

## 📞 Support

Bei Problemen:
1. Prüfe Logs
2. Checke Umgebungsvariablen
3. Verifiziere API-Key
4. Teste Health-Endpunkt: `/health`

Mehr Infos: https://docs.anthropic.com

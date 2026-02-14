# 🚀 Schnellstart-Anleitung

Bring das Bau-Chat-System in 5 Minuten zum Laufen!

## ⚡ Voraussetzungen

- **Node.js 18+** installiert ([Download](https://nodejs.org))
- **Claude API Key** von Anthropic ([Hier anmelden](https://console.anthropic.com))

## 📥 Schritt 1: Dateien bereitstellen

Entpacke alle Dateien oder klone das Repository in ein Verzeichnis deiner Wahl.

```bash
cd bau-chat-system
```

## 🔑 Schritt 2: API-Key einrichten

### Backend .env

Erstelle `backend/.env`:

```bash
ANTHROPIC_API_KEY=dein_api_key_hier
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**💡 Tipp:** Kopiere `backend/.env.example` und fülle deinen API-Key ein.

### Frontend .env

Erstelle `frontend/.env`:

```bash
REACT_APP_API_URL=http://localhost:3001
```

**💡 Tipp:** Kopiere `frontend/.env.example`.

## 📦 Schritt 3: Dependencies installieren

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd ../frontend
npm install
```

## ▶️ Schritt 4: Starten

Öffne **zwei separate Terminals**:

### Terminal 1 - Backend starten

```bash
cd backend
npm start
```

Du solltest sehen:
```
✅ Server läuft auf: http://localhost:3001
🔑 Claude API: Konfiguriert
```

### Terminal 2 - Frontend starten

```bash
cd frontend
npm start
```

Browser öffnet sich automatisch auf: **http://localhost:3000**

## ✅ Fertig!

Die App läuft jetzt! Wähle einen Fachbereich und stelle deine erste Frage.

---

## 🐛 Probleme?

### "Cannot find module '@anthropic-ai/sdk'"
```bash
cd backend
npm install
```

### "Port 3001 already in use"
Ändere `PORT` in `backend/.env` zu einem anderen Wert (z.B. 3002)

### "API Key error"
- Prüfe ob API-Key in `backend/.env` vorhanden ist
- Stelle sicher, dass keine Leerzeichen im Key sind
- Verifiziere den Key auf https://console.anthropic.com

### "CORS Error"
- Backend muss vor Frontend gestartet werden
- Prüfe `FRONTEND_URL` in `backend/.env`
- Restart beide Server

### Frontend verbindet nicht
- Prüfe `REACT_APP_API_URL` in `frontend/.env`
- Stelle sicher dass Backend läuft (teste http://localhost:3001/health)

---

## 📖 Nächste Schritte

1. **Teste verschiedene Fachbereiche** über das Dropdown-Menü
2. **Exportiere Chat-Verläufe** als PDF
3. **Schaue in die Quellen** - alle Normen sind verlinkt
4. **Lies die vollständige Dokumentation** in `README.md`
5. **Deployment-Optionen** findest du in `DEPLOYMENT.md`

---

## 💡 Beispiel-Fragen zum Testen

### Hochbau
*"Welche Betonfestigkeitsklasse brauche ich für tragende Wände?"*

### Tiefbau
*"Was sind die Anforderungen an Straßenunterbau nach ZTV?"*

### TGA
*"Wie dimensioniere ich eine Trinkwasserleitung nach DIN 1988?"*

---

## 🎯 Features auf einen Blick

✅ **7 Fachbereiche** - Von Hochbau bis Nachhaltigkeit
✅ **Normen-verifiziert** - Alle Angaben mit Quellennachweis
✅ **PDF-Export** - Chat-Verläufe dokumentieren
✅ **Kontextbewusst** - Merkt sich Gesprächsverlauf
✅ **Responsive** - Funktioniert auf Desktop & Tablet

---

## 📞 Hilfe benötigt?

- **Dokumentation**: `README.md`
- **Deployment**: `DEPLOYMENT.md`
- **Claude Docs**: https://docs.anthropic.com
- **DIN Media**: https://www.dinmedia.de

---

**Viel Erfolg mit deinem Bau-Chat-System! 🏗️**

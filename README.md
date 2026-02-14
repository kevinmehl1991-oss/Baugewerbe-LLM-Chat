# Bau-Chat-System - Spezialisierter KI-Assistent für die Baubranche

Ein webbasiertes Chat-System mit Claude AI, speziell zugeschnitten für alle Bereiche der Baubranche - von Hochbau bis Tiefbau. Das System stellt sicher, dass alle Normenangaben verifiziert und mit fundierten Quellen belegt sind.

## 🏗️ Features

- **Fachbereich-spezifische Antworten**: Dropdown-Menü mit 7 Spezialbereichen
  - Hochbau (Wohnbau, Gewerbebau, Industriebau)
  - Tiefbau (Straßenbau, Kanalbau, Brückenbau)
  - Ingenieurbau (Statik, Tragwerksplanung)
  - Ausbau (Innenausbau, Fassadenbau)
  - Technische Gebäudeausrüstung (HVAC, Sanitär, Elektro)
  - Projektmanagement & Baurecht
  - Nachhaltiges Bauen & Energieeffizienz

- **Normen-Verifizierung**: Alle DIN-, EN- und VOB-Referenzen werden mit Quellenangaben belegt
- **Kontextbewusstsein**: Der Chat merkt sich den gewählten Fachbereich
- **Exportfunktion**: Chat-Verläufe als PDF mit allen Quellenangaben
- **Responsive Design**: Optimiert für Desktop und Tablet (Baustellen-Nutzung)

## 📋 Voraussetzungen

- Node.js 18+ oder höher
- npm oder yarn
- Claude API Key von Anthropic ([hier anmelden](https://console.anthropic.com/))

## 🚀 Installation

### 1. Repository klonen oder Dateien herunterladen

### 2. Backend einrichten

```bash
cd backend
npm install
```

Erstelle eine `.env` Datei im backend-Ordner:

```env
ANTHROPIC_API_KEY=dein_api_key_hier
PORT=3001
NODE_ENV=development
```

Starte den Backend-Server:

```bash
npm start
```

Der Backend-Server läuft nun auf http://localhost:3001

### 3. Frontend einrichten

```bash
cd ../frontend
npm install
```

Erstelle eine `.env` Datei im frontend-Ordner:

```env
REACT_APP_API_URL=http://localhost:3001
```

Starte die React-App:

```bash
npm start
```

Die App öffnet sich automatisch im Browser auf http://localhost:3000

## 🏗️ Projektstruktur

```
bau-chat-system/
├── backend/
│   ├── src/
│   │   ├── index.js              # Express Server
│   │   ├── claudeService.js      # Claude API Integration
│   │   ├── normenService.js      # Normen-Verifizierung
│   │   └── prompts.js            # System-Prompts pro Fachbereich
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── App.js                # Haupt-Komponente
│   │   ├── components/
│   │   │   ├── Chat.js           # Chat-Interface
│   │   │   ├── FachbereichSelect.js  # Dropdown-Menü
│   │   │   ├── Message.js        # Nachrichten-Komponente
│   │   │   └── ExportButton.js   # PDF-Export
│   │   └── styles/
│   │       └── App.css
│   ├── package.json
│   └── .env
└── README.md
```

## 🔧 Technologie-Stack

### Backend
- **Node.js** mit Express
- **@anthropic-ai/sdk** - Offizielle Claude API SDK
- **cors** - Cross-Origin Resource Sharing
- **dotenv** - Umgebungsvariablen
- **express-rate-limit** - Rate Limiting

### Frontend
- **React 18**
- **Axios** - HTTP Client
- **react-markdown** - Markdown-Rendering
- **jsPDF** - PDF-Generierung
- **CSS3** - Responsive Styling

## 📊 API Endpunkte

### POST /api/chat
Chat-Anfrage senden

**Request Body:**
```json
{
  "message": "Was sind die Anforderungen an Betonfestigkeitsklassen?",
  "fachbereich": "hochbau",
  "conversationHistory": []
}
```

**Response:**
```json
{
  "response": "Die Betonfestigkeitsklassen sind in DIN EN 206-1...",
  "sources": [
    {
      "norm": "DIN EN 206-1",
      "title": "Beton - Teil 1: Festlegung, Eigenschaften...",
      "year": "2023",
      "section": "Abschnitt 4.3"
    }
  ]
}
```

## 🎯 Verwendung

1. **Fachbereich auswählen**: Wähle aus dem Dropdown-Menü den relevanten Baubereich
2. **Frage stellen**: Gib deine Frage in das Eingabefeld ein
3. **Antwort erhalten**: Der KI-Assistent antwortet mit normenkonformen Informationen
4. **Quellen prüfen**: Alle Normenreferenzen sind verlinkt und verifiziert
5. **Verlauf exportieren**: Exportiere den gesamten Chat als PDF

## 🔐 Sicherheit & Compliance

- **API-Key-Sicherheit**: API-Keys werden nur im Backend gespeichert
- **DSGVO-konform**: Keine Speicherung personenbezogener Daten
- **Rate Limiting**: Schutz vor Missbrauch
- **CORS-Konfiguration**: Nur autorisierte Domains

## 📝 Normen-Datenbank

Das System greift auf folgende Normen-Quellen zu:
- DIN-Normen (Deutsches Institut für Normung)
- EN-Normen (Europäische Normen)
- VOB (Vergabe- und Vertragsordnung für Bauleistungen)
- VDI-Richtlinien (Verein Deutscher Ingenieure)

**Wichtig**: DIN-Normen sind urheberrechtlich geschützt. Das System zitiert nur kurze Auszüge gemäß Zitatrecht und verlinkt auf offizielle Quellen.

## 🚀 Deployment

### Vercel (Frontend)
```bash
cd frontend
npm run build
vercel deploy
```

### Render / Railway (Backend)
- Erstelle neuen Web Service
- Verbinde mit Git Repository
- Setze Umgebungsvariablen (ANTHROPIC_API_KEY)
- Deploy

### Alternative: Docker
```bash
# Docker Compose verwenden (siehe docker-compose.yml)
docker-compose up -d
```

## 🛠️ Entwicklung

### Backend-Tests
```bash
cd backend
npm test
```

### Frontend-Tests
```bash
cd frontend
npm test
```

## 📄 Lizenz

Dieses Projekt ist für den internen Gebrauch entwickelt. Alle DIN-Normen und technischen Regelwerke unterliegen dem Copyright ihrer jeweiligen Herausgeber.

## 🤝 Beitragen

Verbesserungsvorschläge und Bug-Reports sind willkommen!

## 📞 Support

Bei Fragen zur Implementierung oder API-Problemen:
- Anthropic Claude Docs: https://docs.anthropic.com
- DIN Media: https://www.dinmedia.de

## 🔄 Updates

- **v1.0.0** (Februar 2025) - Initial Release
  - 7 Fachbereiche
  - Normen-Verifizierung
  - PDF-Export
  - Responsive Design

---

**Entwickelt mit ❤️ für die Baubranche**

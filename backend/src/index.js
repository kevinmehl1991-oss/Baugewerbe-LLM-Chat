// index.js - Express Server für Bau-Chat-System
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import ClaudeService from './claudeService.js';
import NormenService from './normenService.js';

// Lade Umgebungsvariablen
dotenv.config();

// Initialisiere Express
const app = express();
const PORT = process.env.PORT || 3001;

// Initialisiere Services
const claudeService = new ClaudeService();
const normenService = new NormenService();

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Helmet für Sicherheits-Header
app.use(helmet());

// CORS-Konfiguration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// JSON Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiting - 50 Requests pro 15 Minuten pro IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minuten
  max: 50,
  message: 'Zu viele Anfragen von dieser IP. Bitte versuche es später erneut.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Request Logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ============================================================================
// ROUTES
// ============================================================================

/**
 * Health Check Endpunkt
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Bau-Chat-Backend',
    version: '1.0.0'
  });
});

/**
 * Hauptendpunkt: Chat-Anfrage verarbeiten
 * POST /api/chat
 */
app.post('/api/chat', async (req, res) => {
  try {
    const { message, fachbereich, conversationHistory } = req.body;

    // Validierung
    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        error: 'Nachricht darf nicht leer sein'
      });
    }

    if (!fachbereich) {
      return res.status(400).json({
        error: 'Fachbereich muss angegeben werden'
      });
    }

    const validFachbereiche = [
      'hochbau', 
      'tiefbau', 
      'ingenieurbau', 
      'ausbau', 
      'tga', 
      'projektmanagement', 
      'nachhaltigkeit'
    ];

    if (!validFachbereiche.includes(fachbereich)) {
      return res.status(400).json({
        error: 'Ungültiger Fachbereich'
      });
    }

    // Conversation History validieren
    const history = conversationHistory || [];
    if (!Array.isArray(history)) {
      return res.status(400).json({
        error: 'Conversation History muss ein Array sein'
      });
    }

    console.log(`\n📬 Neue Chat-Anfrage:`);
    console.log(`   Fachbereich: ${fachbereich}`);
    console.log(`   Nachricht: ${message.substring(0, 100)}...`);
    console.log(`   History: ${history.length} Nachrichten`);

    // Sende an Claude
    const result = await claudeService.sendMessage(
      message,
      fachbereich,
      history
    );

    // Verifiziere Quellen
    const verifiedSources = result.sources.map(source => {
      const verification = normenService.verifyNorm(source.norm);
      return {
        ...source,
        verified: verification.exists,
        status: verification.status,
        warning: verification.warning
      };
    });

    // Erfolgreiche Antwort
    res.json({
      success: true,
      response: result.response,
      sources: verifiedSources,
      metadata: {
        fachbereich,
        timestamp: new Date().toISOString(),
        usage: result.usage
      }
    });

    console.log(`✅ Antwort gesendet (${result.response.length} Zeichen, ${verifiedSources.length} Quellen)`);

  } catch (error) {
    console.error('❌ Fehler bei Chat-Verarbeitung:', error);
    
    res.status(500).json({
      success: false,
      error: error.message || 'Ein unerwarteter Fehler ist aufgetreten',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Norm-Informationen abrufen
 * GET /api/normen/:normNumber
 */
app.get('/api/normen/:normNumber', (req, res) => {
  try {
    const { normNumber } = req.params;
    const info = normenService.verifyNorm(normNumber);

    res.json({
      success: true,
      data: info
    });

  } catch (error) {
    console.error('❌ Fehler bei Normen-Abfrage:', error);
    res.status(500).json({
      success: false,
      error: 'Fehler beim Abrufen der Normen-Information'
    });
  }
});

/**
 * Normen nach Kategorie abrufen
 * GET /api/normen/category/:category
 */
app.get('/api/normen/category/:category', (req, res) => {
  try {
    const { category } = req.params;
    const categoryMap = {
      'hochbau': 'Hochbau',
      'tiefbau': 'Tiefbau',
      'ingenieurbau': 'Ingenieurbau',
      'ausbau': 'Ausbau',
      'tga': 'TGA',
      'projektmanagement': 'Projektmanagement',
      'nachhaltigkeit': 'Nachhaltigkeit'
    };

    const mappedCategory = categoryMap[category];
    if (!mappedCategory) {
      return res.status(400).json({
        success: false,
        error: 'Ungültige Kategorie'
      });
    }

    const norms = normenService.getNormsByCategory(mappedCategory);

    res.json({
      success: true,
      category: mappedCategory,
      count: norms.length,
      data: norms
    });

  } catch (error) {
    console.error('❌ Fehler bei Kategorie-Abfrage:', error);
    res.status(500).json({
      success: false,
      error: 'Fehler beim Abrufen der Normen'
    });
  }
});

/**
 * Normen suchen
 * GET /api/normen/search?q=query
 */
app.get('/api/normen/search', (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Suchbegriff muss mindestens 2 Zeichen lang sein'
      });
    }

    const results = normenService.findSimilarNorms(q);

    res.json({
      success: true,
      query: q,
      count: results.length,
      data: results
    });

  } catch (error) {
    console.error('❌ Fehler bei Normen-Suche:', error);
    res.status(500).json({
      success: false,
      error: 'Fehler bei der Suche'
    });
  }
});

/**
 * Statistiken abrufen
 * GET /api/stats
 */
app.get('/api/stats', (req, res) => {
  try {
    const stats = normenService.getStatistics();

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Fehler bei Statistik-Abfrage:', error);
    res.status(500).json({
      success: false,
      error: 'Fehler beim Abrufen der Statistiken'
    });
  }
});

/**
 * 404 Handler
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpunkt nicht gefunden',
    path: req.path
  });
});

/**
 * Error Handler
 */
app.use((err, req, res, next) => {
  console.error('❌ Unbehandelter Fehler:', err);
  
  res.status(500).json({
    success: false,
    error: 'Ein interner Serverfehler ist aufgetreten',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ============================================================================
// SERVER START
// ============================================================================

// Prüfe API-Key beim Start
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('❌ FEHLER: ANTHROPIC_API_KEY nicht in .env gefunden!');
  console.error('   Bitte erstelle eine .env Datei mit deinem API-Key.');
  process.exit(1);
}

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🏗️  BAU-CHAT-SYSTEM BACKEND');
  console.log('='.repeat(60));
  console.log(`\n✅ Server läuft auf: http://localhost:${PORT}`);
  console.log(`📡 API Endpunkte:`);
  console.log(`   POST   /api/chat`);
  console.log(`   GET    /api/normen/:normNumber`);
  console.log(`   GET    /api/normen/category/:category`);
  console.log(`   GET    /api/normen/search?q=query`);
  console.log(`   GET    /api/stats`);
  console.log(`   GET    /health`);
  console.log(`\n🔑 Claude API: Konfiguriert`);
  console.log(`🌍 CORS: ${corsOptions.origin}`);
  console.log(`⏱️  Rate Limit: 50 Requests / 15 Min\n`);
  console.log('='.repeat(60) + '\n');
});

export default app;

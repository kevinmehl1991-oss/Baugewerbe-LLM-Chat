// claudeService.js - Integration mit Claude API
import Anthropic from '@anthropic-ai/sdk';
import { getSystemPrompt } from './prompts.js';

class ClaudeService {
  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    this.model = 'claude-sonnet-4-20250514'; // Claude Sonnet 4.5
  }

  /**
   * Sendet eine Chat-Anfrage an Claude
   * @param {string} userMessage - Die Nachricht des Benutzers
   * @param {string} fachbereich - Der gewählte Fachbereich
   * @param {Array} conversationHistory - Bisheriger Gesprächsverlauf
   * @returns {Promise<Object>} - Antwort von Claude mit extrahierten Quellen
   */
  async sendMessage(userMessage, fachbereich, conversationHistory = []) {
    try {
      // System-Prompt basierend auf Fachbereich
      const systemPrompt = getSystemPrompt(fachbereich);

      // Formatiere Conversation History für Claude
      const messages = [];
      
      // Füge bisherige Nachrichten hinzu
      conversationHistory.forEach(msg => {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      });

      // Füge neue User-Nachricht hinzu
      messages.push({
        role: 'user',
        content: userMessage
      });

      console.log(`📨 Sende Anfrage an Claude (Fachbereich: ${fachbereich})`);
      console.log(`💬 Nachricht: ${userMessage.substring(0, 100)}...`);

      // API-Aufruf an Claude
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 4000,
        system: systemPrompt,
        messages: messages,
        temperature: 0.3, // Niedrig für konsistente, faktenbasierte Antworten
      });

      // Extrahiere Text aus der Antwort
      const assistantMessage = response.content[0].text;

      // Extrahiere Quellenangaben
      const sources = this.extractSources(assistantMessage);

      console.log(`✅ Antwort erhalten (${assistantMessage.length} Zeichen)`);
      console.log(`📚 Quellen gefunden: ${sources.length}`);

      return {
        response: assistantMessage,
        sources: sources,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        }
      };

    } catch (error) {
      console.error('❌ Fehler bei Claude API:', error);
      
      if (error.status === 429) {
        throw new Error('Rate Limit erreicht. Bitte warte einen Moment und versuche es erneut.');
      } else if (error.status === 401) {
        throw new Error('API-Authentifizierung fehlgeschlagen. Bitte prüfe den API-Key.');
      } else if (error.status === 400) {
        throw new Error('Ungültige Anfrage. Bitte überprüfe deine Eingabe.');
      }
      
      throw new Error('Ein Fehler ist bei der Verarbeitung aufgetreten. Bitte versuche es erneut.');
    }
  }

  /**
   * Extrahiert Normen-Quellen aus dem Text
   * @param {string} text - Der Text mit Quellenangaben
   * @returns {Array} - Array von Quellen-Objekten
   */
  extractSources(text) {
    const sources = [];
    
    // Regex-Muster für verschiedene Normen-Formate
    const patterns = [
      // Format: [DIN EN 206-1:2023, Abschnitt 4.3 - Titel]
      /📋\s*\[(DIN(?:\sEN)?\s+[\d\-]+(?:\/[\d\-]+)?):?(\d{4})?,?\s*(?:Abschnitt\s+)?([0-9.]+)?\s*(?:-\s*)?([^\]]+)?\]/gi,
      
      // Format: DIN 1045-2:2008
      /(DIN(?:\sEN)?\s+[\d\-]+(?:\/[\d\-]+)?):(\d{4})/gi,
      
      // Format: VOB Teil A:2023
      /(VOB\s+Teil\s+[ABC]):?(\d{4})?/gi,
      
      // Format: EN 1992-1-1
      /(EN\s+[\d\-]+):?(\d{4})?/gi,
      
      // Format: VDI 6022
      /(VDI\s+\d+):?(\d{4})?/gi,
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        // Erstelle Quellen-Objekt
        const source = {
          norm: match[1].trim(),
          year: match[2] || null,
          section: match[3] || null,
          title: match[4] ? match[4].trim() : null,
        };

        // Generiere Link zu DIN Media (Beuth Verlag)
        const normNumber = source.norm.replace(/\s+/g, '%20');
        source.link = `https://www.beuth.de/de/suche/${normNumber}`;

        // Vermeide Duplikate
        const isDuplicate = sources.some(s => 
          s.norm === source.norm && 
          s.year === source.year
        );

        if (!isDuplicate) {
          sources.push(source);
        }
      }
    });

    return sources;
  }

  /**
   * Streaming-Antwort (für zukünftige Erweiterung)
   * @param {string} userMessage 
   * @param {string} fachbereich 
   * @param {Function} onChunk - Callback für jeden Text-Chunk
   */
  async streamMessage(userMessage, fachbereich, onChunk) {
    const systemPrompt = getSystemPrompt(fachbereich);

    const stream = await this.client.messages.stream({
      model: this.model,
      max_tokens: 4000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userMessage
        }
      ],
      temperature: 0.3,
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta') {
        onChunk(chunk.delta.text);
      }
    }
  }

  /**
   * Validiert, ob eine Norm existiert (einfache Prüfung)
   * @param {string} normNumber - Normnummer z.B. "DIN 1045"
   * @returns {boolean}
   */
  isValidNorm(normNumber) {
    // Einfache Validierung basierend auf Format
    const validPatterns = [
      /^DIN(\sEN)?\s+\d+/i,
      /^EN\s+\d+/i,
      /^VOB\s+Teil\s+[ABC]/i,
      /^VDI\s+\d+/i,
      /^ISO\s+\d+/i,
    ];

    return validPatterns.some(pattern => pattern.test(normNumber));
  }
}

export default ClaudeService;

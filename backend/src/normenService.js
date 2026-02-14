// normenService.js - Erweiterte Normen-Verifizierung und -Verwaltung
import axios from 'axios';

class NormenService {
  constructor() {
    // Bekannte DIN-Normen-Datenbank (Beispiel-Daten)
    // In Produktion: Anbindung an echte Datenbank oder API
    this.normenDatabase = {
      'DIN 1045': {
        title: 'Tragwerke aus Beton, Stahlbeton und Spannbeton',
        latestVersion: '2008',
        status: 'zurückgezogen',
        replacedBy: 'DIN EN 1992',
        category: 'Ingenieurbau'
      },
      'DIN EN 206': {
        title: 'Beton - Festlegung, Eigenschaften, Herstellung und Konformität',
        latestVersion: '2023',
        status: 'gültig',
        category: 'Hochbau'
      },
      'DIN 4109': {
        title: 'Schallschutz im Hochbau',
        latestVersion: '2018',
        status: 'gültig',
        category: 'Hochbau'
      },
      'DIN 18300': {
        title: 'VOB Vergabe- und Vertragsordnung für Bauleistungen - Teil C: Erdarbeiten',
        latestVersion: '2019',
        status: 'gültig',
        category: 'Tiefbau'
      },
      'DIN EN 1990': {
        title: 'Eurocode: Grundlagen der Tragwerksplanung',
        latestVersion: '2021',
        status: 'gültig',
        category: 'Ingenieurbau'
      },
      'DIN 18008': {
        title: 'Glas im Bauwesen - Bemessungs- und Konstruktionsregeln',
        latestVersion: '2020',
        status: 'gültig',
        category: 'Hochbau'
      },
      'VOB Teil A': {
        title: 'Vergabe- und Vertragsordnung für Bauleistungen - Teil A: Allgemeine Bestimmungen für die Vergabe von Bauleistungen',
        latestVersion: '2019',
        status: 'gültig',
        category: 'Projektmanagement'
      },
      'VOB Teil B': {
        title: 'Vergabe- und Vertragsordnung für Bauleistungen - Teil B: Allgemeine Vertragsbedingungen',
        latestVersion: '2019',
        status: 'gültig',
        category: 'Projektmanagement'
      },
      'DIN 276': {
        title: 'Kosten im Bauwesen',
        latestVersion: '2018',
        status: 'gültig',
        category: 'Projektmanagement'
      },
      'DIN 1988': {
        title: 'Technische Regeln für Trinkwasser-Installationen',
        latestVersion: '2023',
        status: 'gültig',
        category: 'TGA'
      },
      'VDI 6022': {
        title: 'Hygieneanforderungen an Raumlufttechnische Anlagen und Geräte',
        latestVersion: '2018',
        status: 'gültig',
        category: 'TGA'
      },
      'DIN 18516': {
        title: 'Außenwandbekleidungen, hinterlüftet',
        latestVersion: '2010',
        status: 'gültig',
        category: 'Ausbau'
      },
      'DIN V 18599': {
        title: 'Energetische Bewertung von Gebäuden',
        latestVersion: '2018',
        status: 'gültig',
        category: 'Nachhaltigkeit'
      }
    };
  }

  /**
   * Verifiziert eine Norm und gibt Details zurück
   * @param {string} normNumber - z.B. "DIN 1045"
   * @returns {Object} - Normen-Informationen
   */
  verifyNorm(normNumber) {
    const cleanNorm = this.cleanNormNumber(normNumber);
    const info = this.normenDatabase[cleanNorm];

    if (info) {
      return {
        exists: true,
        norm: cleanNorm,
        ...info,
        searchUrl: this.generateSearchUrl(cleanNorm),
        warning: info.status === 'zurückgezogen' ? 
          `⚠️ Diese Norm wurde zurückgezogen und durch ${info.replacedBy} ersetzt.` : null
      };
    }

    return {
      exists: false,
      norm: cleanNorm,
      warning: '⚠️ Diese Norm konnte nicht in der Datenbank gefunden werden. Bitte prüfe die Schreibweise.',
      searchUrl: this.generateSearchUrl(cleanNorm)
    };
  }

  /**
   * Bereinigt Normnummer für Datenbank-Lookup
   * @param {string} normNumber 
   * @returns {string}
   */
  cleanNormNumber(normNumber) {
    // Entferne Jahr und Abschnitt
    return normNumber
      .replace(/:\d{4}/, '')
      .replace(/,.*/, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Generiert Beuth Verlag Such-URL
   * @param {string} normNumber 
   * @returns {string}
   */
  generateSearchUrl(normNumber) {
    const encoded = encodeURIComponent(normNumber);
    return `https://www.beuth.de/de/suche/${encoded}`;
  }

  /**
   * Sucht nach ähnlichen Normen (für Vorschläge)
   * @param {string} query 
   * @returns {Array}
   */
  findSimilarNorms(query) {
    const results = [];
    const lowerQuery = query.toLowerCase();

    for (const [norm, info] of Object.entries(this.normenDatabase)) {
      if (
        norm.toLowerCase().includes(lowerQuery) ||
        info.title.toLowerCase().includes(lowerQuery) ||
        info.category.toLowerCase().includes(lowerQuery)
      ) {
        results.push({
          norm,
          ...info
        });
      }
    }

    return results;
  }

  /**
   * Gibt alle Normen für einen Fachbereich zurück
   * @param {string} category 
   * @returns {Array}
   */
  getNormsByCategory(category) {
    const results = [];

    for (const [norm, info] of Object.entries(this.normenDatabase)) {
      if (info.category.toLowerCase() === category.toLowerCase()) {
        results.push({
          norm,
          ...info
        });
      }
    }

    return results.sort((a, b) => a.norm.localeCompare(b.norm));
  }

  /**
   * Prüft, ob eine Norm aktuell ist
   * @param {string} normNumber 
   * @param {string} year 
   * @returns {Object}
   */
  checkNormActuality(normNumber, year) {
    const cleanNorm = this.cleanNormNumber(normNumber);
    const info = this.normenDatabase[cleanNorm];

    if (!info) {
      return {
        isActual: null,
        message: 'Norm nicht in Datenbank gefunden'
      };
    }

    if (info.latestVersion === year) {
      return {
        isActual: true,
        message: '✅ Aktuelle Version'
      };
    }

    return {
      isActual: false,
      message: `⚠️ Neuere Version verfügbar: ${info.latestVersion}`,
      latestVersion: info.latestVersion
    };
  }

  /**
   * Formatiert Quellenangabe für Export
   * @param {Object} source 
   * @returns {string}
   */
  formatSourceCitation(source) {
    let citation = source.norm;
    
    if (source.year) {
      citation += `:${source.year}`;
    }
    
    if (source.section) {
      citation += `, Abschnitt ${source.section}`;
    }
    
    if (source.title) {
      citation += ` - ${source.title}`;
    }

    return citation;
  }

  /**
   * Validiert Normen-Format
   * @param {string} normNumber 
   * @returns {boolean}
   */
  isValidFormat(normNumber) {
    const patterns = [
      /^DIN(\sEN)?\s+\d+(-\d+)?$/i,
      /^EN\s+\d+(-\d+)?$/i,
      /^VOB\s+Teil\s+[ABC]$/i,
      /^VDI\s+\d+$/i,
      /^ISO\s+\d+$/i,
      /^DIN\sV\s+\d+$/i,
    ];

    return patterns.some(pattern => pattern.test(normNumber));
  }

  /**
   * Erweitere Datenbank um neue Norm (für Admin-Funktion)
   * @param {string} norm 
   * @param {Object} info 
   */
  addNorm(norm, info) {
    if (!this.normenDatabase[norm]) {
      this.normenDatabase[norm] = info;
      console.log(`✅ Norm ${norm} zur Datenbank hinzugefügt`);
      return true;
    }
    return false;
  }

  /**
   * Gibt Statistiken über die Normen-Datenbank aus
   * @returns {Object}
   */
  getStatistics() {
    const categories = {};
    let valid = 0;
    let deprecated = 0;

    for (const info of Object.values(this.normenDatabase)) {
      categories[info.category] = (categories[info.category] || 0) + 1;
      
      if (info.status === 'gültig') valid++;
      if (info.status === 'zurückgezogen') deprecated++;
    }

    return {
      total: Object.keys(this.normenDatabase).length,
      valid,
      deprecated,
      categories
    };
  }
}

export default NormenService;

// FachbereichSelect.js - Dropdown-Menü für Fachbereichsauswahl
import React from 'react';

const FACHBEREICHE = [
  {
    value: 'hochbau',
    label: 'Hochbau',
    icon: '🏢',
    description: 'Wohnbau, Gewerbebau, Industriebau'
  },
  {
    value: 'tiefbau',
    label: 'Tiefbau',
    icon: '🚧',
    description: 'Straßenbau, Kanalbau, Brückenbau'
  },
  {
    value: 'ingenieurbau',
    label: 'Ingenieurbau',
    icon: '📐',
    description: 'Statik, Tragwerksplanung'
  },
  {
    value: 'ausbau',
    label: 'Ausbau',
    icon: '🎨',
    description: 'Innenausbau, Fassadenbau'
  },
  {
    value: 'tga',
    label: 'TGA',
    icon: '⚙️',
    description: 'HVAC, Sanitär, Elektro'
  },
  {
    value: 'projektmanagement',
    label: 'Projektmanagement',
    icon: '📊',
    description: 'Baurecht, VOB, HOAI'
  },
  {
    value: 'nachhaltigkeit',
    label: 'Nachhaltigkeit',
    icon: '🌱',
    description: 'Energieeffizienz, Zertifizierungen'
  }
];

function FachbereichSelect({ selectedFachbereich, onFachbereichChange }) {
  const currentFachbereich = FACHBEREICHE.find(
    fb => fb.value === selectedFachbereich
  ) || FACHBEREICHE[0];

  return (
    <div className="fachbereich-select">
      <label htmlFor="fachbereich-dropdown" className="select-label">
        Fachbereich:
      </label>
      
      <div className="select-wrapper">
        <div className="select-current">
          <span className="select-icon">{currentFachbereich.icon}</span>
          <select
            id="fachbereich-dropdown"
            value={selectedFachbereich}
            onChange={(e) => onFachbereichChange(e.target.value)}
            className="select-dropdown"
          >
            {FACHBEREICHE.map((fb) => (
              <option key={fb.value} value={fb.value}>
                {fb.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="select-description">
          {currentFachbereich.description}
        </div>
      </div>

      <div className="fachbereich-indicator">
        <div className="indicator-dot"></div>
        <span>Aktiv</span>
      </div>
    </div>
  );
}

export default FachbereichSelect;

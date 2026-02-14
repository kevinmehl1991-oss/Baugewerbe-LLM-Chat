// App.js - Hauptkomponente für Bau-Chat-System
import React, { useState } from 'react';
import Chat from './components/Chat';
import FachbereichSelect from './components/FachbereichSelect';
import './styles/App.css';

function App() {
  const [selectedFachbereich, setSelectedFachbereich] = useState('hochbau');
  const [resetChat, setResetChat] = useState(0);

  const handleFachbereichChange = (newFachbereich) => {
    if (newFachbereich !== selectedFachbereich) {
      setSelectedFachbereich(newFachbereich);
      // Chat zurücksetzen bei Fachbereichswechsel
      setResetChat(prev => prev + 1);
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <h1>
              <span className="icon">🏗️</span>
              BauChat AI
            </h1>
            <p className="subtitle">Ihr KI-Assistent für die Baubranche</p>
          </div>
          
          <div className="header-right">
            <FachbereichSelect 
              selectedFachbereich={selectedFachbereich}
              onFachbereichChange={handleFachbereichChange}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        <div className="container">
          {/* Info Banner */}
          <div className="info-banner">
            <div className="info-icon">ℹ️</div>
            <div className="info-content">
              <strong>Normenkonforme Antworten:</strong> Alle Angaben werden mit 
              aktuellen DIN-, EN- und VOB-Normen belegt. Quellen sind verlinkt 
              und verifiziert.
            </div>
          </div>

          {/* Chat Komponente */}
          <Chat 
            fachbereich={selectedFachbereich}
            key={resetChat}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <p>
            <strong>Hinweis:</strong> Dieses System dient zur Information und 
            Unterstützung. Für rechtsverbindliche Auskünfte konsultieren Sie bitte 
            die Original-Normen und einen Fachplaner.
          </p>
          <p className="footer-links">
            <a href="https://www.dinmedia.de" target="_blank" rel="noopener noreferrer">
              DIN Media
            </a>
            {' | '}
            <a href="https://docs.anthropic.com" target="_blank" rel="noopener noreferrer">
              Powered by Claude AI
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;

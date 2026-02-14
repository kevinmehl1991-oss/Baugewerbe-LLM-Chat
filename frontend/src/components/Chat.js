// Chat.js - Hauptchat-Interface
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Message from './Message';
import ExportButton from './ExportButton';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function Chat({ fachbereich }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll zum letzten Message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Willkommensnachricht beim ersten Laden oder Fachbereichswechsel
  useEffect(() => {
    const welcomeMessages = {
      hochbau: 'Hallo! Ich bin dein Assistent für Hochbau. Stelle mir Fragen zu Wohnbau, Gewerbebau, Industriebau oder relevanten Normen wie DIN EN 206 oder DIN 4109.',
      tiefbau: 'Willkommen! Ich helfe dir bei Tiefbau-Themen wie Straßenbau, Kanalbau und Brückenbau. Frage mich zu DIN 18300, ZTV oder Gründungen.',
      ingenieurbau: 'Grüß dich! Ich unterstütze dich bei Statik und Tragwerksplanung. Frage mich zu Eurocodes, Bemessungsverfahren oder Lastannahmen.',
      ausbau: 'Hallo! Ich bin spezialisiert auf Ausbau und Fassadentechnik. Frage mich zu Trockenbau, Fliesen, Oberflächenbehandlungen oder DIN 18340.',
      tga: 'Willkommen! Ich helfe bei Technischer Gebäudeausrüstung - HVAC, Sanitär, Elektro. Frage mich zu DIN 1988, VDI 6022 oder Heizlastberechnungen.',
      projektmanagement: 'Grüß dich! Ich unterstütze bei Projektmanagement und Baurecht. Frage mich zu VOB, HOAI, Vertragsrecht oder Bauablaufplanung.',
      nachhaltigkeit: 'Hallo! Ich helfe bei nachhaltigem Bauen und Energieeffizienz. Frage mich zu GEG, DGNB, Lebenszyklusanalysen oder erneuerbaren Energien.'
    };

    setMessages([{
      role: 'assistant',
      content: welcomeMessages[fachbereich] || welcomeMessages.hochbau,
      sources: [],
      timestamp: new Date().toISOString()
    }]);
  }, [fachbereich]);

  // Nachricht senden
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isLoading) {
      return;
    }

    const userMessage = inputValue.trim();
    setInputValue('');

    // User-Nachricht hinzufügen
    const newUserMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      // Bereite Conversation History vor (ohne Willkommensnachricht)
      const conversationHistory = messages
        .slice(1) // Erste Nachricht (Willkommen) überspringen
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      // API-Aufruf
      const response = await axios.post(`${API_URL}/api/chat`, {
        message: userMessage,
        fachbereich: fachbereich,
        conversationHistory: conversationHistory
      });

      if (response.data.success) {
        // Assistant-Antwort hinzufügen
        const assistantMessage = {
          role: 'assistant',
          content: response.data.response,
          sources: response.data.sources || [],
          timestamp: response.data.metadata.timestamp,
          usage: response.data.metadata.usage
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(response.data.error || 'Unbekannter Fehler');
      }

    } catch (err) {
      console.error('Fehler beim Senden:', err);
      
      let errorMessage = 'Es ist ein Fehler aufgetreten. Bitte versuche es erneut.';
      
      if (err.response?.status === 429) {
        errorMessage = 'Zu viele Anfragen. Bitte warte einen Moment und versuche es erneut.';
      } else if (err.response?.status === 400) {
        errorMessage = err.response.data.error || 'Ungültige Anfrage.';
      } else if (err.response?.status === 500) {
        errorMessage = 'Serverfehler. Bitte versuche es später erneut.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      // Fehlernachricht als Assistant-Message hinzufügen
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `❌ ${errorMessage}`,
        sources: [],
        timestamp: new Date().toISOString(),
        isError: true
      }]);

    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  // Beispielfragen
  const exampleQuestions = {
    hochbau: [
      'Was sind die Mindestanforderungen an Betonfestigkeitsklassen?',
      'Welche Schallschutzanforderungen gelten für Wohngebäude?',
      'Wie dimensioniere ich eine tragende Wand?'
    ],
    tiefbau: [
      'Welche Verdichtungsgrade sind für Straßenunterbau erforderlich?',
      'Was regelt die ZTV Asphalt-StB?',
      'Wie tief müssen Abwasserleitungen verlegt werden?'
    ],
    ingenieurbau: [
      'Wie berechne ich die Windlast nach Eurocode 1?',
      'Welche Teilsicherheitsbeiwerte gelten für Stahlbeton?',
      'Wann ist eine FEM-Berechnung erforderlich?'
    ],
    ausbau: [
      'Welche Toleranzen gelten für Fliesenverlegung?',
      'Was ist bei hinterlüfteten Fassaden zu beachten?',
      'Wie wird ein Estrich fachgerecht ausgeführt?'
    ],
    tga: [
      'Wie dimensioniere ich eine Trinkwasserinstallation?',
      'Welche Anforderungen gelten für RLT-Anlagen?',
      'Was ist bei der Heizlastberechnung zu beachten?'
    ],
    projektmanagement: [
      'Was sind die Fristen für Mängelrügen nach VOB?',
      'Wie berechne ich das Honorar nach HOAI?',
      'Welche Leistungsphasen gibt es nach HOAI?'
    ],
    nachhaltigkeit: [
      'Welche Anforderungen stellt das GEG an Neubauten?',
      'Wie funktioniert eine DGNB-Zertifizierung?',
      'Was ist eine Lebenszyklusanalyse im Bauwesen?'
    ]
  };

  const handleExampleClick = (question) => {
    setInputValue(question);
    inputRef.current?.focus();
  };

  // Neuer Chat
  const handleNewChat = () => {
    setMessages(messages.slice(0, 1)); // Nur Willkommensnachricht behalten
    setInputValue('');
  };

  return (
    <div className="chat-container">
      {/* Chat Messages */}
      <div className="chat-messages">
        {messages.map((message, index) => (
          <Message key={index} message={message} />
        ))}
        
        {isLoading && (
          <div className="message assistant loading">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <p className="loading-text">Durchsuche Normen und formuliere Antwort...</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Beispielfragen (nur wenn Chat leer) */}
      {messages.length === 1 && !isLoading && (
        <div className="example-questions">
          <h3>💡 Beispielfragen:</h3>
          <div className="examples-grid">
            {(exampleQuestions[fachbereich] || exampleQuestions.hochbau).map((question, index) => (
              <button
                key={index}
                className="example-button"
                onClick={() => handleExampleClick(question)}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Actions */}
      {messages.length > 1 && (
        <div className="chat-actions">
          <button 
            className="action-button secondary"
            onClick={handleNewChat}
            disabled={isLoading}
          >
            🗑️ Neuer Chat
          </button>
          
          <ExportButton 
            messages={messages}
            fachbereich={fachbereich}
          />
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="chat-input-form">
        <div className="input-wrapper">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            placeholder={`Frage zu ${fachbereich === 'hochbau' ? 'Hochbau' : 
                         fachbereich === 'tiefbau' ? 'Tiefbau' : 
                         fachbereich === 'ingenieurbau' ? 'Ingenieurbau' : 
                         fachbereich === 'ausbau' ? 'Ausbau' : 
                         fachbereich === 'tga' ? 'TGA' : 
                         fachbereich === 'projektmanagement' ? 'Projektmanagement' : 
                         'Nachhaltigkeit'} stellen...`}
            disabled={isLoading}
            rows={1}
            className="chat-input"
          />
          
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="send-button"
            title="Nachricht senden (Enter)"
          >
            {isLoading ? '⏳' : '📤'}
          </button>
        </div>
        
        <div className="input-hint">
          <kbd>Enter</kbd> zum Senden · <kbd>Shift + Enter</kbd> für neue Zeile
        </div>
      </form>
    </div>
  );
}

export default Chat;

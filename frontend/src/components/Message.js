// Message.js - Einzelne Nachricht im Chat
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function Message({ message }) {
  const [showSources, setShowSources] = useState(true);

  const isUser = message.role === 'user';
  const isError = message.isError;

  return (
    <div className={`message ${message.role} ${isError ? 'error' : ''}`}>
      {/* Avatar */}
      <div className="message-avatar">
        {isUser ? '👤' : '🤖'}
      </div>

      {/* Content */}
      <div className="message-content">
        {/* Markdown-formatierter Text */}
        <div className="message-text">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              // Custom Rendering für bestimmte Elemente
              a: ({node, ...props}) => (
                <a {...props} target="_blank" rel="noopener noreferrer" />
              ),
              code: ({node, inline, ...props}) => (
                inline ? 
                  <code className="inline-code" {...props} /> : 
                  <code className="code-block" {...props} />
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {/* Quellenangaben (nur für Assistant-Nachrichten) */}
        {!isUser && !isError && message.sources && message.sources.length > 0 && (
          <div className="message-sources">
            <button 
              className="sources-toggle"
              onClick={() => setShowSources(!showSources)}
            >
              📚 {message.sources.length} {message.sources.length === 1 ? 'Quelle' : 'Quellen'}
              <span className={`toggle-icon ${showSources ? 'open' : ''}`}>▼</span>
            </button>

            {showSources && (
              <div className="sources-list">
                {message.sources.map((source, index) => (
                  <div key={index} className="source-item">
                    <div className="source-header">
                      <span className="source-badge">
                        {source.verified ? '✅' : '⚠️'}
                      </span>
                      <strong className="source-norm">{source.norm}</strong>
                      {source.year && (
                        <span className="source-year">:{source.year}</span>
                      )}
                      {source.status === 'zurückgezogen' && (
                        <span className="source-warning" title="Diese Norm wurde zurückgezogen">
                          ⚠️ Zurückgezogen
                        </span>
                      )}
                    </div>

                    {source.section && (
                      <div className="source-section">
                        📄 Abschnitt {source.section}
                      </div>
                    )}

                    {source.title && (
                      <div className="source-title">
                        {source.title}
                      </div>
                    )}

                    {source.status === 'zurückgezogen' && source.warning && (
                      <div className="source-alert">
                        {source.warning}
                      </div>
                    )}

                    <a 
                      href={source.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="source-link"
                      aria-label={`Norm ${source.norm} bei DIN Media nachschlagen`}
                    >
                      🔗 Bei DIN Media nachschlagen
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Timestamp */}
        <div className="message-meta">
          <span className="message-time">
            {new Date(message.timestamp).toLocaleTimeString('de-DE', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
          
          {message.usage && (
            <span className="message-tokens" title="Token-Nutzung">
              📊 {message.usage.inputTokens + message.usage.outputTokens} Tokens
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default Message;

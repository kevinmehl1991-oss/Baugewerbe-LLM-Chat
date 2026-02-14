// ExportButton.js - PDF-Export-Funktionalität
import React, { useState } from 'react';
import { jsPDF } from 'jspdf';

function ExportButton({ messages, fachbereich }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      // Erstelle neues PDF-Dokument
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      let y = margin;

      // Fachbereich-Namen
      const fachbereichNames = {
        hochbau: 'Hochbau',
        tiefbau: 'Tiefbau',
        ingenieurbau: 'Ingenieurbau',
        ausbau: 'Ausbau',
        tga: 'Technische Gebäudeausrüstung',
        projektmanagement: 'Projektmanagement & Baurecht',
        nachhaltigkeit: 'Nachhaltiges Bauen'
      };

      // Header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('BauChat AI - Gesprächsprotokoll', margin, y);
      y += 10;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Fachbereich: ${fachbereichNames[fachbereich]}`, margin, y);
      y += 6;
      doc.text(`Datum: ${new Date().toLocaleDateString('de-DE')}`, margin, y);
      y += 6;
      doc.text(`Uhrzeit: ${new Date().toLocaleTimeString('de-DE')}`, margin, y);
      y += 15;

      // Linie
      doc.setDrawColor(0, 0, 0);
      doc.line(margin, y, pageWidth - margin, y);
      y += 10;

      // Nachrichten durchgehen (Willkommensnachricht überspringen)
      for (let i = 1; i < messages.length; i++) {
        const message = messages[i];

        // Prüfe ob neue Seite nötig
        if (y > pageHeight - 40) {
          doc.addPage();
          y = margin;
        }

        // Rolle
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        const roleText = message.role === 'user' ? 'Frage:' : 'Antwort:';
        doc.text(roleText, margin, y);
        y += 7;

        // Nachrichtentext
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        
        // Text umbrechen
        const lines = doc.splitTextToSize(message.content, maxWidth);
        
        for (const line of lines) {
          if (y > pageHeight - 20) {
            doc.addPage();
            y = margin;
          }
          doc.text(line, margin, y);
          y += 5;
        }

        y += 5;

        // Quellenangaben (wenn vorhanden)
        if (message.sources && message.sources.length > 0) {
          if (y > pageHeight - 30) {
            doc.addPage();
            y = margin;
          }

          doc.setFont('helvetica', 'bold');
          doc.text('Quellen:', margin, y);
          y += 6;

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);

          for (const source of message.sources) {
            if (y > pageHeight - 15) {
              doc.addPage();
              y = margin;
            }

            let sourceText = `• ${source.norm}`;
            if (source.year) sourceText += `:${source.year}`;
            if (source.section) sourceText += `, Abschnitt ${source.section}`;
            
            const sourceLines = doc.splitTextToSize(sourceText, maxWidth - 5);
            for (const line of sourceLines) {
              doc.text(line, margin + 3, y);
              y += 4;
            }

            if (source.title) {
              doc.setFont('helvetica', 'italic');
              const titleLines = doc.splitTextToSize(`  ${source.title}`, maxWidth - 5);
              for (const line of titleLines) {
                if (y > pageHeight - 10) {
                  doc.addPage();
                  y = margin;
                }
                doc.text(line, margin + 3, y);
                y += 4;
              }
              doc.setFont('helvetica', 'normal');
            }

            y += 2;
          }

          y += 3;
        }

        // Trennlinie
        if (y > pageHeight - 15) {
          doc.addPage();
          y = margin;
        }
        
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, y, pageWidth - margin, y);
        y += 10;
      }

      // Footer auf jeder Seite
      const totalPages = doc.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(128, 128, 128);
        
        const footerText = `Seite ${i} von ${totalPages} | Erstellt mit BauChat AI | Für rechtsverbindliche Auskünfte konsultieren Sie bitte die Original-Normen`;
        const footerWidth = doc.getTextWidth(footerText);
        doc.text(footerText, (pageWidth - footerWidth) / 2, pageHeight - 10);
      }

      // PDF speichern
      const filename = `BauChat_${fachbereich}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);

      console.log('✅ PDF erfolgreich exportiert:', filename);

    } catch (error) {
      console.error('❌ Fehler beim PDF-Export:', error);
      alert('Fehler beim Erstellen der PDF. Bitte versuche es erneut.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      className="action-button primary"
      onClick={handleExport}
      disabled={isExporting || messages.length <= 1}
      title="Chat als PDF exportieren"
    >
      {isExporting ? '⏳ Erstelle PDF...' : '📄 Als PDF exportieren'}
    </button>
  );
}

export default ExportButton;

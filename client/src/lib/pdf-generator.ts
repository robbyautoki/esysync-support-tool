import jsPDF from 'jspdf';

interface PDFData {
  rmaNumber: string;
  customerNumber: string;
  errorType: string;
  shippingMethod: string;
  address: string;
  accountNumber?: string;
  displayNumber?: string;
  displayLocation?: string;
  contactEmail?: string;
}

export function generatePDF(data: PDFData) {
  try {
    const pdf = new jsPDF();
    
    // Header
    pdf.setFontSize(20);
    pdf.setTextColor(109, 13, 240); // Purple color
    pdf.text('ESYSYNC Service Center', 105, 30, { align: 'center' });
    
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text('RMA-Dokument', 105, 45, { align: 'center' });
    
    // Line separator
    pdf.setLineWidth(0.5);
    pdf.setDrawColor(109, 13, 240);
    pdf.line(20, 55, 190, 55);
    
    // Content
    let yPosition = 70;
    const lineHeight = 10;
    
    // RMA Information
    pdf.setFontSize(12);
    pdf.setTextColor(80, 80, 80);
    pdf.text('RMA-Nummer:', 20, yPosition);
    pdf.setTextColor(0, 0, 0);
    pdf.text(data.rmaNumber, 80, yPosition);
    yPosition += lineHeight;
    
    pdf.setTextColor(80, 80, 80);
    pdf.text('Account-Nummer:', 20, yPosition);
    pdf.setTextColor(0, 0, 0);
    pdf.text(data.accountNumber || data.customerNumber, 80, yPosition);
    yPosition += lineHeight;
    
    if (data.displayNumber) {
      pdf.setTextColor(80, 80, 80);
      pdf.text('Display-Nummer:', 20, yPosition);
      pdf.setTextColor(0, 0, 0);
      pdf.text(data.displayNumber, 80, yPosition);
      yPosition += lineHeight;
    }
    
    if (data.displayLocation) {
      pdf.setTextColor(80, 80, 80);
      pdf.text('Display-Standort:', 20, yPosition);
      pdf.setTextColor(0, 0, 0);
      pdf.text(data.displayLocation, 80, yPosition);
      yPosition += lineHeight;
    }
    
    if (data.contactEmail) {
      pdf.setTextColor(80, 80, 80);
      pdf.text('Kontakt-E-Mail:', 20, yPosition);
      pdf.setTextColor(0, 0, 0);
      pdf.text(data.contactEmail, 80, yPosition);
      yPosition += lineHeight;
    }
    
    pdf.setTextColor(80, 80, 80);
    pdf.text('Problem:', 20, yPosition);
    pdf.setTextColor(0, 0, 0);
    pdf.text(data.errorType, 80, yPosition);
    yPosition += lineHeight;
    
    // Shipping method translation
    const shippingMethodMap: { [key: string]: string } = {
      'own-package': 'Eigene Verpackung',
      'avantor-box': 'Avantor Box',
      'complete-replacement': 'Kompletttausch',
      'technician': 'Techniker-Abholung'
    };
    
    pdf.setTextColor(80, 80, 80);
    pdf.text('Versandoption:', 20, yPosition);
    pdf.setTextColor(0, 0, 0);
    pdf.text(shippingMethodMap[data.shippingMethod] || data.shippingMethod, 80, yPosition);
    yPosition += lineHeight + 10;
    
    // Address section
    pdf.setFontSize(14);
    pdf.setTextColor(109, 13, 240);
    pdf.text('Versandadresse:', 20, yPosition);
    yPosition += 10;
    
    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0);
    const addressLines = data.address.split('\n');
    addressLines.forEach(line => {
      if (line.trim()) {
        pdf.text(line, 20, yPosition);
        yPosition += 6;
      }
    });
    
    // Return address section
    yPosition += 10;
    pdf.setFontSize(14);
    pdf.setTextColor(109, 13, 240);
    pdf.text('Rücksende-Adresse:', 20, yPosition);
    yPosition += 10;
    
    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0);
    pdf.text('AVANTO VR Solutions GmbH', 20, yPosition);
    yPosition += 6;
    pdf.text('Otto-Lilienthal-Str. 20', 20, yPosition);
    yPosition += 6;
    pdf.text('28199 Bremen', 20, yPosition);
    
    // Footer
    pdf.setFontSize(10);
    pdf.setTextColor(120, 120, 120);
    const currentDate = new Date().toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    pdf.text(`Erstellt am: ${currentDate}`, 20, 280);
    
    // Company info
    pdf.text('ESYSYNC Service Center', 105, 280, { align: 'center' });
    
    // Download the PDF
    pdf.save(`RMA-${data.rmaNumber}.pdf`);
  } catch (error) {
    console.error('PDF generation error:', error);
    
    // If PDF fails, let's try a simpler approach without the { align: 'center' } option
    try {
      const pdf = new jsPDF();
      
      pdf.setFontSize(18);
      pdf.text('ESYSYNC Service Center', 60, 30);
      pdf.setFontSize(14);
      pdf.text('RMA-Dokument', 80, 45);
      
      pdf.setLineWidth(0.5);
      pdf.line(20, 55, 190, 55);
      
      let y = 70;
      const gap = 10;
      
      pdf.setFontSize(12);
      pdf.text(`RMA-Nummer: ${data.rmaNumber}`, 20, y);
      y += gap;
      
      pdf.text(`Account-Nummer: ${data.accountNumber || data.customerNumber}`, 20, y);
      y += gap;
      
      if (data.displayNumber) {
        pdf.text(`Display-Nummer: ${data.displayNumber}`, 20, y);
        y += gap;
      }
      
      if (data.displayLocation) {
        pdf.text(`Display-Standort: ${data.displayLocation}`, 20, y);
        y += gap;
      }
      
      if (data.contactEmail) {
        pdf.text(`Kontakt-E-Mail: ${data.contactEmail}`, 20, y);
        y += gap;
      }
      
      pdf.text(`Problem: ${data.errorType}`, 20, y);
      y += gap;
      
      const shippingMethodMap: { [key: string]: string } = {
        'own-package': 'Eigene Verpackung',
        'avantor-box': 'Avantor Box',
        'complete-replacement': 'Kompletttausch',
        'technician': 'Techniker-Abholung'
      };
      
      pdf.text(`Versandoption: ${shippingMethodMap[data.shippingMethod] || data.shippingMethod}`, 20, y);
      y += gap + 10;
      
      pdf.text('Versandadresse:', 20, y);
      y += gap;
      
      pdf.setFontSize(11);
      const addressLines = data.address.split('\n');
      addressLines.forEach(line => {
        if (line.trim()) {
          pdf.text(line, 20, y);
          y += 6;
        }
      });
      
      y += gap;
      pdf.setFontSize(12);
      pdf.text('Rücksende-Adresse:', 20, y);
      y += gap;
      
      pdf.setFontSize(11);
      pdf.text('AVANTO VR Solutions GmbH', 20, y);
      y += 6;
      pdf.text('Otto-Lilienthal-Str. 20', 20, y);
      y += 6;
      pdf.text('28199 Bremen', 20, y);
      
      pdf.setFontSize(10);
      pdf.text(`Erstellt am: ${new Date().toLocaleDateString('de-DE')}`, 20, 280);
      pdf.text('ESYSYNC Service Center', 80, 280);
      
      pdf.save(`RMA-${data.rmaNumber}.pdf`);
    } catch (fallbackError) {
      console.error('Fallback PDF generation also failed:', fallbackError);
      
      // Last resort: create a simple text file
      const content = `RMA-Dokument
      
RMA-Nummer: ${data.rmaNumber}
Account-Nummer: ${data.accountNumber || data.customerNumber}
${data.displayNumber ? `Display-Nummer: ${data.displayNumber}` : ''}
${data.displayLocation ? `Display-Standort: ${data.displayLocation}` : ''}
${data.contactEmail ? `Kontakt-E-Mail: ${data.contactEmail}` : ''}
Problem: ${data.errorType}
Versandoption: ${data.shippingMethod}

Versandadresse:
${data.address}

Rücksende-Adresse:
AVANTO VR Solutions GmbH
Otto-Lilienthal-Str. 20
28199 Bremen

Erstellt am: ${new Date().toLocaleDateString('de-DE')}`;
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `RMA-${data.rmaNumber}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }
}

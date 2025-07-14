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
    pdf.text('Kundennummer:', 20, yPosition);
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
    pdf.text('Fehlerbeschreibung:', 20, yPosition);
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
    yPosition += lineHeight + 5;
    
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
    // Fallback: create a simple text file
    const content = `RMA-Dokument
    
RMA-Nummer: ${data.rmaNumber}
Kundennummer: ${data.accountNumber || data.customerNumber}
${data.displayNumber ? `Display-Nummer: ${data.displayNumber}` : ''}
${data.displayLocation ? `Display-Standort: ${data.displayLocation}` : ''}
${data.contactEmail ? `Kontakt-E-Mail: ${data.contactEmail}` : ''}
Fehlerbeschreibung: ${data.errorType}
Versandoption: ${data.shippingMethod}

Versandadresse:
${data.address}

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

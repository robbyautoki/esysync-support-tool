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
  const pdf = new jsPDF();
  
  // Set font
  pdf.setFont('helvetica');
  
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
  const lineHeight = 8;
  
  // Helper function to add a row
  const addRow = (label: string, value: string) => {
    pdf.setFontSize(12);
    pdf.setTextColor(80, 80, 80);
    pdf.text(label, 20, yPosition);
    pdf.setTextColor(0, 0, 0);
    pdf.text(value, 80, yPosition);
    yPosition += lineHeight;
  };
  
  // RMA Information
  addRow('RMA-Nummer:', data.rmaNumber);
  addRow('Kundennummer:', data.accountNumber || data.customerNumber);
  
  if (data.displayNumber) {
    addRow('Display-Nummer:', data.displayNumber);
  }
  
  if (data.displayLocation) {
    addRow('Display-Standort:', data.displayLocation);
  }
  
  if (data.contactEmail) {
    addRow('Kontakt-E-Mail:', data.contactEmail);
  }
  
  addRow('Fehlerbeschreibung:', data.errorType);
  
  // Shipping method translation
  const shippingMethodMap: { [key: string]: string } = {
    'own-package': 'Eigene Verpackung',
    'avantor-box': 'Avantor Box',
    'complete-replacement': 'Kompletttausch',
    'technician': 'Techniker-Abholung'
  };
  
  addRow('Versandoption:', shippingMethodMap[data.shippingMethod] || data.shippingMethod);
  
  // Address section
  yPosition += 5;
  pdf.setFontSize(14);
  pdf.setTextColor(109, 13, 240);
  pdf.text('Versandadresse:', 20, yPosition);
  yPosition += 10;
  
  pdf.setFontSize(11);
  pdf.setTextColor(0, 0, 0);
  const addressLines = data.address.split('\n');
  addressLines.forEach(line => {
    pdf.text(line, 20, yPosition);
    yPosition += 6;
  });
  
  // Footer
  pdf.setFontSize(10);
  pdf.setTextColor(120, 120, 120);
  pdf.text(`Erstellt am: ${new Date().toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`, 20, 280);
  
  // Company info
  pdf.text('ESYSYNC Service Center', 105, 280, { align: 'center' });
  
  // Download the PDF
  pdf.save(`RMA-${data.rmaNumber}.pdf`);
}

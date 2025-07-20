import jsPDF from 'jspdf';
import logoPath from "@assets/logo.png";

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
  // New shipping and contact person fields
  alternativeShipping?: boolean;
  alternativeAddress?: string;
  alternativeCity?: string;
  alternativeZip?: string;
  contactPerson?: string;
  contactTitle?: string;
}

export function generatePDF(data: PDFData) {
  try {
    const pdf = new jsPDF();
    
    // Modern Apple-Style Header
    // Background subtle gradient effect (simulated with light gray)
    pdf.setFillColor(248, 250, 252); // Very light gray
    pdf.rect(0, 0, 210, 60, 'F');
    
    // Logo - larger and better positioned
    try {
      const img = new Image();
      img.src = logoPath;
      pdf.addImage(img, 'PNG', 20, 15, 40, 20); // Larger logo: x, y, width, height
    } catch (logoError) {
      console.log('Logo could not be added to PDF');
    }
    
    // Modern typography hierarchy
    pdf.setFontSize(24);
    pdf.setTextColor(59, 130, 246); // Modern blue instead of purple
    pdf.text('ESYSYNC Service Center', 105, 25, { align: 'center' });
    
    pdf.setFontSize(18);
    pdf.setTextColor(75, 85, 99); // Modern gray
    pdf.text('RMA-Dokument', 105, 40, { align: 'center' });
    
    // Modern subtle line separator
    pdf.setLineWidth(1);
    pdf.setDrawColor(229, 231, 235); // Light gray line
    pdf.line(20, 50, 190, 50);
    
    // Content with modern spacing
    let yPosition = 75;
    const lineHeight = 14; // More generous spacing
    
    // Modern Card-Style Information Sections
    
    // Section: Ticket Information
    pdf.setFillColor(249, 250, 251); // Very light background
    pdf.roundedRect(20, yPosition - 5, 170, 30, 3, 3, 'F');
    
    pdf.setFontSize(14);
    pdf.setTextColor(59, 130, 246); // Section header in blue
    pdf.text('Ticket-Informationen', 25, yPosition + 5);
    yPosition += 15;
    
    pdf.setFontSize(11);
    pdf.setTextColor(75, 85, 99);
    pdf.text('RMA-Nummer:', 25, yPosition);
    pdf.setTextColor(31, 41, 55); // Darker for values
    pdf.setFont(undefined, 'bold');
    pdf.text(data.rmaNumber, 100, yPosition);
    pdf.setFont(undefined, 'normal');
    yPosition += lineHeight;
    
    pdf.setTextColor(75, 85, 99);
    pdf.text('Account-Nummer:', 25, yPosition);
    pdf.setTextColor(31, 41, 55);
    pdf.setFont(undefined, 'bold');
    pdf.text(data.accountNumber || data.customerNumber, 100, yPosition);
    pdf.setFont(undefined, 'normal');
    yPosition += 20;
    
    // Section: Display Information
    if (data.displayNumber || data.displayLocation) {
      pdf.setFillColor(249, 250, 251);
      const sectionHeight = (data.displayNumber && data.displayLocation) ? 35 : 25;
      pdf.roundedRect(20, yPosition - 5, 170, sectionHeight, 3, 3, 'F');
      
      pdf.setFontSize(14);
      pdf.setTextColor(59, 130, 246);
      pdf.text('Display-Informationen', 25, yPosition + 5);
      yPosition += 15;
      
      pdf.setFontSize(11);
      if (data.displayNumber) {
        pdf.setTextColor(75, 85, 99);
        pdf.text('Display-Nummer:', 25, yPosition);
        pdf.setTextColor(31, 41, 55);
        pdf.setFont(undefined, 'bold');
        pdf.text(data.displayNumber, 100, yPosition);
        pdf.setFont(undefined, 'normal');
        yPosition += lineHeight;
      }
      
      if (data.displayLocation) {
        pdf.setTextColor(75, 85, 99);
        pdf.text('Display-Standort:', 25, yPosition);
        pdf.setTextColor(31, 41, 55);
        pdf.setFont(undefined, 'bold');
        pdf.text(data.displayLocation, 100, yPosition);
        pdf.setFont(undefined, 'normal');
        yPosition += lineHeight;
      }
      yPosition += 10;
    }
    
    // Section: Contact Information
    const hasContactInfo = data.contactEmail || data.contactPerson;
    if (hasContactInfo) {
      const contactSectionHeight = (data.contactEmail && data.contactPerson) ? 35 : 25;
      pdf.setFillColor(249, 250, 251);
      pdf.roundedRect(20, yPosition - 5, 170, contactSectionHeight, 3, 3, 'F');
      
      pdf.setFontSize(14);
      pdf.setTextColor(59, 130, 246);
      pdf.text('Kontakt-Informationen', 25, yPosition + 5);
      yPosition += 15;
      
      pdf.setFontSize(11);
      if (data.contactEmail) {
        pdf.setTextColor(75, 85, 99);
        pdf.text('E-Mail:', 25, yPosition);
        pdf.setTextColor(31, 41, 55);
        pdf.setFont(undefined, 'bold');
        
        // Handle long email addresses elegantly
        const emailLength = data.contactEmail.length;
        if (emailLength > 30) {
          pdf.setFontSize(9);
          pdf.text(data.contactEmail, 25, yPosition + 6);
          pdf.setFontSize(11);
          yPosition += 8;
        } else {
          pdf.text(data.contactEmail, 55, yPosition);
        }
        pdf.setFont(undefined, 'normal');
        yPosition += lineHeight;
      }
      
      if (data.contactPerson) {
        pdf.setTextColor(75, 85, 99);
        pdf.text('Ansprechpartner:', 25, yPosition);
        pdf.setTextColor(31, 41, 55);
        pdf.setFont(undefined, 'bold');
        const contactText = `${data.contactTitle || 'Frau'} ${data.contactPerson}`;
        pdf.text(contactText, 85, yPosition);
        pdf.setFont(undefined, 'normal');
        yPosition += lineHeight;
      }
      yPosition += 10;
    }
    
    // Section: Service Information
    pdf.setFillColor(249, 250, 251);
    pdf.roundedRect(20, yPosition - 5, 170, 35, 3, 3, 'F');
    
    pdf.setFontSize(14);
    pdf.setTextColor(59, 130, 246);
    pdf.text('Service-Details', 25, yPosition + 5);
    yPosition += 15;
    
    pdf.setFontSize(11);
    pdf.setTextColor(75, 85, 99);
    pdf.text('Problem:', 25, yPosition);
    pdf.setTextColor(31, 41, 55);
    pdf.setFont(undefined, 'bold');
    pdf.text(data.errorType, 65, yPosition);
    pdf.setFont(undefined, 'normal');
    yPosition += lineHeight;
    
    // Shipping method translation
    const shippingMethodMap: { [key: string]: string } = {
      'own-package': 'Eigene Verpackung',
      'avantor-box': 'Avantor Box',
      'complete-replacement': 'Kompletttausch',
      'technician': 'Techniker-Abholung'
    };
    
    pdf.setTextColor(75, 85, 99);
    pdf.text('Versandoption:', 25, yPosition);
    pdf.setTextColor(31, 41, 55);
    pdf.setFont(undefined, 'bold');
    pdf.text(shippingMethodMap[data.shippingMethod] || data.shippingMethod, 85, yPosition);
    pdf.setFont(undefined, 'normal');
    yPosition += 20;
    
    // Section: Shipping Address
    const addressSectionHeight = data.address.split('\n').length * 8 + 20;
    pdf.setFillColor(249, 250, 251);
    pdf.roundedRect(20, yPosition - 5, 170, addressSectionHeight, 3, 3, 'F');
    
    pdf.setFontSize(14);
    pdf.setTextColor(59, 130, 246);
    pdf.text('Versandadresse', 25, yPosition + 5);
    yPosition += 15;
    
    pdf.setFontSize(11);
    pdf.setTextColor(31, 41, 55);
    pdf.setFont(undefined, 'bold');
    const addressLines = data.address.split('\n');
    addressLines.forEach(line => {
      if (line.trim()) {
        pdf.text(line, 25, yPosition);
        yPosition += 8;
      }
    });
    pdf.setFont(undefined, 'normal');
    yPosition += 10;
    
    // Alternative shipping address if provided
    if (data.alternativeShipping && data.alternativeAddress) {
      const altAddressHeight = 30 + (data.alternativeZip && data.alternativeCity ? 10 : 0);
      pdf.setFillColor(254, 249, 195); // Light yellow background for alternative
      pdf.roundedRect(20, yPosition - 5, 170, altAddressHeight, 3, 3, 'F');
      
      pdf.setFontSize(14);
      pdf.setTextColor(245, 158, 11); // Amber color
      pdf.text('Alternative Versandadresse', 25, yPosition + 5);
      yPosition += 15;
      
      pdf.setFontSize(11);
      pdf.setTextColor(31, 41, 55);
      pdf.setFont(undefined, 'bold');
      pdf.text(data.alternativeAddress, 25, yPosition);
      yPosition += 8;
      if (data.alternativeZip && data.alternativeCity) {
        pdf.text(`${data.alternativeZip} ${data.alternativeCity}`, 25, yPosition);
        yPosition += 8;
      }
      pdf.setFont(undefined, 'normal');
      yPosition += 10;
    }
    
    // Section: Return Address
    pdf.setFillColor(254, 242, 242); // Light red background
    pdf.roundedRect(20, yPosition - 5, 170, 40, 3, 3, 'F');
    
    pdf.setFontSize(14);
    pdf.setTextColor(239, 68, 68); // Red color
    pdf.text('Rücksende-Adresse', 25, yPosition + 5);
    yPosition += 15;
    
    pdf.setFontSize(11);
    pdf.setTextColor(31, 41, 55);
    pdf.setFont(undefined, 'bold');
    pdf.text('AVANTO VR Solutions GmbH', 25, yPosition);
    yPosition += 8;
    pdf.text('Otto-Lilienthal-Str. 20', 25, yPosition);
    yPosition += 8;
    pdf.text('28199 Bremen', 25, yPosition);
    pdf.setFont(undefined, 'normal');
    
    // Modern Footer
    yPosition = 280;
    pdf.setFontSize(9);
    pdf.setTextColor(156, 163, 175); // Light gray
    const currentDate = new Date().toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    pdf.text(`Erstellt am: ${currentDate}`, 20, yPosition);
    
    // Right-aligned company info
    pdf.setTextColor(59, 130, 246);
    pdf.setFont(undefined, 'bold');
    pdf.text('ESYSYNC Service Center', 190, yPosition, { align: 'right' });
    pdf.setFont(undefined, 'normal');
    
    // Download the PDF
    pdf.save(`RMA-${data.rmaNumber}.pdf`);
  } catch (error) {
    console.error('PDF generation error:', error);
    
    // Fallback PDF with simpler but still modern design
    try {
      const pdf = new jsPDF();
      
      // Simple header background
      pdf.setFillColor(248, 250, 252);
      pdf.rect(0, 0, 210, 50, 'F');
      
      // Logo in fallback
      try {
        const img = new Image();
        img.src = logoPath;
        pdf.addImage(img, 'PNG', 20, 15, 35, 18);
      } catch (logoError) {
        console.log('Logo could not be added to fallback PDF');
      }
      
      pdf.setFontSize(20);
      pdf.setTextColor(59, 130, 246);
      pdf.text('ESYSYNC Service Center', 105, 25, { align: 'center' });
      pdf.setFontSize(16);
      pdf.setTextColor(75, 85, 99);
      pdf.text('RMA-Dokument', 105, 38, { align: 'center' });
      
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
        // Handle long emails in fallback PDF too
        const emailText = `Kontakt-E-Mail: ${data.contactEmail}`;
        if (data.contactEmail.length > 25) {
          pdf.text('Kontakt-E-Mail:', 20, y);
          y += 5;
          pdf.setFontSize(10);
          pdf.text(data.contactEmail, 20, y);
          pdf.setFontSize(12);
          y += gap;
        } else {
          pdf.text(emailText, 20, y);
          y += gap;
        }
      }
      
      // Contact person information in fallback
      if (data.contactPerson) {
        const contactText = `Ansprechpartner: ${data.contactTitle || 'Frau'} ${data.contactPerson}`;
        pdf.text(contactText, 20, y);
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
      
      // Alternative shipping address in fallback
      if (data.alternativeShipping && data.alternativeAddress) {
        y += gap;
        pdf.setFontSize(12);
        pdf.text('Alternative Versandadresse:', 20, y);
        y += gap;
        
        pdf.setFontSize(11);
        pdf.text(data.alternativeAddress, 20, y);
        y += 6;
        if (data.alternativeZip && data.alternativeCity) {
          pdf.text(`${data.alternativeZip} ${data.alternativeCity}`, 20, y);
          y += 6;
        }
      }
      
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
${data.contactPerson ? `Ansprechpartner: ${data.contactTitle || 'Frau'} ${data.contactPerson}` : ''}
Problem: ${data.errorType}
Versandoption: ${data.shippingMethod}

Versandadresse:
${data.address}

${data.alternativeShipping && data.alternativeAddress ? `Alternative Versandadresse:
${data.alternativeAddress}
${data.alternativeZip ? `${data.alternativeZip} ${data.alternativeCity}` : ''}

` : ''}Rücksende-Adresse:
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

export interface RepairReportData {
  rmaNumber: string;
  customerData: {
    accountNumber: string;
    displayNumber: string;
    displayLocation: string;
    email: string;
  };
  errorType: string;
  status: string;
  assignedTo?: string;
  processor?: string;
  priorityLevel?: string;
  notes?: string;
  repairDetails?: string;
  repairLog?: string;
  createdAt: string;
  updatedAt: string;
  shippingMethod?: string;
}

export function generateRepairReportPDF(data: RepairReportData) {
  try {
    const pdf = new jsPDF();
    
    // Header
    pdf.setFontSize(18);
    pdf.setTextColor(109, 13, 240);
    pdf.text('ESYSYNC Service Center', 60, 30);
    
    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Reparatur-Bericht', 80, 45);
    
    // Line separator
    pdf.setLineWidth(0.5);
    pdf.line(20, 55, 190, 55);
    
    // Content
    let yPosition = 70;
    const lineHeight = 8;
    
    // Ticket Information
    pdf.setFontSize(12);
    pdf.text(`RMA-Nummer: ${data.rmaNumber}`, 20, yPosition);
    yPosition += lineHeight;
    
    const statusMap: {[key: string]: string} = {
      'pending': 'Ausstehend',
      'workshop': 'In Bearbeitung',
      'shipped': 'Versendet',
      'completed': 'Abgeschlossen'
    };
    pdf.text(`Status: ${statusMap[data.status] || data.status}`, 20, yPosition);
    yPosition += lineHeight;
    
    if (data.priorityLevel) {
      const priorityMap: {[key: string]: string} = {
        'normal': 'Normal',
        'high': 'Hoch',
        'urgent': 'Dringend'
      };
      pdf.text(`Priorität: ${priorityMap[data.priorityLevel] || data.priorityLevel}`, 20, yPosition);
      yPosition += lineHeight;
    }
    
    yPosition += 5;
    
    // Customer Information
    pdf.setFontSize(14);
    pdf.setTextColor(109, 13, 240);
    pdf.text('Kundeninformationen', 20, yPosition);
    yPosition += 10;
    
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Account-Nummer: ${data.customerData.accountNumber}`, 20, yPosition);
    yPosition += lineHeight;
    
    pdf.text(`Display-Nummer: ${data.customerData.displayNumber}`, 20, yPosition);
    yPosition += lineHeight;
    
    pdf.text(`Display-Standort: ${data.customerData.displayLocation}`, 20, yPosition);
    yPosition += lineHeight;
    
    pdf.text(`E-Mail: ${data.customerData.email}`, 20, yPosition);
    yPosition += lineHeight + 5;
    
    // Technical Information
    pdf.setFontSize(14);
    pdf.setTextColor(109, 13, 240);
    pdf.text('Technische Informationen', 20, yPosition);
    yPosition += 10;
    
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Problem: ${data.errorType}`, 20, yPosition);
    yPosition += lineHeight;
    
    if (data.assignedTo) {
      pdf.text(`Zuständig: ${data.assignedTo}`, 20, yPosition);
      yPosition += lineHeight;
    }
    
    if (data.processor) {
      pdf.text(`Bearbeiter: ${data.processor}`, 20, yPosition);
      yPosition += lineHeight;
    }
    
    yPosition += 5;
    
    // Repair Details
    if (data.repairDetails) {
      pdf.setFontSize(14);
      pdf.setTextColor(109, 13, 240);
      pdf.text('Reparatur-Details', 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      const repairLines = pdf.splitTextToSize(data.repairDetails, 170);
      pdf.text(repairLines, 20, yPosition);
      yPosition += repairLines.length * lineHeight + 5;
    }
    
    // Repair Log
    if (data.repairLog) {
      pdf.setFontSize(14);
      pdf.setTextColor(109, 13, 240);
      pdf.text('Reparatur-Log', 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      const logLines = pdf.splitTextToSize(data.repairLog, 170);
      pdf.text(logLines, 20, yPosition);
      yPosition += logLines.length * lineHeight + 5;
    }
    
    // Notes
    if (data.notes) {
      pdf.setFontSize(14);
      pdf.setTextColor(109, 13, 240);
      pdf.text('Notizen', 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      const noteLines = pdf.splitTextToSize(data.notes, 170);
      pdf.text(noteLines, 20, yPosition);
      yPosition += noteLines.length * lineHeight + 5;
    }
    
    // Footer
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Erstellt: ${new Date().toLocaleDateString('de-DE')} um ${new Date().toLocaleTimeString('de-DE')}`, 20, 250);
    pdf.text(`Ticket erstellt: ${new Date(data.createdAt).toLocaleDateString('de-DE')}`, 20, 260);
    if (data.updatedAt && data.updatedAt !== data.createdAt) {
      pdf.text(`Letzte Änderung: ${new Date(data.updatedAt).toLocaleDateString('de-DE')}`, 20, 270);
    }
    
    // Save the PDF
    pdf.save(`Reparatur-Bericht-${data.rmaNumber}.pdf`);
    
  } catch (error) {
    console.error('Repair report PDF generation error:', error);
    alert('Fehler beim Erstellen des Reparatur-Berichts. Bitte versuchen Sie es erneut.');
  }
}

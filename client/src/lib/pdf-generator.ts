interface PDFData {
  rmaNumber: string;
  customerNumber: string;
  errorType: string;
  shippingMethod: string;
  address: string;
}

export function generatePDF(data: PDFData) {
  // Create a simple PDF content as HTML for now
  // In a real implementation, you would use jsPDF or similar
  const pdfContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>RMA-Dokument ${data.rmaNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; margin-bottom: 40px; }
        .info-row { margin: 10px 0; display: flex; }
        .label { font-weight: bold; width: 200px; }
        .value { flex: 1; }
        .address { margin-top: 30px; padding: 20px; background: #f5f5f5; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>AVANTOR Service Center</h1>
        <h2>RMA-Dokument</h2>
      </div>
      
      <div class="info-row">
        <div class="label">RMA-Nummer:</div>
        <div class="value">${data.rmaNumber}</div>
      </div>
      
      <div class="info-row">
        <div class="label">Kundennummer:</div>
        <div class="value">${data.customerNumber}</div>
      </div>
      
      <div class="info-row">
        <div class="label">Fehlerbeschreibung:</div>
        <div class="value">${data.errorType}</div>
      </div>
      
      <div class="info-row">
        <div class="label">Versandoption:</div>
        <div class="value">${data.shippingMethod}</div>
      </div>
      
      <div class="address">
        <h3>Versandadresse:</h3>
        <p>${data.address.replace(/\n/g, '<br>')}</p>
      </div>
      
      <p style="margin-top: 30px; font-size: 12px; color: #666;">
        Erstellt am: ${new Date().toLocaleDateString('de-DE')}
      </p>
    </body>
    </html>
  `;

  // Create a blob and download it
  const blob = new Blob([pdfContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `RMA-${data.rmaNumber}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

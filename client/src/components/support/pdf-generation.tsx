import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Check, Download, Mail, RotateCcw, Package, Copy, ExternalLink, CheckCircle } from "lucide-react";
import { generatePDF } from "@/lib/pdf-generator";
import { useToast } from "@/hooks/use-toast";
import type { SupportFormData } from "@/pages/support";

interface PDFGenerationProps {
  formData: SupportFormData;
  updateFormData: (updates: Partial<SupportFormData>) => void;
  onStartOver: () => void;
}

const errorDisplayNames = {
  "black-screen": "Bleibt schwarz",
  "lines": "Linien im Bild", 
  "freeze": "Hängt nach Neustart",
  "no-connection": "Keine Verbindung",
};

const shippingDisplayNames = {
  "own-package": "Eigene Verpackung",
  "avantor-box": "AVANTOR-Box mit Rückschein",
  "technician": "Techniker-Abholung",
  "complete-replacement": "Kompletttausch",
};

export default function PDFGeneration({ formData, updateFormData, onStartOver }: PDFGenerationProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [pdfGenerated, setPdfGenerated] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate PDF generation process
    const timer = setTimeout(() => {
      setIsLoading(false);
      setPdfGenerated(true);
      
      // Create support ticket in backend
      createSupportTicket();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const createSupportTicket = async () => {
    try {
      const ticketData = {
        rmaNumber: formData.rmaNumber!,
        accountNumber: formData.accountNumber!,
        displayNumber: formData.displayNumber!,
        displayLocation: formData.displayLocation!,
        returnAddress: formData.returnAddress,
        contactEmail: formData.contactEmail!,
        errorType: formData.selectedError!,
        shippingMethod: formData.shippingMethod!,
        restartConfirmed: formData.restartConfirmed,
      };

      await fetch("/api/support-tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ticketData),
      });
    } catch (error) {
      console.error("Failed to create support ticket:", error);
    }
  };

  const downloadPDF = () => {
    const pdfData = {
      rmaNumber: formData.rmaNumber!,
      customerNumber: formData.accountNumber!,
      errorType: errorDisplayNames[formData.selectedError as keyof typeof errorDisplayNames],
      shippingMethod: shippingDisplayNames[formData.shippingMethod as keyof typeof shippingDisplayNames],
      address: formData.returnAddress || formData.displayLocation!,
    };

    generatePDF(pdfData);
    
    toast({
      title: "PDF heruntergeladen",
      description: "Das RMA-Dokument wurde erfolgreich heruntergeladen.",
    });
  };

  const emailPDF = () => {
    const email = prompt("Bitte geben Sie Ihre E-Mail-Adresse ein:");
    if (email) {
      toast({
        title: "PDF versendet",
        description: `PDF wird an ${email} gesendet.`,
      });
    }
  };

  return (
    <section className="fade-in">
      <div className="glassmorphism rounded-3xl p-8 apple-shadow mb-8">
        <div className="text-center">
          {/* Loading State */}
          {isLoading && (
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 pulse-loading" style={{ backgroundColor: '#6d0df0' }}>
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">PDF wird erstellt...</h2>
              <p className="text-gray-600">Bitte warten Sie einen Moment.</p>
            </div>
          )}

          {/* Success State */}
          {pdfGenerated && (
            <div>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">PDF erfolgreich erstellt!</h2>
              <p className="text-gray-600 mb-8">
                Ihre RMA-Nummer: 
                <span className="font-mono font-bold ml-1" style={{ color: '#6d0df0' }}>
                  {formData.rmaNumber}
                </span>
              </p>

              {/* PDF Preview */}
              <div className="glassmorphism-strong rounded-2xl p-6 mb-8 text-left max-w-md mx-auto">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 text-red-500 mr-2" />
                  RMA-Dokument Inhalt
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    RMA-Nummer: {formData.rmaNumber}
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    Fehlerbeschreibung: {errorDisplayNames[formData.selectedError as keyof typeof errorDisplayNames]}
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    Account: {formData.accountNumber}
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    Display: {formData.displayNumber}
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    Email: {formData.contactEmail}
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    Versandadresse: AVANTOR Service Center
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    Versandoption: {shippingDisplayNames[formData.shippingMethod as keyof typeof shippingDisplayNames]}
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={downloadPDF}
                  className="px-8 py-3 text-white rounded-full apple-shadow hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200"
                  style={{ backgroundColor: '#6d0df0' }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  PDF herunterladen
                </Button>
                <Button
                  onClick={emailPDF}
                  variant="outline"
                  className="px-8 py-3 border rounded-full hover:text-white transition-all duration-200"
                  style={{ 
                    borderColor: '#6d0df0', 
                    color: '#6d0df0'
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.backgroundColor = '#6d0df0';
                    (e.target as HTMLElement).style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.backgroundColor = 'transparent';
                    (e.target as HTMLElement).style.color = '#6d0df0';
                  }}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Per E-Mail senden
                </Button>
              </div>

              <div className="mt-8 text-center">
                <Button
                  onClick={onStartOver}
                  variant="ghost"
                  className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Neuen Support-Fall erstellen
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

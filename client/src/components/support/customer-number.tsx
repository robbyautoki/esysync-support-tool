import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Phone, CircleAlert, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { SupportFormData } from "@/pages/support";

interface CustomerNumberProps {
  formData: SupportFormData;
  updateFormData: (updates: Partial<SupportFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function CustomerNumber({ formData, updateFormData, onNext, onPrev }: CustomerNumberProps) {
  const [customerNumber, setCustomerNumber] = useState(formData.customerNumber || "");
  const [shouldValidate, setShouldValidate] = useState(false);
  const { toast } = useToast();

  const { data: validationResult, isLoading } = useQuery({
    queryKey: ["/api/customers/" + customerNumber + "/validate"],
    enabled: shouldValidate && customerNumber.length > 0,
    retry: false,
  });

  const isValid = validationResult?.valid;
  const showValidation = shouldValidate && customerNumber.length > 0;
  const canContinue = isValid && !isLoading;

  const handleInputChange = (value: string) => {
    setCustomerNumber(value);
    setShouldValidate(value.length > 0);
    
    if (isValid) {
      updateFormData({ customerNumber: value });
    } else {
      updateFormData({ customerNumber: null });
    }
  };

  const handleGeneratePDF = async () => {
    if (!canContinue) return;
    
    try {
      // Generate RMA number first
      const rmaResponse = await fetch("/api/rma/generate", { method: "POST" });
      const { rmaNumber } = await rmaResponse.json();
      
      updateFormData({ customerNumber, rmaNumber });
      onNext();
    } catch (error) {
      toast({
        title: "Fehler",
        description: "RMA-Nummer konnte nicht generiert werden. Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
    }
  };

  const requestPhoneSupport = () => {
    toast({
      title: "Telefonsupport angefordert",
      description: "Sie erhalten in Kürze einen Rückruf von unserem Support-Team.",
    });
  };

  return (
    <section className="fade-in">
      <div className="glassmorphism rounded-3xl p-8 apple-shadow mb-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Schritt 3: Kundennummer eingeben</h2>
          <p className="text-gray-600">Bitte geben Sie Ihre Kundennummer ein, um fortzufahren.</p>
        </div>

        <div className="glassmorphism-strong rounded-2xl p-6 mb-6">
          <Label htmlFor="customer-number" className="block text-sm font-medium text-gray-900 mb-2">
            <span className="text-red-500">*</span> Ihre Kundennummer
          </Label>
          <div className="relative">
            <Input
              id="customer-number"
              type="text"
              placeholder="z.B. KD123456"
              value={customerNumber}
              onChange={(e) => handleInputChange(e.target.value)}
              className={`
                w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg
                ${showValidation && !isValid ? 'border-red-500' : ''}
                ${isValid ? 'border-green-500' : ''}
              `}
            />
            {showValidation && !isValid && !isLoading && (
              <div className="mt-2">
                <p className="text-sm text-red-500 flex items-center">
                  <CircleAlert className="w-4 h-4 mr-2" />
                  Ungültige Kundennummer. Bitte überprüfen Sie Ihre Eingabe.
                </p>
              </div>
            )}
            {isLoading && (
              <div className="mt-2">
                <p className="text-sm text-gray-500">Validierung läuft...</p>
              </div>
            )}
            {isValid && (
              <div className="mt-2">
                <p className="text-sm text-green-600">✓ Kundennummer bestätigt</p>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Ihre Kundennummer finden Sie auf Ihrer letzten Rechnung oder Bestellung.
          </p>
        </div>

        {/* Optional Phone Support */}
        <div className="glassmorphism-strong rounded-2xl p-6 mb-6 border-l-4 border-orange-400">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Brauchen Sie Hilfe?</h3>
              <p className="text-sm text-gray-600">Unser Telefonsupport hilft Ihnen gerne weiter.</p>
            </div>
            <Button
              onClick={requestPhoneSupport}
              className="px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all duration-200"
            >
              <Phone className="w-4 h-4 mr-2" />
              Anrufen
            </Button>
          </div>
        </div>

        <div className="flex justify-between">
          <Button
            onClick={onPrev}
            variant="outline"
            className="px-6 py-3 text-gray-600 border border-gray-300 rounded-full hover:bg-gray-50 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück
          </Button>
          <Button
            onClick={handleGeneratePDF}
            disabled={!canContinue}
            className="px-8 py-3 bg-blue-500 text-white rounded-full apple-shadow disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200"
          >
            <FileText className="w-4 h-4 mr-2" />
            PDF mit RMA erstellen
          </Button>
        </div>
      </div>
    </section>
  );
}

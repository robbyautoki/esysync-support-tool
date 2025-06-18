import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { SupportFormData } from "@/pages/support";

interface ShippingOptionsProps {
  formData: SupportFormData;
  updateFormData: (updates: Partial<SupportFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const shippingOptions = [
  {
    id: "own-package",
    title: "Eigene Verpackung",
    description: "Sie verpacken das Display selbst und versenden es",
    price: "18,00 €",
  },
  {
    id: "avantor-box",
    title: "AVANTOR-Box mit Rückschein",
    description: "Wir senden Ihnen eine sichere Verpackung zu",
    price: "18,00 €",
  },
  {
    id: "technician",
    title: "Techniker-Abholung",
    description: "Ein Techniker holt das Display bei Ihnen ab",
    price: "Auf Anfrage",
    priceClass: "text-green-600",
  },
  {
    id: "complete-replacement",
    title: "Kompletttausch",
    description: "Sofortiger Austausch gegen ein neues Display",
    price: "229,00 €",
    recommended: true,
  },
];

export default function ShippingOptions({ formData, updateFormData, onNext, onPrev }: ShippingOptionsProps) {
  const canContinue = !!formData.shippingMethod;

  const selectShipping = (method: string) => {
    updateFormData({ shippingMethod: method });
  };

  return (
    <section className="fade-in">
      <div className="glassmorphism rounded-3xl p-8 apple-shadow mb-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Schritt 2: Versandoption wählen</h2>
          <p className="text-gray-600">Wählen Sie Ihre bevorzugte Versandmethode.</p>
        </div>

        <RadioGroup value={formData.shippingMethod || ""} onValueChange={selectShipping} className="space-y-4 mb-8">
          {shippingOptions.map((option) => (
            <div
              key={option.id}
              className={`
                glassmorphism-strong rounded-2xl p-6 apple-shadow cursor-pointer transition-all duration-200
                ${option.recommended ? 'border-2 border-blue-500' : ''}
                hover:shadow-lg
              `}
            >
              <Label htmlFor={option.id} className="flex items-center cursor-pointer">
                <RadioGroupItem value={option.id} id={option.id} className="mr-4" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      {option.title}
                      {option.recommended && (
                        <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                          Empfohlen
                        </span>
                      )}
                    </h3>
                    <span className={`text-xl font-bold ${option.priceClass || 'text-blue-500'}`}>
                      {option.price}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>

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
            onClick={onNext}
            disabled={!canContinue}
            className="px-8 py-3 bg-blue-500 text-white rounded-full apple-shadow disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200"
          >
            Weiter
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
}

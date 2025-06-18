import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, User, Monitor, MapPin, Mail } from "lucide-react";
import { SupportFormData } from "@/pages/support";

interface CustomerDataProps {
  formData: SupportFormData;
  updateFormData: (updates: Partial<SupportFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function CustomerData({ formData, updateFormData, onNext, onPrev }: CustomerDataProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.accountNumber || !formData.displayNumber || !formData.displayLocation || !formData.contactEmail) {
      return;
    }
    
    onNext();
  };

  const isFormValid = formData.accountNumber && formData.displayNumber && formData.displayLocation && formData.contactEmail;

  return (
    <section className="max-w-4xl mx-auto">
      <div className="glassmorphism-strong rounded-3xl p-8 apple-shadow-lg">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Daten zum Display und Kunde
          </h2>
          <p className="text-lg text-gray-600">
            Bitte geben Sie die erforderlichen Informationen für die RMA-Bearbeitung ein.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Account Number */}
          <div className="glassmorphism rounded-2xl p-6">
            <div className="flex items-center mb-4">
              <User className="w-5 h-5 mr-2" style={{ color: '#6d0df0' }} />
              <Label htmlFor="accountNumber" className="text-lg font-semibold text-gray-900">
                Accountnummer *
              </Label>
            </div>
            <Input
              id="accountNumber"
              type="text"
              value={formData.accountNumber || ""}
              onChange={(e) => updateFormData({ accountNumber: e.target.value })}
              placeholder="z.B. ACC-12345"
              className="w-full text-lg py-3 rounded-xl border-2 focus:border-purple-500 focus:ring-purple-500"
              required
            />
          </div>

          {/* Display Number */}
          <div className="glassmorphism rounded-2xl p-6">
            <div className="flex items-center mb-4">
              <Monitor className="w-5 h-5 mr-2" style={{ color: '#6d0df0' }} />
              <Label htmlFor="displayNumber" className="text-lg font-semibold text-gray-900">
                Displaynummer *
              </Label>
            </div>
            <Input
              id="displayNumber"
              type="text"
              value={formData.displayNumber || ""}
              onChange={(e) => updateFormData({ displayNumber: e.target.value })}
              placeholder="z.B. DSP-67890"
              className="w-full text-lg py-3 rounded-xl border-2 focus:border-purple-500 focus:ring-purple-500"
              required
            />
          </div>

          {/* Display Location and Return Address */}
          <div className="glassmorphism rounded-2xl p-6">
            <div className="flex items-center mb-4">
              <MapPin className="w-5 h-5 mr-2" style={{ color: '#6d0df0' }} />
              <Label htmlFor="displayLocation" className="text-lg font-semibold text-gray-900">
                Standort des Displays und gleichzeitig auch Rücksendeadresse *
              </Label>
            </div>
            <Textarea
              id="displayLocation"
              value={formData.displayLocation || ""}
              onChange={(e) => updateFormData({ displayLocation: e.target.value })}
              placeholder="Vollständige Adresse eingeben:&#10;Straße, Hausnummer&#10;PLZ, Stadt&#10;Land"
              className="w-full text-lg py-3 rounded-xl border-2 focus:border-purple-500 focus:ring-purple-500 min-h-[120px] resize-vertical"
              required
            />
            <div className="mt-3">
              <Label htmlFor="returnAddress" className="text-sm font-medium text-gray-700">
                Abweichende Rücksendeadresse (optional)
              </Label>
              <Textarea
                id="returnAddress"
                value={formData.returnAddress || ""}
                onChange={(e) => updateFormData({ returnAddress: e.target.value })}
                placeholder="Falls die Rücksendeadresse abweicht, hier eingeben..."
                className="w-full text-lg py-3 rounded-xl border-2 focus:border-purple-500 focus:ring-purple-500 min-h-[80px] resize-vertical mt-2"
              />
            </div>
          </div>

          {/* Contact Email */}
          <div className="glassmorphism rounded-2xl p-6">
            <div className="flex items-center mb-4">
              <Mail className="w-5 h-5 mr-2" style={{ color: '#6d0df0' }} />
              <Label htmlFor="contactEmail" className="text-lg font-semibold text-gray-900">
                Emailadresse zur Kommunikation *
              </Label>
            </div>
            <Input
              id="contactEmail"
              type="email"
              value={formData.contactEmail || ""}
              onChange={(e) => updateFormData({ contactEmail: e.target.value })}
              placeholder="ihre@email.de"
              className="w-full text-lg py-3 rounded-xl border-2 focus:border-purple-500 focus:ring-purple-500"
              required
            />
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-8">
            <Button
              type="button"
              onClick={onPrev}
              variant="outline"
              className="flex items-center px-8 py-3 text-lg rounded-xl border-2 border-gray-300 hover:border-purple-500 hover:text-purple-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Zurück
            </Button>

            <Button
              type="submit"
              disabled={!isFormValid}
              className={`flex items-center px-8 py-3 text-lg rounded-xl transition-all ${
                isFormValid
                  ? 'text-white shadow-lg transform hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              style={isFormValid ? { backgroundColor: '#6d0df0' } : {}}
            >
              Weiter
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
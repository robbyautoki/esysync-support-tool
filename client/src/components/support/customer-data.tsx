import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, User, Monitor, MapPin, Mail, Package, AlertTriangle } from "lucide-react";
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
    
    if (!formData.accountNumber || !formData.displayNumber || !formData.displayLocation || !formData.contactEmail || !formData.contactPerson) {
      return;
    }
    
    // Check alternative shipping fields if enabled
    if (formData.alternativeShipping && (!formData.alternativeAddress || !formData.alternativeCity || !formData.alternativeZip)) {
      return;
    }
    
    onNext();
  };

  const isFormValid = formData.accountNumber && 
    formData.displayNumber && 
    formData.displayLocation && 
    formData.contactEmail && 
    formData.contactPerson && 
    (!formData.alternativeShipping || (formData.alternativeAddress && formData.alternativeCity && formData.alternativeZip));

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

          {/* Shipping and Contact Person Section */}
          <div className="glassmorphism rounded-2xl p-6">
            <div className="flex items-center mb-6">
              <Package className="w-5 h-5 mr-2" style={{ color: '#6d0df0' }} />
              <h3 className="text-lg font-semibold text-gray-900">📦 Versand / Ansprechpartner</h3>
            </div>

            {/* Alternative Shipping Checkbox */}
            <div className="mb-6">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="alternativeShipping"
                  checked={formData.alternativeShipping}
                  onCheckedChange={(checked) => updateFormData({ alternativeShipping: !!checked })}
                />
                <Label htmlFor="alternativeShipping" className="text-base font-medium text-gray-900 cursor-pointer">
                  Abweichende Versandadresse
                </Label>
              </div>
            </div>

            {/* Alternative Shipping Address Fields */}
            {formData.alternativeShipping && (
              <div className="space-y-4 mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div>
                  <Label htmlFor="alternativeAddress" className="text-sm font-medium text-gray-700">
                    Alternative Adresse *
                  </Label>
                  <Input
                    id="alternativeAddress"
                    value={formData.alternativeAddress || ""}
                    onChange={(e) => updateFormData({ alternativeAddress: e.target.value })}
                    placeholder="Straße und Hausnummer"
                    className="mt-1 w-full"
                    required={formData.alternativeShipping}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="alternativeZip" className="text-sm font-medium text-gray-700">
                      PLZ *
                    </Label>
                    <Input
                      id="alternativeZip"
                      value={formData.alternativeZip || ""}
                      onChange={(e) => updateFormData({ alternativeZip: e.target.value })}
                      placeholder="12345"
                      className="mt-1"
                      required={formData.alternativeShipping}
                    />
                  </div>
                  <div>
                    <Label htmlFor="alternativeCity" className="text-sm font-medium text-gray-700">
                      Ort *
                    </Label>
                    <Input
                      id="alternativeCity"
                      value={formData.alternativeCity || ""}
                      onChange={(e) => updateFormData({ alternativeCity: e.target.value })}
                      placeholder="Stadt"
                      className="mt-1"
                      required={formData.alternativeShipping}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Contact Person */}
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="contactTitle" className="text-sm font-medium text-gray-700">
                    Anrede *
                  </Label>
                  <Select 
                    value={formData.contactTitle} 
                    onValueChange={(value: 'Frau' | 'Herr' | 'Divers') => updateFormData({ contactTitle: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Anrede wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Frau">Frau</SelectItem>
                      <SelectItem value="Herr">Herr</SelectItem>
                      <SelectItem value="Divers">Divers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="contactPerson" className="text-sm font-medium text-gray-700">
                    Ansprechpartner *
                  </Label>
                  <Input
                    id="contactPerson"
                    value={formData.contactPerson || ""}
                    onChange={(e) => updateFormData({ contactPerson: e.target.value })}
                    placeholder="Name des Ansprechpartners"
                    className="mt-1"
                    required
                  />
                </div>
              </div>
              
              {/* Important Notice */}
              <div className="flex items-start space-x-3 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-orange-800">
                  <strong>Wichtig:</strong> Bitte sicherstellen, dass der Ansprechpartner vor Ort ist und das Display entgegengenommen werden kann.
                </p>
              </div>
            </div>
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
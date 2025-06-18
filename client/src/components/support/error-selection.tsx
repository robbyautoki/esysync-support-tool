import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Monitor, BarChart3, PauseCircle, Unlink, ArrowLeft, ArrowRight } from "lucide-react";
import type { SupportFormData } from "@/pages/support";

interface ErrorSelectionProps {
  formData: SupportFormData;
  updateFormData: (updates: Partial<SupportFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const errorTypes = [
  {
    id: "black-screen",
    title: "Bleibt schwarz",
    description: "Display zeigt kein Bild an",
    icon: Monitor,
  },
  {
    id: "lines",
    title: "Linien im Bild", 
    description: "Störende Linien oder Streifen",
    icon: BarChart3,
  },
  {
    id: "freeze",
    title: "Hängt nach Neustart",
    description: "Display reagiert nicht mehr",
    icon: PauseCircle,
  },
  {
    id: "no-connection",
    title: "Keine Verbindung",
    description: "Signal wird nicht erkannt", 
    icon: Unlink,
  },
];

export default function ErrorSelection({ formData, updateFormData, onNext, onPrev }: ErrorSelectionProps) {
  const canContinue = formData.selectedError && formData.restartConfirmed;

  const selectError = (errorId: string) => {
    updateFormData({ selectedError: errorId });
  };

  const toggleRestartConfirmed = (checked: boolean) => {
    updateFormData({ restartConfirmed: checked });
  };

  return (
    <section className="fade-in">
      <div className="glassmorphism rounded-3xl p-8 apple-shadow mb-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Schritt 1: Problem beschreiben</h2>
          <p className="text-gray-600">Wählen Sie das Problem aus, das bei Ihrem Display auftritt.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {errorTypes.map((error) => {
            const Icon = error.icon;
            const isSelected = formData.selectedError === error.id;
            
            return (
              <button
                key={error.id}
                onClick={() => selectError(error.id)}
                className={`
                  chip glassmorphism p-4 rounded-2xl text-left apple-shadow transition-all duration-200
                  ${isSelected ? 'selected' : 'hover:transform hover:-translate-y-1'}
                `}
              >
                <div className="flex items-center">
                  <Icon className={`w-8 h-8 mr-4 ${isSelected ? 'text-white' : 'text-blue-500'}`} />
                  <div>
                    <h3 className={`font-semibold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                      {error.title}
                    </h3>
                    <p className={`text-sm ${isSelected ? 'text-blue-100' : 'text-gray-600'}`}>
                      {error.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Restart Confirmation */}
        <div className="glassmorphism-strong rounded-2xl p-6 mb-6">
          <div className="flex items-start space-x-4">
            <Checkbox
              id="restart-confirm"
              checked={formData.restartConfirmed}
              onCheckedChange={toggleRestartConfirmed}
              className="mt-1"
            />
            <label htmlFor="restart-confirm" className="text-gray-900 font-medium">
              <span className="text-red-500">*</span> Ich bestätige, dass ich das Display vorab neugestartet habe.
            </label>
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

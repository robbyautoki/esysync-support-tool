import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Play, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { SupportFormData } from "@/pages/support";

interface TroubleshootingProps {
  formData: SupportFormData;
  updateFormData: (updates: Partial<SupportFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function Troubleshooting({ formData, updateFormData, onNext, onPrev }: TroubleshootingProps) {
  const { data: errorTypes, isLoading } = useQuery({
    queryKey: ["/api/error-types"],
  });

  const selectedError = errorTypes?.find((error: any) => error.errorId === formData.selectedError);

  const handleTroubleshootingCompleted = (resolved: boolean) => {
    updateFormData({ troubleshootingCompleted: true, problemResolved: resolved });
    if (!resolved) {
      onNext();
    }
  };

  return (
    <section className="max-w-4xl mx-auto">
      <div className="glassmorphism-strong rounded-3xl p-8 apple-shadow-lg">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Lösungsanleitung für: {selectedError?.title}
          </h2>
          <p className="text-lg text-gray-600">
            Bitte folgen Sie dieser Anleitung, um das Problem möglicherweise selbst zu lösen.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="text-gray-600 mt-4">Lade Anleitung...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Video Section */}
            <div className="glassmorphism rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Play className="w-5 h-5 mr-2 text-purple-500" />
                Video-Anleitung
              </h3>
              
              {selectedError?.videoUrl ? (
                <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
                  <video 
                    controls 
                    className="w-full h-full object-cover"
                    poster="/api/placeholder/640/360"
                  >
                    <source src={selectedError.videoUrl} type="video/mp4" />
                    Ihr Browser unterstützt keine HTML5-Videos.
                  </video>
                </div>
              ) : (
                <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Kein Video verfügbar</p>
                  </div>
                </div>
              )}
            </div>

            {/* Instructions Section */}
            <div className="glassmorphism rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-purple-500" />
                Schritt-für-Schritt Anleitung
              </h3>
              
              {selectedError?.instructions ? (
                <div className="prose prose-gray max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {selectedError.instructions}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Keine detaillierte Anleitung verfügbar</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Bitte verwenden Sie das Video oder kontaktieren Sie den Support
                  </p>
                </div>
              )}
            </div>

            {/* Resolution Question */}
            <div className="glassmorphism rounded-2xl p-6 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Konnte das Problem gelöst werden?
              </h3>
              <p className="text-gray-600 mb-6">
                Funktioniert Ihr Display jetzt wieder ordnungsgemäß?
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => handleTroubleshootingCompleted(true)}
                  className="px-8 py-3 bg-green-500 text-white rounded-full apple-shadow hover:bg-green-600 transition-all duration-200"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Ja, Problem gelöst
                </Button>
                <Button
                  onClick={() => handleTroubleshootingCompleted(false)}
                  className="px-8 py-3 bg-purple-500 text-white rounded-full apple-shadow hover:bg-purple-600 transition-all duration-200"
                >
                  Nein, weiter zum Support
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* Success Message */}
            {formData.troubleshootingCompleted && formData.problemResolved && (
              <div className="glassmorphism rounded-2xl p-6 text-center border-2 border-green-500">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Problem erfolgreich gelöst!</h3>
                <p className="text-gray-600 mb-4">
                  Schön, dass wir Ihnen helfen konnten. Ihr Display sollte jetzt wieder einwandfrei funktionieren.
                </p>
                <Button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-gray-500 text-white rounded-full"
                >
                  Neuen Support-Fall erstellen
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        {!formData.problemResolved && (
          <div className="flex justify-between mt-8">
            <Button
              onClick={onPrev}
              variant="outline"
              className="px-6 py-3 text-gray-600 border border-gray-300 rounded-full hover:bg-gray-50 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
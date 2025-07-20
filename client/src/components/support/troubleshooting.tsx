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

// Function to convert YouTube URL to embeddable format
const getEmbeddableVideoUrl = (url: string) => {
  if (!url) return null;
  
  // YouTube URL patterns
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(youtubeRegex);
  
  if (match) {
    // Convert to YouTube embed URL
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  
  // For other video URLs, return as is
  return url;
};

export default function Troubleshooting({ formData, updateFormData, onNext, onPrev }: TroubleshootingProps) {
  const { data: errorTypes, isLoading } = useQuery({
    queryKey: ["/api/error-types"],
  });

  const selectedError = errorTypes?.find((error: any) => error.errorId === formData.selectedError);

  const handleTroubleshootingCompleted = async (resolved: boolean) => {
    updateFormData({ troubleshootingCompleted: true, problemResolved: resolved });
    
    if (resolved) {
      // Problem wurde durch Tutorial gelöst - erstelle resolved Ticket
      updateFormData({ resolvedViaTutorial: true });
      await createResolvedTicket();
    } else {
      onNext();
    }
  };

  const createResolvedTicket = async () => {
    try {
      // Generate RMA number for resolved ticket
      const currentYear = new Date().getFullYear();
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      const rmaNumber = `RESOLVED-${currentYear}-${randomNum}`;
      
      const resolvedTicketData = {
        rmaNumber,
        accountNumber: "TUTORIAL-USER", // Placeholder da keine Kundendaten erfasst
        displayNumber: "UNKNOWN",
        displayLocation: "Via Tutorial gelöst",
        returnAddress: null,
        contactEmail: "tutorial-resolved@system.local",
        contactPerson: null,
        contactTitle: null,
        alternativeShipping: false,
        alternativeAddress: null,
        alternativeCity: null,
        alternativeZip: null,
        errorType: formData.selectedError!,
        shippingMethod: "no-shipping",
        restartConfirmed: formData.restartConfirmed,
        additionalDeviceAffected: false,
        resolvedViaTutorial: true,
      };

      const response = await fetch("/api/support-tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resolvedTicketData),
      });

      if (response.ok) {
        console.log("Resolved ticket created successfully for statistics");
      }
    } catch (error) {
      console.error("Failed to create resolved ticket:", error);
      // Nicht kritisch - Benutzer sieht Erfolg trotzdem
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderBottomColor: '#6d0df0' }}></div>
            <p className="text-gray-600 mt-4">Lade Anleitung...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Video Section - Only show if video is enabled */}
            {selectedError?.videoEnabled && (
              <div className="glassmorphism rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Play className="w-5 h-5 mr-2" style={{ color: '#6d0df0' }} />
                  Video-Anleitung
                </h3>
                
                {selectedError?.videoUrl ? (
                  (() => {
                    const embeddableUrl = getEmbeddableVideoUrl(selectedError.videoUrl);
                    const isYouTube = selectedError.videoUrl.includes('youtube.com') || selectedError.videoUrl.includes('youtu.be');
                    
                    return (
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
                        {isYouTube ? (
                          <iframe
                            src={embeddableUrl}
                            className="w-full h-full"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title="Video-Anleitung"
                          />
                        ) : (
                          <video 
                            controls 
                            className="w-full h-full object-cover"
                            poster="/api/placeholder/640/360"
                          >
                            <source src={selectedError.videoUrl} type="video/mp4" />
                            Ihr Browser unterstützt keine HTML5-Videos.
                          </video>
                        )}
                      </div>
                    );
                  })()
                ) : (
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                    <div className="text-center">
                      <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Kein Video verfügbar</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Instructions Section */}
            <div className="glassmorphism rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" style={{ color: '#6d0df0' }} />
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
                  className="px-8 py-3 text-white rounded-full apple-shadow transition-all duration-200"
                  style={{ backgroundColor: '#6d0df0' }}
                  onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#5a0bd9'}
                  onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#6d0df0'}
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
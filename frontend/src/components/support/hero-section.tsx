import { Button } from "@/components/ui/button";
import { Monitor, ArrowRight, Info } from "lucide-react";

interface HeroSectionProps {
  onStartSupport: () => void;
}

export default function HeroSection({ onStartSupport }: HeroSectionProps) {
  return (
    <section className="text-center mb-16 fade-in">
      <div className="glassmorphism-strong rounded-3xl p-12 apple-shadow-lg">
        <div className="mb-8">
          <Monitor className="w-24 h-24 mx-auto mb-6" style={{ color: '#6d0df0' }} />
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Wir helfen Ihnen bei <br />
          <span 
            className="bg-clip-text text-transparent"
            style={{ 
              background: 'linear-gradient(to right, #6d0df0, #8b1bf0)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Display-Problemen
          </span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          Schnell und einfach. Bitte folgen Sie den nächsten Schritten für Reparatur oder Austausch.
        </p>
        <Button
          onClick={onStartSupport}
          className="inline-flex items-center px-8 py-4 text-white font-semibold rounded-full apple-shadow hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 text-lg"
          style={{ background: 'linear-gradient(to right, #6d0df0, #8b1bf0)' }}
        >
          <span>Support starten</span>
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
        <p className="text-sm text-gray-500 mt-6 flex items-center justify-center">
          <Info className="w-4 h-4 mr-2" />
          Kundennummer bereithalten. Bitte lesen Sie unsere FAQ am Seitenende.
        </p>
      </div>
    </section>
  );
}

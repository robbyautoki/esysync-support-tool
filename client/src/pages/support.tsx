import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HeroSection from "@/components/support/hero-section";
import StepIndicator from "@/components/support/step-indicator";
import ErrorSelection from "@/components/support/error-selection";
import Troubleshooting from "@/components/support/troubleshooting";
import ShippingOptions from "@/components/support/shipping-options";
import CustomerData from "@/components/support/customer-data";
import PDFGeneration from "@/components/support/pdf-generation";
import FAQSection from "@/components/support/faq-section";
import logoPath from "@assets/logo.png";

export interface SupportFormData {
  selectedError: string | null;
  restartConfirmed: boolean;
  troubleshootingCompleted: boolean;
  problemResolved: boolean;
  shippingMethod: string | null;
  // Customer and display data
  accountNumber: string | null;
  displayNumber: string | null;
  displayLocation: string | null;
  returnAddress: string | null;
  contactEmail: string | null;
  rmaNumber?: string;
}

export default function SupportPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<SupportFormData>({
    selectedError: null,
    restartConfirmed: false,
    troubleshootingCompleted: false,
    problemResolved: false,
    shippingMethod: null,
    accountNumber: null,
    displayNumber: null,
    displayLocation: null,
    returnAddress: null,
    contactEmail: null,
  });

  const updateFormData = (updates: Partial<SupportFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);
  const goToStep = (step: number) => setCurrentStep(step);

  const resetForm = () => {
    setFormData({
      selectedError: null,
      restartConfirmed: false,
      troubleshootingCompleted: false,
      problemResolved: false,
      shippingMethod: null,
      accountNumber: null,
      displayNumber: null,
      displayLocation: null,
      returnAddress: null,
      contactEmail: null,
    });
    setCurrentStep(0);
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-30 bg-pattern" />

      {/* Header with Logo */}
      <header className="fixed top-0 left-0 right-0 z-50 glassmorphism">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img 
                src={logoPath} 
                alt="Logo" 
                className="h-10 w-auto"
              />
            </div>
            {currentStep > 0 && (
              <div className="flex-1 max-w-2xl mx-8">
                <StepIndicator currentStep={currentStep} totalSteps={5} />
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-6">
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div
                key="hero"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
              >
                <HeroSection onStartSupport={() => nextStep()} />
              </motion.div>
            )}

            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
              >
                <ErrorSelection
                  formData={formData}
                  updateFormData={updateFormData}
                  onNext={nextStep}
                  onPrev={prevStep}
                />
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
              >
                <Troubleshooting
                  formData={formData}
                  updateFormData={updateFormData}
                  onNext={nextStep}
                  onPrev={prevStep}
                />
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
              >
                <ShippingOptions
                  formData={formData}
                  updateFormData={updateFormData}
                  onNext={nextStep}
                  onPrev={prevStep}
                />
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
              >
                <CustomerData
                  formData={formData}
                  updateFormData={updateFormData}
                  onNext={nextStep}
                  onPrev={prevStep}
                />
              </motion.div>
            )}

            {currentStep === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
              >
                <PDFGeneration
                  formData={formData}
                  updateFormData={updateFormData}
                  onStartOver={resetForm}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* FAQ Section - Always visible at bottom */}
          <div className="mt-16">
            <FAQSection />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center text-sm text-gray-500">
            <p>&copy; 2024 AVANTOR Service Center. Alle Rechte vorbehalten.</p>
            <div className="mt-2 space-x-4">
              <a href="#" className="hover:text-purple-500 transition-colors duration-200">Datenschutz</a>
              <a href="#" className="hover:text-purple-500 transition-colors duration-200">Impressum</a>
              <a href="#" className="hover:text-purple-500 transition-colors duration-200">AGB</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

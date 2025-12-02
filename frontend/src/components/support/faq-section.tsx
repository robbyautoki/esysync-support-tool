import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    id: 1,
    question: "Wie lange dauert eine Reparatur?",
    answer: "In der Regel dauert eine Reparatur 3-5 Werktage ab Eingang Ihres Displays in unserem Service-Center."
  },
  {
    id: 2,
    question: "Was kostet ein neues Panel?",
    answer: "Die Kosten variieren je nach Display-Modell. Eine genaue Kostenaufstellung erhalten Sie nach der Diagnose Ihres Geräts."
  },
  {
    id: 3,
    question: "Was ist eine RMA?",
    answer: "RMA steht für \"Return Merchandise Authorization\" - eine eindeutige Nummer zur Nachverfolgung Ihres Reparaturauftrags."
  },
  {
    id: 4,
    question: "Kann ich mehrere Displays einschicken?",
    answer: "Ja, Sie können mehrere Displays gleichzeitig einschicken. Erstellen Sie bitte für jedes Display eine separate RMA-Nummer."
  },
  {
    id: 5,
    question: "Wie lange ist Garantie auf Ersatzteile?",
    answer: "Auf alle Ersatzteile und Reparaturen gewähren wir 12 Monate Garantie ab dem Reparaturdatum."
  }
];

export default function FAQSection() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const toggleFAQ = (id: number) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  return (
    <section id="faq">
      <div className="glassmorphism rounded-3xl p-8 apple-shadow">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Häufig gestellte Fragen</h2>
          <p className="text-gray-600">Hier finden Sie Antworten auf die wichtigsten Fragen.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.id} className="glassmorphism-strong rounded-2xl overflow-hidden apple-shadow">
              <button
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                onClick={() => toggleFAQ(faq.id)}
              >
                <h3 className="font-semibold text-gray-900">{faq.question}</h3>
                <motion.div
                  animate={{ rotate: openFAQ === faq.id ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                </motion.div>
              </button>
              <AnimatePresence>
                {openFAQ === faq.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-4">
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

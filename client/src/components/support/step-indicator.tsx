interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          {Array.from({ length: totalSteps }, (_, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;
            
            return (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-400 text-white' 
                      : isCompleted
                        ? 'bg-gradient-to-r from-green-500 to-green-400 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }
                  `}
                >
                  {stepNumber}
                </div>
                {stepNumber < totalSteps && (
                  <div className="w-8 h-0.5 bg-gray-200 mx-1" />
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="text-sm text-gray-500 font-medium">
        Schritt {currentStep} von {totalSteps}
      </div>
    </div>
  );
}

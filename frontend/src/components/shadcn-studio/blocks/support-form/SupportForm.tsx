import * as Stepperize from '@stepperize/react'
import { AlertTriangleIcon, CheckCircleIcon, FileTextIcon, TruckIcon, UserIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

import ErrorSelectionStep from './ErrorSelectionStep'
import TroubleshootingStep from './TroubleshootingStep'
import ShippingOptionsStep from './ShippingOptionsStep'
import CustomerDataStep from './CustomerDataStep'
import SummaryStep from './SummaryStep'

import type { SupportFormData } from '@/pages/support'

const { useStepper, utils } = Stepperize.defineStepper(
  { id: 'error-selection', title: 'Problem wählen', description: 'Fehler identifizieren', icon: AlertTriangleIcon },
  { id: 'troubleshooting', title: 'Troubleshooting', description: 'Lösungsversuche', icon: FileTextIcon },
  { id: 'shipping', title: 'Versand', description: 'Versandart wählen', icon: TruckIcon },
  { id: 'customer-data', title: 'Kundendaten', description: 'Ihre Daten eingeben', icon: UserIcon },
  { id: 'summary', title: 'Zusammenfassung', description: 'RMA generieren', icon: CheckCircleIcon }
)

export type StepperType = ReturnType<typeof useStepper>

interface SupportFormProps {
  formData: SupportFormData
  updateFormData: (updates: Partial<SupportFormData>) => void
  onComplete: () => void
}

const SupportForm = ({ formData, updateFormData, onComplete }: SupportFormProps) => {
  const stepper = useStepper()
  const currentStep = utils.getIndex(stepper.current.id)

  return (
    <Card className='gap-0 p-0 md:grid md:max-lg:grid-cols-5 lg:grid-cols-4'>
      <CardContent className='col-span-5 p-6 max-md:border-b md:border-r md:max-lg:col-span-2 lg:col-span-1'>
        <nav aria-label='Support Steps'>
          <ol className='flex flex-col justify-between gap-x-2 gap-y-4'>
            {stepper.all
              .filter(step => step.id !== 'summary')
              .map((step, index) => (
                <li key={step.id}>
                  <Button
                    variant='ghost'
                    className='h-auto w-full shrink-0 cursor-pointer justify-start gap-2 rounded !bg-transparent p-0'
                    onClick={() => stepper.goTo(step.id)}
                  >
                    <Avatar className='size-9.5'>
                      <AvatarFallback
                        className={cn({ 'bg-primary text-primary-foreground shadow-sm': index <= currentStep })}
                      >
                        <step.icon className='size-4' />
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex flex-col items-start'>
                      <span>{step.title}</span>
                      <span className='text-muted-foreground text-sm'>{step.description}</span>
                    </div>
                  </Button>
                </li>
              ))}
          </ol>
        </nav>
      </CardContent>
      {stepper.switch({
        'error-selection': () => (
          <ErrorSelectionStep
            stepper={stepper}
            formData={formData}
            updateFormData={updateFormData}
          />
        ),
        'troubleshooting': () => (
          <TroubleshootingStep
            stepper={stepper}
            formData={formData}
            updateFormData={updateFormData}
          />
        ),
        'shipping': () => (
          <ShippingOptionsStep
            stepper={stepper}
            formData={formData}
            updateFormData={updateFormData}
          />
        ),
        'customer-data': () => (
          <CustomerDataStep
            stepper={stepper}
            formData={formData}
            updateFormData={updateFormData}
          />
        ),
        'summary': () => (
          <SummaryStep
            stepper={stepper}
            formData={formData}
            updateFormData={updateFormData}
            onComplete={onComplete}
          />
        )
      })}
    </Card>
  )
}

export default SupportForm

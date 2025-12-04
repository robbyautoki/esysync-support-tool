import { ArrowLeftIcon, ArrowRightIcon, PackageIcon, TruckIcon, WrenchIcon, RefreshCwIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { CardContent } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

import type { StepperType } from './SupportForm'
import type { SupportFormData } from '@/pages/support'

const shippingOptions = [
  {
    id: 'own-package',
    title: 'Eigene Verpackung',
    description: 'Sie verpacken das Display selbst und versenden es',
    price: '18,00 €',
    icon: PackageIcon,
  },
  {
    id: 'avantor-box',
    title: 'AVANTOR-Box mit Rückschein',
    description: 'Wir senden Ihnen eine sichere Verpackung zu',
    price: '18,00 €',
    icon: PackageIcon,
  },
  {
    id: 'technician',
    title: 'Techniker-Abholung',
    description: 'Ein Techniker holt das Display bei Ihnen ab',
    price: 'Auf Anfrage',
    priceVariant: 'success' as const,
    icon: WrenchIcon,
  },
  {
    id: 'complete-replacement',
    title: 'Kompletttausch',
    description: 'Sofortiger Austausch gegen ein neues Display',
    price: '229,00 €',
    recommended: true,
    icon: RefreshCwIcon,
  },
]

interface ShippingOptionsStepProps {
  stepper: StepperType
  formData: SupportFormData
  updateFormData: (updates: Partial<SupportFormData>) => void
}

const ShippingOptionsStep = ({ stepper, formData, updateFormData }: ShippingOptionsStepProps) => {
  const canProceed = !!formData.shippingMethod

  return (
    <CardContent className='col-span-5 flex flex-col gap-6 p-6 md:col-span-3'>
      <div className='text-center'>
        <h2 className='text-2xl font-semibold mb-2'>Versandoption wählen</h2>
        <p className='text-muted-foreground'>Wählen Sie Ihre bevorzugte Versandmethode</p>
      </div>

      <RadioGroup
        value={formData.shippingMethod || ''}
        onValueChange={(value) => updateFormData({ shippingMethod: value })}
        className='grid gap-4'
      >
        {shippingOptions.map((option) => {
          const IconComponent = option.icon
          const isSelected = formData.shippingMethod === option.id

          return (
            <div
              key={option.id}
              className={`relative flex items-start gap-4 rounded-lg border p-4 cursor-pointer transition-all ${
                isSelected
                  ? 'border-primary bg-primary/5'
                  : option.recommended
                  ? 'border-primary/50'
                  : 'border-input hover:border-primary/30'
              }`}
              onClick={() => updateFormData({ shippingMethod: option.id })}
            >
              {option.recommended && (
                <Badge className='absolute -top-2 right-4 bg-primary'>
                  Empfohlen
                </Badge>
              )}
              <RadioGroupItem
                value={option.id}
                id={`shipping-${option.id}`}
                className='mt-1'
              />
              <div className={`rounded-lg p-2 ${isSelected ? 'bg-primary/10' : 'bg-muted'}`}>
                <IconComponent className={`size-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <div className='flex-1'>
                <div className='flex items-center justify-between'>
                  <Label htmlFor={`shipping-${option.id}`} className='font-medium cursor-pointer'>
                    {option.title}
                  </Label>
                  <span className={`font-bold ${
                    option.priceVariant === 'success'
                      ? 'text-green-600'
                      : 'text-primary'
                  }`}>
                    {option.price}
                  </span>
                </div>
                <p className='text-muted-foreground text-sm mt-1'>{option.description}</p>
              </div>
            </div>
          )
        })}
      </RadioGroup>

      {/* Info Box */}
      <div className='rounded-lg bg-muted/50 p-4'>
        <p className='text-sm text-muted-foreground'>
          <strong>Hinweis:</strong> Bei allen Versandoptionen ist die Rücksendung an unseren Service-Standort inkludiert.
          Die Bearbeitungszeit beträgt in der Regel 3-5 Werktage nach Eingang des Geräts.
        </p>
      </div>

      {/* Navigation */}
      <div className='flex justify-between gap-4 pt-4 border-t'>
        <Button variant='secondary' size='lg' onClick={stepper.prev}>
          <ArrowLeftIcon className='size-4' />
          Zurück
        </Button>
        <Button size='lg' onClick={stepper.next} disabled={!canProceed}>
          Weiter
          <ArrowRightIcon className='size-4' />
        </Button>
      </div>
    </CardContent>
  )
}

export default ShippingOptionsStep

import { useState } from 'react'
import { ArrowLeftIcon, ArrowRightIcon, Monitor, Smartphone, Wifi, AlertTriangleIcon, BarChart3, PauseCircle, Unlink, Zap, Volume, RotateCcw, FileX, Settings, WifiOff, ShieldAlert, Package, Lightbulb, Battery, Shield, Power, Router } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import type { StepperType } from './SupportForm'
import type { SupportFormData } from '@/pages/support'
import type { ErrorType } from '@shared/schema'

const iconMap: Record<string, any> = {
  Monitor,
  BarChart3,
  PauseCircle,
  Unlink,
  AlertTriangle: AlertTriangleIcon,
  Zap,
  Wifi,
  Volume,
  RotateCcw,
  FileX,
  Settings,
  WifiOff,
  ShieldAlert,
  Package,
  Lightbulb,
  Battery,
  Smartphone,
  Shield,
  Power,
  Router,
}

interface ErrorSelectionStepProps {
  stepper: StepperType
  formData: SupportFormData
  updateFormData: (updates: Partial<SupportFormData>) => void
}

const ErrorSelectionStep = ({ stepper, formData, updateFormData }: ErrorSelectionStepProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(formData.selectedCategory || '')

  const { data: errorTypes, isLoading } = useQuery<ErrorType[]>({
    queryKey: ['/api/error-types'],
  })

  const filteredErrorTypes = Array.isArray(errorTypes)
    ? errorTypes.filter((error: ErrorType) => !selectedCategory || error.category === selectedCategory)
    : []

  const selectedErrorType = errorTypes?.find(e => e.errorId === formData.selectedError)
  const needsSubOption = selectedErrorType?.hasSubOptions && !formData.issueScope && !formData.specificMessage
  const canProceed = formData.selectedError && formData.restartConfirmed && !needsSubOption

  const selectCategory = (value: string) => {
    setSelectedCategory(value)
    updateFormData({ selectedCategory: value, selectedError: null, issueScope: null, specificMessage: null })
  }

  const selectError = (errorId: string) => {
    updateFormData({ selectedError: errorId, issueScope: null, specificMessage: null })
  }

  const selectSubOption = (subOptionId: string) => {
    if (selectedErrorType?.errorId === 'meldung-erscheint') {
      updateFormData({ specificMessage: subOptionId })
    } else {
      updateFormData({ issueScope: subOptionId })
    }
  }

  return (
    <CardContent className='col-span-5 flex flex-col gap-6 p-6 md:col-span-3'>
      {/* Category Selection - RadioGroup Cards like DealTypeStep */}
      <RadioGroup
        className='justify-items-center gap-6 sm:grid-cols-3 md:max-lg:grid-cols-1'
        value={selectedCategory}
        onValueChange={selectCategory}
      >
        <div className='border-input has-data-[state=checked]:border-primary/50 relative flex w-full flex-col items-center gap-3 rounded-md border p-4 shadow-xs outline-none'>
          <RadioGroupItem
            value='hardware'
            id='category-hardware'
            className='order-1 size-5 after:absolute after:inset-0 [&_svg]:size-3'
            aria-describedby='hardware-description'
            aria-label='category-radio-hardware'
          />
          <div className='grid grow justify-items-center gap-3'>
            <Monitor className='size-8.5 stroke-1' />
            <div className='flex flex-col items-center text-center'>
              <p className='font-medium'>Hardware</p>
              <p id='hardware-description' className='text-muted-foreground text-sm'>
                Physische Defekte am Display oder Hardware-Komponenten
              </p>
            </div>
          </div>
        </div>
        <div className='border-input has-data-[state=checked]:border-primary/50 relative flex w-full flex-col items-center gap-3 rounded-md border p-4 shadow-xs outline-none'>
          <RadioGroupItem
            value='software'
            id='category-software'
            className='order-1 size-5 after:absolute after:inset-0 [&_svg]:size-3'
            aria-describedby='software-description'
            aria-label='category-radio-software'
          />
          <div className='grid grow justify-items-center gap-3'>
            <Smartphone className='size-8.5 stroke-1' />
            <div className='flex flex-col items-center text-center'>
              <p className='font-medium'>Software</p>
              <p id='software-description' className='text-muted-foreground text-sm'>
                Bootloop, Apps, Android-Fehler und System-Probleme
              </p>
            </div>
          </div>
        </div>
        <div className='border-input has-data-[state=checked]:border-primary/50 relative flex w-full flex-col items-center gap-3 rounded-md border p-4 shadow-xs outline-none'>
          <RadioGroupItem
            value='network'
            id='category-network'
            className='order-1 size-5 after:absolute after:inset-0 [&_svg]:size-3'
            aria-describedby='network-description'
            aria-label='category-radio-network'
          />
          <div className='grid grow justify-items-center gap-3'>
            <Wifi className='size-8.5 stroke-1' />
            <div className='flex flex-col items-center text-center'>
              <p className='font-medium'>Netzwerk</p>
              <p id='network-description' className='text-muted-foreground text-sm'>
                Verbindungs-, Update- und Konnektivitätsprobleme
              </p>
            </div>
          </div>
        </div>
      </RadioGroup>

      {/* Error Type Selection - Grid with Select and Inputs like DealTypeStep */}
      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
        <div className='flex flex-col items-start gap-1 md:max-lg:col-span-2'>
          <Label htmlFor='error-type-select'>Spezifisches Problem</Label>
          <Select
            value={formData.selectedError || ''}
            onValueChange={selectError}
            disabled={!selectedCategory || isLoading}
          >
            <SelectTrigger id='error-type-select' className='w-full'>
              <SelectValue placeholder={isLoading ? 'Lädt...' : 'Problem auswählen'} />
            </SelectTrigger>
            <SelectContent>
              {filteredErrorTypes.map((error: ErrorType) => (
                <SelectItem key={error.errorId} value={error.errorId}>
                  {error.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className='text-muted-foreground/80 text-xs'>Wählen Sie das Problem, das bei Ihrem Display auftritt.</p>
        </div>

        {/* Sub-Options Select */}
        {formData.selectedError && selectedErrorType?.hasSubOptions && (
          <div className='flex flex-col items-start gap-1 md:max-lg:col-span-2'>
            <Label htmlFor='sub-option-select'>
              {selectedErrorType.errorId === 'meldung-erscheint' ? 'Welche Meldung erscheint?' : 'Welche Geräte sind betroffen?'}
            </Label>
            <Select
              value={selectedErrorType.errorId === 'meldung-erscheint' ? (formData.specificMessage || '') : (formData.issueScope || '')}
              onValueChange={selectSubOption}
            >
              <SelectTrigger id='sub-option-select' className='w-full'>
                <SelectValue placeholder='Option auswählen' />
              </SelectTrigger>
              <SelectContent>
                {(selectedErrorType.subOptions as any[])?.map((option: any) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Restart Confirmation Checkbox */}
      {formData.selectedError && (
        <div className='flex items-center gap-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-4'>
          <Checkbox
            id='restart-confirmed'
            className='size-5'
            checked={formData.restartConfirmed}
            onCheckedChange={(checked) => updateFormData({ restartConfirmed: checked as boolean })}
          />
          <Label htmlFor='restart-confirmed' className='cursor-pointer'>
            Ich bestätige, dass ich das Display bereits neu gestartet habe
          </Label>
        </div>
      )}

      {/* Navigation Buttons - exactly like DealTypeStep */}
      <div className='flex justify-between gap-4'>
        <Button variant='secondary' size='lg' onClick={stepper.prev} disabled={stepper.isFirst}>
          <ArrowLeftIcon />
          Zurück
        </Button>
        <Button size='lg' onClick={stepper.next} disabled={!canProceed}>
          Weiter
          <ArrowRightIcon />
        </Button>
      </div>
    </CardContent>
  )
}

export default ErrorSelectionStep

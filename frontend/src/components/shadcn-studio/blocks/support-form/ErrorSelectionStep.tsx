import { useState } from 'react'
import { ArrowLeftIcon, ArrowRightIcon, AlertTriangleIcon, Monitor, BarChart3, PauseCircle, Unlink, Zap, Wifi, Volume, RotateCcw, FileX, Settings, WifiOff, ShieldAlert, Package, Lightbulb, Battery, Smartphone, Shield, Power, Router } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'

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

const categories = [
  {
    id: 'hardware',
    title: 'Hardware-Probleme',
    description: 'Physische Defekte am Display oder Hardware-Komponenten',
    icon: Monitor,
    color: 'bg-red-500'
  },
  {
    id: 'software',
    title: 'Software-Probleme',
    description: 'Bootloop, Apps, Android-Fehler und System-Probleme',
    icon: Smartphone,
    color: 'bg-blue-500'
  },
  {
    id: 'network',
    title: 'Netzwerk-Probleme',
    description: 'Verbindungs-, Update- und Konnektivitätsprobleme',
    icon: Wifi,
    color: 'bg-green-500'
  }
]

interface ErrorSelectionStepProps {
  stepper: StepperType
  formData: SupportFormData
  updateFormData: (updates: Partial<SupportFormData>) => void
  onBack: () => void
}

const ErrorSelectionStep = ({ stepper, formData, updateFormData, onBack }: ErrorSelectionStepProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  const { data: errorTypes, isLoading } = useQuery<ErrorType[]>({
    queryKey: ['/api/error-types'],
  })

  const filteredErrorTypes = Array.isArray(errorTypes)
    ? errorTypes.filter((error: ErrorType) => !selectedCategory || error.category === selectedCategory)
    : []

  const selectedErrorType = errorTypes?.find(e => e.errorId === formData.selectedError)
  const needsSubOption = selectedErrorType?.hasSubOptions && !formData.issueScope && !formData.specificMessage
  const canProceed = formData.selectedError && formData.restartConfirmed && !needsSubOption

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

  const selectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId)
    updateFormData({ selectedError: null, issueScope: null, specificMessage: null })
  }

  return (
    <CardContent className='col-span-5 flex flex-col gap-6 p-6 md:col-span-3'>
      {!selectedCategory ? (
        // Category Selection
        <>
          <div className='text-center'>
            <h2 className='text-2xl font-semibold mb-2'>Wählen Sie die Problem-Kategorie</h2>
            <p className='text-muted-foreground'>Wählen Sie zuerst die Hauptkategorie Ihres Problems aus</p>
          </div>

          <RadioGroup className='grid gap-4 sm:grid-cols-3' value={selectedCategory}>
            {categories.map((category) => {
              const IconComponent = category.icon
              return (
                <div
                  key={category.id}
                  className='border-input has-data-[state=checked]:border-primary/50 relative flex w-full flex-col items-center gap-3 rounded-lg border p-6 shadow-xs outline-none cursor-pointer hover:border-primary/30 transition-colors'
                  onClick={() => selectCategory(category.id)}
                >
                  <RadioGroupItem
                    value={category.id}
                    id={`category-${category.id}`}
                    className='sr-only'
                  />
                  <div className={`${category.color} rounded-full p-4`}>
                    <IconComponent className='size-8 text-white' />
                  </div>
                  <div className='text-center'>
                    <p className='font-medium'>{category.title}</p>
                    <p className='text-muted-foreground text-sm mt-1'>{category.description}</p>
                  </div>
                </div>
              )
            })}
          </RadioGroup>
        </>
      ) : (
        // Error Type Selection
        <>
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='text-2xl font-semibold mb-2'>Wählen Sie das spezifische Problem</h2>
              <div className='flex items-center gap-2'>
                <Badge variant='outline' className='text-primary border-primary/30'>
                  {categories.find(c => c.id === selectedCategory)?.title}
                </Badge>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setSelectedCategory('')}
                  className='text-primary hover:text-primary/80'
                >
                  Kategorie ändern
                </Button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className='flex items-center justify-center py-8'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
            </div>
          ) : (
            <RadioGroup
              className='grid gap-4 sm:grid-cols-2'
              value={formData.selectedError || ''}
              onValueChange={selectError}
            >
              {filteredErrorTypes?.map((error: ErrorType) => {
                const IconComponent = iconMap[error.iconName] || Monitor
                const isSelected = formData.selectedError === error.errorId

                return (
                  <div
                    key={error.errorId}
                    className={`border-input has-data-[state=checked]:border-primary/50 relative flex w-full items-start gap-4 rounded-lg border p-4 shadow-xs outline-none cursor-pointer transition-colors ${
                      isSelected ? 'border-primary bg-primary/5' : 'hover:border-primary/30'
                    }`}
                    onClick={() => selectError(error.errorId)}
                  >
                    <RadioGroupItem
                      value={error.errorId}
                      id={`error-${error.errorId}`}
                      className='mt-1'
                    />
                    <div className={`rounded-lg p-2 ${isSelected ? 'bg-primary/10' : 'bg-muted'}`}>
                      <IconComponent className={`size-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div className='flex-1'>
                      <Label htmlFor={`error-${error.errorId}`} className='font-medium cursor-pointer'>
                        {error.title}
                      </Label>
                      <p className='text-muted-foreground text-sm mt-1'>{error.description}</p>
                    </div>
                  </div>
                )
              })}
            </RadioGroup>
          )}

          {/* Sub-Options */}
          {formData.selectedError && selectedErrorType?.hasSubOptions && (
            <div className='bg-primary/5 border border-primary/20 rounded-lg p-4'>
              <h3 className='font-medium mb-3'>
                {selectedErrorType.errorId === 'meldung-erscheint'
                  ? 'Welche Meldung erscheint?'
                  : 'Welche Geräte sind betroffen?'}
              </h3>
              <RadioGroup
                className='grid gap-2 sm:grid-cols-3'
                value={selectedErrorType.errorId === 'meldung-erscheint' ? (formData.specificMessage || '') : (formData.issueScope || '')}
                onValueChange={selectSubOption}
              >
                {(selectedErrorType.subOptions as any[])?.map((option: any) => (
                  <div
                    key={option.id}
                    className='flex items-center space-x-2 rounded-lg border p-3 cursor-pointer hover:bg-background'
                  >
                    <RadioGroupItem value={option.id} id={`sub-${option.id}`} />
                    <Label htmlFor={`sub-${option.id}`} className='cursor-pointer text-sm'>
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Restart Confirmation */}
          {formData.selectedError && (
            <div className='bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4'>
              <div className='flex items-start gap-3'>
                <AlertTriangleIcon className='size-5 text-amber-600 mt-0.5' />
                <div className='flex-1'>
                  <h3 className='font-medium text-amber-800 dark:text-amber-200 mb-2'>
                    Wichtiger Hinweis vor dem Support
                  </h3>
                  <p className='text-amber-700 dark:text-amber-300 text-sm mb-3'>
                    Bitte bestätigen Sie, dass Sie das Display bereits neu gestartet haben.
                  </p>
                  <div className='flex items-center space-x-2'>
                    <Checkbox
                      id='restart-confirmed'
                      checked={formData.restartConfirmed}
                      onCheckedChange={(checked) => updateFormData({ restartConfirmed: checked as boolean })}
                    />
                    <Label htmlFor='restart-confirmed' className='text-sm font-medium text-amber-800 dark:text-amber-200 cursor-pointer'>
                      Ja, ich habe das Display neu gestartet
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Navigation */}
      <div className='flex justify-between gap-4 pt-4 border-t'>
        <Button variant='secondary' size='lg' onClick={selectedCategory ? () => setSelectedCategory('') : onBack}>
          <ArrowLeftIcon className='size-4' />
          {selectedCategory ? 'Zurück' : 'Zur Startseite'}
        </Button>
        <Button
          size='lg'
          onClick={stepper.next}
          disabled={!canProceed}
        >
          Weiter
          <ArrowRightIcon className='size-4' />
        </Button>
      </div>
    </CardContent>
  )
}

export default ErrorSelectionStep

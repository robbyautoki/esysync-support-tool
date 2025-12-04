import { ArrowLeftIcon, ArrowRightIcon, CheckCircleIcon, PlayIcon } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'

import type { StepperType } from './SupportForm'
import type { SupportFormData } from '@/pages/support'

// Function to convert YouTube URL to embeddable format
const getEmbeddableVideoUrl = (url: string) => {
  if (!url) return null
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const match = url.match(youtubeRegex)
  if (match) {
    return `https://www.youtube.com/embed/${match[1]}`
  }
  return url
}

const checkLabels: Record<string, string> = {
  mounting: 'Aufhängung geprüft',
  restart: 'Neustart durchgeführt',
  pause30min: '30 Minuten Pause eingelegt',
  power: 'Stromzufuhr geprüft',
  socket: 'Steckdose geprüft',
  fuse: 'Sicherung geprüft',
  timer: 'Zeitschaltuhr geprüft',
  router: 'Router neu gestartet',
  transfer: 'Übertragung laut Status erfolgreich',
}

interface TroubleshootingStepProps {
  stepper: StepperType
  formData: SupportFormData
  updateFormData: (updates: Partial<SupportFormData>) => void
}

const TroubleshootingStep = ({ stepper, formData, updateFormData }: TroubleshootingStepProps) => {
  const { data: errorTypes, isLoading } = useQuery<any[]>({
    queryKey: ['/api/error-types'],
  })

  const selectedError = errorTypes?.find((error: any) => error.errorId === formData.selectedError)

  const toggleCheck = (checkId: string) => {
    const current = formData.troubleshootingSteps || {}
    updateFormData({
      troubleshootingSteps: {
        ...current,
        [checkId]: !current[checkId]
      }
    })
  }

  const allChecksCompleted = () => {
    if (!selectedError?.requiredChecks || selectedError.requiredChecks.length === 0) {
      return true
    }
    const steps = formData.troubleshootingSteps || {}
    return selectedError.requiredChecks.every((check: string) => steps[check] === true)
  }

  const handleTroubleshootingCompleted = async (resolved: boolean) => {
    updateFormData({ troubleshootingCompleted: true, problemResolved: resolved })

    if (resolved) {
      updateFormData({ resolvedViaTutorial: true })
      await createResolvedTicket()
    } else {
      stepper.next()
    }
  }

  const createResolvedTicket = async () => {
    try {
      const currentYear = new Date().getFullYear()
      const randomNum = Math.floor(100000 + Math.random() * 900000)
      const rmaNumber = `RESOLVED-${currentYear}-${randomNum}`

      const resolvedTicketData = {
        rmaNumber,
        accountNumber: 'TUTORIAL-USER',
        displayNumber: 'UNKNOWN',
        displayLocation: 'Via Tutorial gelöst',
        returnAddress: null,
        contactEmail: 'tutorial-resolved@system.local',
        contactPerson: null,
        contactTitle: null,
        alternativeShipping: false,
        alternativeAddress: null,
        alternativeCity: null,
        alternativeZip: null,
        errorType: formData.selectedError!,
        shippingMethod: 'no-shipping',
        restartConfirmed: formData.restartConfirmed,
        additionalDeviceAffected: false,
        resolvedViaTutorial: true,
        issueScope: formData.issueScope || null,
        specificMessage: formData.specificMessage || null,
        troubleshootingSteps: formData.troubleshootingSteps || null,
      }

      await fetch('/api/support-tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resolvedTicketData),
      })
    } catch (error) {
      console.error('Failed to create resolved ticket:', error)
    }
  }

  if (isLoading) {
    return (
      <CardContent className='col-span-5 flex items-center justify-center p-12 md:col-span-3'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
      </CardContent>
    )
  }

  // If problem was resolved
  if (formData.troubleshootingCompleted && formData.problemResolved) {
    return (
      <CardContent className='col-span-5 flex flex-col items-center justify-center gap-6 p-6 md:col-span-3'>
        <div className='bg-green-100 dark:bg-green-900/20 rounded-full p-6'>
          <CheckCircleIcon className='size-16 text-green-600' />
        </div>
        <div className='text-center'>
          <h2 className='text-2xl font-semibold mb-2'>Problem erfolgreich gelöst!</h2>
          <p className='text-muted-foreground'>
            Schön, dass wir Ihnen helfen konnten.
          </p>
        </div>
        <Button variant='outline' onClick={() => window.location.reload()}>
          Neuen Support-Fall erstellen
        </Button>
      </CardContent>
    )
  }

  return (
    <CardContent className='col-span-5 flex flex-col gap-6 p-6 md:col-span-3'>
      {/* Grid layout like DealDetailsStep */}
      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
        {/* Instructions - left column */}
        <div className='flex flex-col items-start gap-1 md:max-lg:col-span-2'>
          <Label htmlFor='instructions'>Schritt-für-Schritt Anleitung</Label>
          <Textarea
            id='instructions'
            rows={6}
            value={selectedError?.instructions || 'Keine Anleitung verfügbar'}
            readOnly
            className='h-full bg-muted/50'
          />
        </div>

        {/* Right column - video and checks */}
        <div className='flex flex-col gap-6 md:max-lg:col-span-2'>
          {/* Video Section */}
          {selectedError?.videoEnabled && selectedError?.videoUrl && (
            <div className='flex flex-col items-start gap-1'>
              <Label className='flex items-center gap-2'>
                <PlayIcon className='size-4' />
                Video-Anleitung
              </Label>
              <div className='w-full aspect-video rounded-lg overflow-hidden bg-muted border'>
                {(() => {
                  const embeddableUrl = getEmbeddableVideoUrl(selectedError.videoUrl)
                  const isYouTube = selectedError.videoUrl.includes('youtube.com') || selectedError.videoUrl.includes('youtu.be')
                  return isYouTube && embeddableUrl ? (
                    <iframe
                      src={embeddableUrl}
                      className='w-full h-full'
                      frameBorder='0'
                      allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                      allowFullScreen
                      title='Video-Anleitung'
                    />
                  ) : (
                    <video controls className='w-full h-full object-cover'>
                      <source src={selectedError.videoUrl} type='video/mp4' />
                    </video>
                  )
                })()}
              </div>
            </div>
          )}

          {/* Required Checks */}
          {selectedError?.requiredChecks && selectedError.requiredChecks.length > 0 && (
            <div className='flex flex-col items-start gap-1'>
              <Label className='font-semibold'>Erforderliche Prüfungen</Label>
              <div className='flex size-full flex-wrap items-start gap-x-6 gap-y-2'>
                {selectedError.requiredChecks.map((checkId: string) => (
                  <div key={checkId} className='flex items-center gap-2'>
                    <Checkbox
                      id={`check-${checkId}`}
                      className='size-5'
                      checked={formData.troubleshootingSteps?.[checkId] || false}
                      onCheckedChange={() => toggleCheck(checkId)}
                    />
                    <Label htmlFor={`check-${checkId}`}>
                      {checkLabels[checkId] || checkId}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Resolution Question */}
      <div className='rounded-lg border p-4 text-center'>
        <h3 className='font-semibold mb-2'>Konnte das Problem gelöst werden?</h3>
        <p className='text-muted-foreground text-sm mb-4'>
          Funktioniert Ihr Display jetzt wieder ordnungsgemäß?
        </p>

        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <Button
            onClick={() => handleTroubleshootingCompleted(true)}
            disabled={!allChecksCompleted()}
            className='bg-green-600 hover:bg-green-700'
          >
            <CheckCircleIcon className='size-4' />
            Ja, Problem gelöst
          </Button>
          <Button
            onClick={() => handleTroubleshootingCompleted(false)}
            disabled={!allChecksCompleted()}
          >
            Nein, weiter zum Support
            <ArrowRightIcon className='size-4' />
          </Button>
        </div>
      </div>

      {/* Navigation - exactly like DealDetailsStep */}
      <div className='flex justify-between gap-4'>
        <Button variant='secondary' size='lg' onClick={stepper.prev}>
          <ArrowLeftIcon />
          Zurück
        </Button>
        <Button size='lg' onClick={stepper.next} disabled={!allChecksCompleted()}>
          Weiter
          <ArrowRightIcon />
        </Button>
      </div>
    </CardContent>
  )
}

export default TroubleshootingStep

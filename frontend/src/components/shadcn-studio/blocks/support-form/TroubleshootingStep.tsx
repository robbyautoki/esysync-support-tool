import { ArrowLeftIcon, ArrowRightIcon, PlayIcon, CheckCircleIcon } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

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
            Schön, dass wir Ihnen helfen konnten. Ihr Display sollte jetzt wieder einwandfrei funktionieren.
          </p>
        </div>
        <Button variant='outline' onClick={() => window.location.reload()}>
          Neuen Support-Fall erstellen
        </Button>
      </CardContent>
    )
  }

  return (
    <CardContent className='col-span-5 flex flex-col gap-6 p-6 md:col-span-3 overflow-y-auto max-h-[80vh]'>
      <div className='text-center'>
        <h2 className='text-2xl font-semibold mb-2'>
          Lösungsanleitung: {selectedError?.title}
        </h2>
        <p className='text-muted-foreground'>
          Bitte folgen Sie dieser Anleitung, um das Problem möglicherweise selbst zu lösen.
        </p>
      </div>

      {/* Video Section */}
      {selectedError?.videoEnabled && (
        <div className='rounded-lg border p-4'>
          <h3 className='font-medium flex items-center gap-2 mb-4'>
            <PlayIcon className='size-5 text-primary' />
            Video-Anleitung
          </h3>

          {selectedError?.videoUrl ? (
            (() => {
              const embeddableUrl = getEmbeddableVideoUrl(selectedError.videoUrl)
              const isYouTube = selectedError.videoUrl.includes('youtube.com') || selectedError.videoUrl.includes('youtu.be')

              return (
                <div className='relative aspect-video rounded-lg overflow-hidden bg-muted'>
                  {isYouTube && embeddableUrl ? (
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
                      Ihr Browser unterstützt keine HTML5-Videos.
                    </video>
                  )}
                </div>
              )
            })()
          ) : (
            <div className='relative aspect-video rounded-lg overflow-hidden bg-muted flex items-center justify-center'>
              <div className='text-center'>
                <PlayIcon className='size-12 text-muted-foreground mx-auto mb-2' />
                <p className='text-muted-foreground text-sm'>Kein Video verfügbar</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions Section */}
      <div className='rounded-lg border p-4'>
        <h3 className='font-medium flex items-center gap-2 mb-4'>
          <CheckCircleIcon className='size-5 text-primary' />
          Schritt-für-Schritt Anleitung
        </h3>

        {selectedError?.instructions ? (
          <div className='prose prose-sm dark:prose-invert max-w-none'>
            <div className='whitespace-pre-wrap text-muted-foreground leading-relaxed'>
              {selectedError.instructions}
            </div>
          </div>
        ) : (
          <div className='text-center py-4'>
            <p className='text-muted-foreground'>Keine detaillierte Anleitung verfügbar</p>
          </div>
        )}
      </div>

      {/* Required Checks */}
      {selectedError?.requiredChecks && selectedError.requiredChecks.length > 0 && (
        <div className='rounded-lg border border-primary/20 bg-primary/5 p-4'>
          <h3 className='font-medium mb-3'>Erforderliche Prüfungen</h3>
          <p className='text-muted-foreground text-sm mb-4'>
            Bitte bestätigen Sie, dass Sie folgende Schritte durchgeführt haben:
          </p>
          <div className='space-y-2'>
            {selectedError.requiredChecks.map((checkId: string) => {
              const isChecked = formData.troubleshootingSteps?.[checkId] || false
              return (
                <div
                  key={checkId}
                  className='flex items-center space-x-3 p-3 rounded-lg bg-background hover:bg-muted/50 transition-colors cursor-pointer'
                  onClick={() => toggleCheck(checkId)}
                >
                  <Checkbox
                    id={`check-${checkId}`}
                    checked={isChecked}
                    onCheckedChange={() => toggleCheck(checkId)}
                  />
                  <Label htmlFor={`check-${checkId}`} className='flex-1 cursor-pointer'>
                    {checkLabels[checkId] || checkId}
                  </Label>
                </div>
              )
            })}
          </div>
          {!allChecksCompleted() && (
            <div className='mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg'>
              <p className='text-sm text-amber-700 dark:text-amber-300'>
                Bitte führen Sie alle erforderlichen Prüfungen durch, bevor Sie fortfahren.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Resolution Question */}
      <div className='rounded-lg border p-6 text-center'>
        <h3 className='font-semibold mb-2'>Konnte das Problem gelöst werden?</h3>
        <p className='text-muted-foreground text-sm mb-6'>
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

      {/* Navigation */}
      <div className='flex justify-between gap-4 pt-4 border-t'>
        <Button variant='secondary' size='lg' onClick={stepper.prev}>
          <ArrowLeftIcon className='size-4' />
          Zurück
        </Button>
      </div>
    </CardContent>
  )
}

export default TroubleshootingStep

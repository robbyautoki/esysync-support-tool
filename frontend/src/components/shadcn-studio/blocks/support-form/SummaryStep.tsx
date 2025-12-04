import { useState, useEffect } from 'react'
import { FileTextIcon, CheckIcon, DownloadIcon, MailIcon, RotateCcwIcon, PackageIcon, CopyIcon, ExternalLinkIcon, CheckCircleIcon, LoaderIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { generatePDF } from '@/lib/pdf-generator'

import type { StepperType } from './SupportForm'
import type { SupportFormData } from '@/pages/support'

const errorDisplayNames: Record<string, string> = {
  'black-screen': 'Bleibt schwarz',
  'lines': 'Linien im Bild',
  'freeze': 'Hängt nach Neustart',
  'no-connection': 'Keine Verbindung',
  'bootloop-hang': 'Display bleibt im Bootloop hängen',
  'defective-pixel': 'Defekte Pixel',
  'touch-unresponsive': 'Berührung reagiert nicht',
  'no-power': 'Gerät lässt sich nicht starten',
  'stand-wobble': 'Standfuß/Display-Arm wackelt',
  'wrong-date': 'Falsches Datum',
  'content-not-playing': 'Content wird nicht abgespielt',
  'meldung-erscheint': 'Fehlermeldungen',
  'no-app-updates': 'Keine App-Updates',
  'wrong-content': 'Falscher Content',
  'slow-connection': 'Langsame Verbindung',
  'wifi-problems': 'WLAN Probleme',
  'network-timeout': 'Netzwerk-Timeout',
  'vpn-problems': 'VPN Probleme',
}

const shippingDisplayNames: Record<string, string> = {
  'own-package': 'Eigene Verpackung',
  'avantor-box': 'AVANTOR-Box mit Rückschein',
  'technician': 'Techniker-Abholung',
  'complete-replacement': 'Kompletttausch',
}

interface SummaryStepProps {
  stepper: StepperType
  formData: SupportFormData
  updateFormData: (updates: Partial<SupportFormData>) => void
  onComplete: () => void
}

const SummaryStep = ({ stepper, formData, updateFormData, onComplete }: SummaryStepProps) => {
  const [isLoading, setIsLoading] = useState(true)
  const [pdfGenerated, setPdfGenerated] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const generateRMAAndCreateTicket = async () => {
      try {
        const currentYear = new Date().getFullYear()
        const randomNum = Math.floor(100000 + Math.random() * 900000)
        const rmaNumber = `RMA-${currentYear}-${randomNum}`

        updateFormData({ rmaNumber })

        setTimeout(async () => {
          setIsLoading(false)
          setPdfGenerated(true)
          await createSupportTicket(rmaNumber)
        }, 2000)
      } catch (error) {
        console.error('Failed to generate RMA:', error)
        setIsLoading(false)
      }
    }

    generateRMAAndCreateTicket()
  }, [])

  const createSupportTicket = async (rmaNumber: string) => {
    try {
      const ticketData = {
        rmaNumber,
        accountNumber: formData.accountNumber!,
        displayNumber: formData.displayNumber!,
        displayLocation: formData.displayLocation!,
        returnAddress: formData.returnAddress,
        contactEmail: formData.contactEmail!,
        contactPerson: formData.contactPerson || undefined,
        contactTitle: formData.contactTitle || undefined,
        alternativeShipping: formData.alternativeShipping || undefined,
        alternativeAddress: formData.alternativeAddress || undefined,
        alternativeCity: formData.alternativeCity || undefined,
        alternativeZip: formData.alternativeZip || undefined,
        errorType: formData.selectedError!,
        shippingMethod: formData.shippingMethod!,
        restartConfirmed: formData.restartConfirmed,
        additionalDeviceAffected: formData.additionalDeviceAffected || false,
        issueScope: formData.issueScope || undefined,
        specificMessage: formData.specificMessage || undefined,
        troubleshootingSteps: formData.troubleshootingSteps || undefined,
      }

      const response = await fetch('/api/support-tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData),
      })

      if (!response.ok) {
        throw new Error(`Failed to create ticket: ${response.status}`)
      }

      console.log('Support ticket created successfully')
    } catch (error) {
      console.error('Failed to create support ticket:', error)
      toast({
        title: 'Fehler',
        description: 'Das Support-Ticket konnte nicht erstellt werden.',
        variant: 'destructive',
      })
    }
  }

  const downloadPDF = () => {
    const pdfData = {
      rmaNumber: formData.rmaNumber!,
      customerNumber: formData.accountNumber!,
      accountNumber: formData.accountNumber!,
      displayNumber: formData.displayNumber!,
      displayLocation: formData.displayLocation!,
      contactEmail: formData.contactEmail!,
      contactPerson: formData.contactPerson || undefined,
      contactTitle: formData.contactTitle || undefined,
      alternativeShipping: formData.alternativeShipping || undefined,
      alternativeAddress: formData.alternativeAddress || undefined,
      alternativeCity: formData.alternativeCity || undefined,
      alternativeZip: formData.alternativeZip || undefined,
      errorType: errorDisplayNames[formData.selectedError!] || formData.selectedError!,
      shippingMethod: formData.shippingMethod!,
      additionalDeviceAffected: formData.additionalDeviceAffected || false,
      address: formData.returnAddress || formData.displayLocation!,
    }

    generatePDF(pdfData)

    toast({
      title: 'PDF heruntergeladen',
      description: 'Das RMA-Dokument wurde erfolgreich als PDF heruntergeladen.',
    })
  }

  const copyTrackingLink = () => {
    const trackingUrl = `${window.location.origin}/track/${formData.rmaNumber}`
    navigator.clipboard.writeText(trackingUrl)
    toast({
      title: 'Link kopiert',
      description: 'Der Status-Link wurde in die Zwischenablage kopiert.',
    })
  }

  if (isLoading) {
    return (
      <CardContent className='col-span-5 flex flex-col items-center justify-center gap-6 p-12 md:col-span-3'>
        <div className='bg-primary rounded-full p-4 animate-pulse'>
          <FileTextIcon className='size-8 text-primary-foreground' />
        </div>
        <div className='text-center'>
          <h2 className='text-2xl font-semibold mb-2'>PDF wird erstellt...</h2>
          <p className='text-muted-foreground'>Bitte warten Sie einen Moment.</p>
        </div>
        <LoaderIcon className='size-8 animate-spin text-primary' />
      </CardContent>
    )
  }

  return (
    <CardContent className='col-span-5 flex flex-col gap-6 p-6 md:col-span-3 overflow-y-auto max-h-[80vh]'>
      {/* Success Header */}
      <div className='text-center'>
        <div className='inline-flex items-center justify-center size-16 bg-green-100 dark:bg-green-900/20 rounded-full mb-4'>
          <CheckCircleIcon className='size-8 text-green-600' />
        </div>
        <h2 className='text-2xl font-semibold mb-2'>RMA erfolgreich erstellt!</h2>
        <p className='text-muted-foreground'>
          Ihre RMA-Nummer:{' '}
          <span className='font-mono font-bold text-primary'>{formData.rmaNumber}</span>
        </p>
      </div>

      {/* Summary Card */}
      <div className='rounded-lg border p-4'>
        <h3 className='font-medium flex items-center gap-2 mb-4'>
          <FileTextIcon className='size-5 text-primary' />
          Zusammenfassung
        </h3>
        <div className='space-y-3 text-sm'>
          <div className='flex items-center gap-2'>
            <CheckIcon className='size-4 text-green-600' />
            <span className='text-muted-foreground'>RMA-Nummer:</span>
            <span className='font-medium'>{formData.rmaNumber}</span>
          </div>
          <div className='flex items-center gap-2'>
            <CheckIcon className='size-4 text-green-600' />
            <span className='text-muted-foreground'>Problem:</span>
            <span className='font-medium'>{errorDisplayNames[formData.selectedError!] || formData.selectedError}</span>
          </div>
          <div className='flex items-center gap-2'>
            <CheckIcon className='size-4 text-green-600' />
            <span className='text-muted-foreground'>Account:</span>
            <span className='font-medium'>{formData.accountNumber}</span>
          </div>
          <div className='flex items-center gap-2'>
            <CheckIcon className='size-4 text-green-600' />
            <span className='text-muted-foreground'>Display:</span>
            <span className='font-medium'>{formData.displayNumber}</span>
          </div>
          <div className='flex items-center gap-2'>
            <CheckIcon className='size-4 text-green-600' />
            <span className='text-muted-foreground'>Email:</span>
            <span className='font-medium'>{formData.contactEmail}</span>
          </div>
          <div className='flex items-center gap-2'>
            <CheckIcon className='size-4 text-green-600' />
            <span className='text-muted-foreground'>Versand:</span>
            <span className='font-medium'>{shippingDisplayNames[formData.shippingMethod!] || formData.shippingMethod}</span>
          </div>
        </div>
      </div>

      {/* Download Buttons */}
      <div className='flex flex-col sm:flex-row gap-4'>
        <Button onClick={downloadPDF} className='flex-1'>
          <DownloadIcon className='size-4' />
          PDF herunterladen
        </Button>
        <Button
          variant='outline'
          className='flex-1'
          onClick={() => {
            const email = prompt('Bitte geben Sie Ihre E-Mail-Adresse ein:')
            if (email) {
              toast({
                title: 'PDF versendet',
                description: `PDF wird an ${email} gesendet.`,
              })
            }
          }}
        >
          <MailIcon className='size-4' />
          Per E-Mail senden
        </Button>
      </div>

      {/* Tracking Link */}
      <div className='rounded-lg border p-4 space-y-4'>
        <h3 className='font-medium flex items-center gap-2'>
          <PackageIcon className='size-5 text-primary' />
          Status verfolgen
        </h3>
        <p className='text-sm text-muted-foreground'>
          Mit diesem Link können Sie jederzeit den Status Ihres RMA-Tickets einsehen:
        </p>

        <div className='bg-muted/50 rounded-lg p-3 space-y-3'>
          <div className='flex items-center justify-between gap-2'>
            <span className='text-xs font-mono text-muted-foreground truncate'>
              {window.location.origin}/track/{formData.rmaNumber}
            </span>
            <Button variant='outline' size='sm' onClick={copyTrackingLink}>
              <CopyIcon className='size-4' />
              Kopieren
            </Button>
          </div>
        </div>

        <Button
          variant='outline'
          className='w-full'
          onClick={() => window.open(`/track/${formData.rmaNumber}`, '_blank')}
        >
          <ExternalLinkIcon className='size-4' />
          Status-Seite öffnen
        </Button>
      </div>

      {/* Start Over */}
      <div className='text-center pt-4 border-t'>
        <Button variant='ghost' onClick={onComplete}>
          <RotateCcwIcon className='size-4' />
          Neuen Support-Fall erstellen
        </Button>
      </div>
    </CardContent>
  )
}

export default SummaryStep

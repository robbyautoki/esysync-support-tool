import { useState, useEffect } from 'react'
import { DownloadIcon } from 'lucide-react'

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

interface SummaryStepProps {
  stepper: StepperType
  formData: SupportFormData
  updateFormData: (updates: Partial<SupportFormData>) => void
  onComplete: () => void
}

const SummaryStep = ({ stepper, formData, updateFormData, onComplete }: SummaryStepProps) => {
  const [isLoading, setIsLoading] = useState(true)
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

  if (isLoading) {
    return (
      <CardContent className='col-span-5 flex flex-col items-center justify-center gap-6 p-6 md:col-span-3'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
        <p className='text-muted-foreground'>RMA wird erstellt...</p>
      </CardContent>
    )
  }

  return (
    <CardContent className='col-span-5 flex flex-col gap-6 p-6 md:col-span-3'>
      <div className='flex flex-col items-start'>
        <h2 className='text-2xl font-semibold'>RMA erfolgreich erstellt!</h2>
        <p className='text-muted-foreground'>
          Ihre RMA-Nummer: <span className='font-mono font-bold text-primary'>{formData.rmaNumber}</span>
        </p>
      </div>
      <div className='flex flex-col gap-4'>
        <Button onClick={downloadPDF} className='w-full'>
          <DownloadIcon className='size-4' />
          PDF herunterladen
        </Button>
        <Button variant='outline' onClick={() => window.open(`/track/${formData.rmaNumber}`, '_blank')}>
          Status-Seite öffnen
        </Button>
      </div>
      <div className='flex justify-end'>
        <Button size='lg' onClick={onComplete}>
          Neuen Support-Fall erstellen
        </Button>
      </div>
    </CardContent>
  )
}

export default SummaryStep

import { ArrowLeftIcon } from 'lucide-react'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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

interface CustomerDataStepProps {
  stepper: StepperType
  formData: SupportFormData
  updateFormData: (updates: Partial<SupportFormData>) => void
}

const CustomerDataStep = ({ stepper, formData, updateFormData }: CustomerDataStepProps) => {
  const isFormValid = formData.accountNumber &&
    formData.displayNumber &&
    formData.displayLocation &&
    formData.contactEmail &&
    formData.contactPerson

  return (
    <CardContent className='col-span-5 flex flex-col gap-6 p-6 md:col-span-3'>
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        {/* Left column - Summary */}
        <div className='flex flex-col gap-4'>
          <p className='text-2xl font-semibold'>Fast fertig! 🚀</p>
          <p className='text-muted-foreground'>Bitte geben Sie Ihre Daten ein, um die RMA zu erstellen.</p>
          <div className='text-muted-foreground flex flex-col gap-4'>
            <div className='flex items-center gap-3'>
              <p className='text-foreground w-30 font-medium'>Problem</p>
              <p>{errorDisplayNames[formData.selectedError!] || formData.selectedError}</p>
            </div>
            <div className='flex items-center gap-3'>
              <p className='text-foreground w-30 font-medium'>Versand</p>
              <p>{shippingDisplayNames[formData.shippingMethod!] || formData.shippingMethod}</p>
            </div>
            <div className='flex items-center gap-2'>
              <Switch
                id='confirm-data'
                checked={!!formData.accountNumber && !!formData.contactEmail}
              />
              <Label htmlFor='confirm-data' className='text-foreground'>
                Daten vollständig eingegeben
              </Label>
            </div>
          </div>
        </div>

        {/* Right column - Form */}
        <div className='flex flex-col gap-4'>
          <div className='flex flex-col items-start gap-1'>
            <Label htmlFor='accountNumber'>Accountnummer *</Label>
            <Input
              id='accountNumber'
              value={formData.accountNumber || ''}
              onChange={(e) => updateFormData({ accountNumber: e.target.value })}
              placeholder='z.B. ACC-12345'
            />
          </div>
          <div className='flex flex-col items-start gap-1'>
            <Label htmlFor='displayNumber'>Displaynummer *</Label>
            <Input
              id='displayNumber'
              value={formData.displayNumber || ''}
              onChange={(e) => updateFormData({ displayNumber: e.target.value })}
              placeholder='z.B. DSP-67890'
            />
          </div>
          <div className='flex flex-col items-start gap-1'>
            <Label htmlFor='displayLocation'>Standort / Adresse *</Label>
            <Input
              id='displayLocation'
              value={formData.displayLocation || ''}
              onChange={(e) => updateFormData({ displayLocation: e.target.value })}
              placeholder='Straße, PLZ, Ort'
            />
          </div>
          <div className='flex flex-col items-start gap-1'>
            <Label htmlFor='contactEmail'>Email *</Label>
            <Input
              id='contactEmail'
              type='email'
              value={formData.contactEmail || ''}
              onChange={(e) => updateFormData({ contactEmail: e.target.value })}
              placeholder='ihre@email.de'
            />
          </div>
          <div className='grid grid-cols-3 gap-2'>
            <div className='flex flex-col items-start gap-1'>
              <Label htmlFor='contactTitle'>Anrede</Label>
              <Select
                value={formData.contactTitle}
                onValueChange={(value: 'Frau' | 'Herr' | 'Divers') => updateFormData({ contactTitle: value })}
              >
                <SelectTrigger id='contactTitle'>
                  <SelectValue placeholder='Anrede' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='Frau'>Frau</SelectItem>
                  <SelectItem value='Herr'>Herr</SelectItem>
                  <SelectItem value='Divers'>Divers</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='col-span-2 flex flex-col items-start gap-1'>
              <Label htmlFor='contactPerson'>Ansprechpartner *</Label>
              <Input
                id='contactPerson'
                value={formData.contactPerson || ''}
                onChange={(e) => updateFormData({ contactPerson: e.target.value })}
                placeholder='Name'
              />
            </div>
          </div>
        </div>
      </div>
      <div className='flex justify-between gap-4'>
        <Button variant='secondary' size='lg' onClick={stepper.prev}>
          <ArrowLeftIcon />
          Zurück
        </Button>
        <Button
          size='lg'
          onClick={stepper.next}
          disabled={!isFormValid}
          className='bg-green-600 text-white hover:bg-green-600/90 focus-visible:ring-green-600/20 dark:bg-green-400/60 dark:hover:bg-green-400/50 dark:focus-visible:ring-green-400/40'
        >
          RMA erstellen
        </Button>
      </div>
    </CardContent>
  )
}

export default CustomerDataStep

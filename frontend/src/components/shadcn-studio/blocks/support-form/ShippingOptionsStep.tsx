import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import type { StepperType } from './SupportForm'
import type { SupportFormData } from '@/pages/support'

interface ShippingOptionsStepProps {
  stepper: StepperType
  formData: SupportFormData
  updateFormData: (updates: Partial<SupportFormData>) => void
}

const ShippingOptionsStep = ({ stepper, formData, updateFormData }: ShippingOptionsStepProps) => {
  const canProceed = !!formData.shippingMethod

  return (
    <CardContent className='col-span-5 flex flex-col gap-6 p-6 md:col-span-3'>
      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
        <div className='flex flex-col items-start gap-1 md:max-lg:col-span-2'>
          <Label htmlFor='shipping-method'>Versandoption</Label>
          <Select
            value={formData.shippingMethod || ''}
            onValueChange={(value) => updateFormData({ shippingMethod: value })}
          >
            <SelectTrigger id='shipping-method' className='w-full'>
              <SelectValue placeholder='Versandart wählen' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='own-package'>Eigene Verpackung (18,00 €)</SelectItem>
              <SelectItem value='avantor-box'>AVANTOR-Box mit Rückschein (18,00 €)</SelectItem>
              <SelectItem value='technician'>Techniker-Abholung (Auf Anfrage)</SelectItem>
              <SelectItem value='complete-replacement'>Kompletttausch (229,00 €)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className='flex flex-col items-start gap-1 md:max-lg:col-span-2'>
          <Label htmlFor='return-address'>Rücksendeadresse</Label>
          <Input
            id='return-address'
            placeholder='Straße, PLZ, Ort'
            value={formData.returnAddress || ''}
            onChange={(e) => updateFormData({ returnAddress: e.target.value })}
          />
        </div>
        <div className='flex flex-col items-start gap-1 md:max-lg:col-span-2'>
          <Label htmlFor='alternative-address'>Alternative Adresse</Label>
          <Input
            id='alternative-address'
            placeholder='Straße'
            value={formData.alternativeAddress || ''}
            onChange={(e) => updateFormData({ alternativeAddress: e.target.value })}
            disabled={!formData.alternativeShipping}
          />
        </div>
        <div className='flex flex-col items-start gap-1 md:max-lg:col-span-2'>
          <Label htmlFor='alternative-city'>Stadt</Label>
          <Input
            id='alternative-city'
            placeholder='Stadt'
            value={formData.alternativeCity || ''}
            onChange={(e) => updateFormData({ alternativeCity: e.target.value })}
            disabled={!formData.alternativeShipping}
          />
        </div>
        <div className='flex flex-col items-start gap-1 md:max-lg:col-span-2'>
          <Label htmlFor='alternative-zip'>PLZ</Label>
          <Input
            id='alternative-zip'
            placeholder='PLZ'
            value={formData.alternativeZip || ''}
            onChange={(e) => updateFormData({ alternativeZip: e.target.value })}
            disabled={!formData.alternativeShipping}
          />
        </div>
        <div className='flex flex-col items-start gap-1 md:max-lg:col-span-2'>
          <Label htmlFor='additional-device'>Weitere Geräte betroffen?</Label>
          <Select
            value={formData.additionalDeviceAffected ? 'yes' : 'no'}
            onValueChange={(value) => updateFormData({ additionalDeviceAffected: value === 'yes' })}
          >
            <SelectTrigger id='additional-device' className='w-full'>
              <SelectValue placeholder='Auswählen' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='no'>Nein</SelectItem>
              <SelectItem value='yes'>Ja</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className='flex items-center gap-2 sm:col-span-2'>
          <Switch
            id='alternative-shipping'
            checked={formData.alternativeShipping}
            onCheckedChange={(checked) => updateFormData({ alternativeShipping: checked })}
          />
          <Label htmlFor='alternative-shipping'>An alternative Adresse versenden?</Label>
        </div>
      </div>
      <div className='flex justify-between gap-4'>
        <Button variant='secondary' size='lg' onClick={stepper.prev}>
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

export default ShippingOptionsStep

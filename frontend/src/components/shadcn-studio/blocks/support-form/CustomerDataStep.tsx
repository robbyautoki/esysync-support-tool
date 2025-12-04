import { ArrowLeftIcon, ArrowRightIcon, UserIcon, MonitorIcon, MapPinIcon, MailIcon, PackageIcon, AlertTriangleIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import type { StepperType } from './SupportForm'
import type { SupportFormData } from '@/pages/support'

interface CustomerDataStepProps {
  stepper: StepperType
  formData: SupportFormData
  updateFormData: (updates: Partial<SupportFormData>) => void
}

const CustomerDataStep = ({ stepper, formData, updateFormData }: CustomerDataStepProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.accountNumber || !formData.displayNumber || !formData.displayLocation || !formData.contactEmail || !formData.contactPerson) {
      return
    }

    if (formData.alternativeShipping && (!formData.alternativeAddress || !formData.alternativeCity || !formData.alternativeZip)) {
      return
    }

    stepper.next()
  }

  const isFormValid = formData.accountNumber &&
    formData.displayNumber &&
    formData.displayLocation &&
    formData.contactEmail &&
    formData.contactPerson &&
    (!formData.alternativeShipping || (formData.alternativeAddress && formData.alternativeCity && formData.alternativeZip))

  return (
    <CardContent className='col-span-5 flex flex-col gap-6 p-6 md:col-span-3 overflow-y-auto max-h-[80vh]'>
      <div className='text-center'>
        <h2 className='text-2xl font-semibold mb-2'>Daten zum Display und Kunde</h2>
        <p className='text-muted-foreground'>Bitte geben Sie die erforderlichen Informationen für die RMA-Bearbeitung ein</p>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Account Number */}
        <div className='space-y-2'>
          <Label htmlFor='accountNumber' className='flex items-center gap-2'>
            <UserIcon className='size-4 text-primary' />
            Accountnummer *
          </Label>
          <Input
            id='accountNumber'
            value={formData.accountNumber || ''}
            onChange={(e) => updateFormData({ accountNumber: e.target.value })}
            placeholder='z.B. ACC-12345'
            required
          />
        </div>

        {/* Display Number */}
        <div className='space-y-2'>
          <Label htmlFor='displayNumber' className='flex items-center gap-2'>
            <MonitorIcon className='size-4 text-primary' />
            Displaynummer *
          </Label>
          <Input
            id='displayNumber'
            value={formData.displayNumber || ''}
            onChange={(e) => updateFormData({ displayNumber: e.target.value })}
            placeholder='z.B. DSP-67890'
            required
          />
        </div>

        {/* Display Location */}
        <div className='space-y-2'>
          <Label htmlFor='displayLocation' className='flex items-center gap-2'>
            <MapPinIcon className='size-4 text-primary' />
            Standort des Displays / Rücksendeadresse *
          </Label>
          <Textarea
            id='displayLocation'
            value={formData.displayLocation || ''}
            onChange={(e) => updateFormData({ displayLocation: e.target.value })}
            placeholder={'Vollständige Adresse eingeben:\nStraße, Hausnummer\nPLZ, Stadt'}
            className='min-h-[100px]'
            required
          />
          <div className='space-y-2'>
            <Label htmlFor='returnAddress' className='text-sm text-muted-foreground'>
              Abweichende Rücksendeadresse (optional)
            </Label>
            <Textarea
              id='returnAddress'
              value={formData.returnAddress || ''}
              onChange={(e) => updateFormData({ returnAddress: e.target.value })}
              placeholder='Falls die Rücksendeadresse abweicht...'
              className='min-h-[80px]'
            />
          </div>
        </div>

        {/* Contact Email */}
        <div className='space-y-2'>
          <Label htmlFor='contactEmail' className='flex items-center gap-2'>
            <MailIcon className='size-4 text-primary' />
            Email zur Kommunikation *
          </Label>
          <Input
            id='contactEmail'
            type='email'
            value={formData.contactEmail || ''}
            onChange={(e) => updateFormData({ contactEmail: e.target.value })}
            placeholder='ihre@email.de'
            required
          />
        </div>

        {/* Additional Device */}
        <div className='rounded-lg border p-4'>
          <div className='flex items-center space-x-3'>
            <Checkbox
              id='additionalDevice'
              checked={formData.additionalDeviceAffected || false}
              onCheckedChange={(checked) => updateFormData({ additionalDeviceAffected: checked === true })}
            />
            <div>
              <Label htmlFor='additionalDevice' className='cursor-pointer'>
                Ist ein weiteres Gerät betroffen?
              </Label>
              <p className='text-sm text-muted-foreground'>
                Bitte markieren, falls ein weiteres Display ebenfalls defekt ist
              </p>
            </div>
          </div>
        </div>

        {/* Shipping and Contact */}
        <div className='rounded-lg border p-4 space-y-4'>
          <h3 className='font-medium flex items-center gap-2'>
            <PackageIcon className='size-4 text-primary' />
            Versand / Ansprechpartner
          </h3>

          {/* Alternative Shipping */}
          <div className='flex items-center space-x-3'>
            <Checkbox
              id='alternativeShipping'
              checked={formData.alternativeShipping}
              onCheckedChange={(checked) => updateFormData({ alternativeShipping: !!checked })}
            />
            <Label htmlFor='alternativeShipping' className='cursor-pointer'>
              Abweichende Versandadresse
            </Label>
          </div>

          {formData.alternativeShipping && (
            <div className='space-y-4 p-4 bg-muted/50 rounded-lg'>
              <div className='space-y-2'>
                <Label htmlFor='alternativeAddress'>Alternative Adresse *</Label>
                <Input
                  id='alternativeAddress'
                  value={formData.alternativeAddress || ''}
                  onChange={(e) => updateFormData({ alternativeAddress: e.target.value })}
                  placeholder='Straße und Hausnummer'
                  required={formData.alternativeShipping}
                />
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='alternativeZip'>PLZ *</Label>
                  <Input
                    id='alternativeZip'
                    value={formData.alternativeZip || ''}
                    onChange={(e) => updateFormData({ alternativeZip: e.target.value })}
                    placeholder='12345'
                    required={formData.alternativeShipping}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='alternativeCity'>Ort *</Label>
                  <Input
                    id='alternativeCity'
                    value={formData.alternativeCity || ''}
                    onChange={(e) => updateFormData({ alternativeCity: e.target.value })}
                    placeholder='Stadt'
                    required={formData.alternativeShipping}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Contact Person */}
          <div className='grid grid-cols-3 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='contactTitle'>Anrede *</Label>
              <Select
                value={formData.contactTitle}
                onValueChange={(value: 'Frau' | 'Herr' | 'Divers') => updateFormData({ contactTitle: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Anrede' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='Frau'>Frau</SelectItem>
                  <SelectItem value='Herr'>Herr</SelectItem>
                  <SelectItem value='Divers'>Divers</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='col-span-2 space-y-2'>
              <Label htmlFor='contactPerson'>Ansprechpartner *</Label>
              <Input
                id='contactPerson'
                value={formData.contactPerson || ''}
                onChange={(e) => updateFormData({ contactPerson: e.target.value })}
                placeholder='Name des Ansprechpartners'
                required
              />
            </div>
          </div>

          {/* Important Notice */}
          <div className='flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg'>
            <AlertTriangleIcon className='size-5 text-amber-600 mt-0.5 flex-shrink-0' />
            <p className='text-sm text-amber-800 dark:text-amber-200'>
              <strong>Wichtig:</strong> Bitte sicherstellen, dass der Ansprechpartner vor Ort ist und das Display entgegengenommen werden kann.
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className='flex justify-between gap-4 pt-4 border-t'>
          <Button type='button' variant='secondary' size='lg' onClick={stepper.prev}>
            <ArrowLeftIcon className='size-4' />
            Zurück
          </Button>
          <Button type='submit' size='lg' disabled={!isFormValid}>
            Weiter
            <ArrowRightIcon className='size-4' />
          </Button>
        </div>
      </form>
    </CardContent>
  )
}

export default CustomerDataStep

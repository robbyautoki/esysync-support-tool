import { MailIcon, PhoneIcon, MapPinIcon } from 'lucide-react'

import { Separator } from '@/components/ui/separator'

import logoPath from '@assets/logo.png'

const Footer = () => {
  return (
    <footer>
      <div className='mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-2 sm:gap-8 sm:px-6 sm:py-16 md:py-24 lg:grid-cols-5'>
        <div className='flex flex-col items-start gap-4 lg:col-span-2'>
          <a href='/'>
            <img src={logoPath} alt='ESYSYNC Logo' className='h-10 w-auto' />
          </a>
          <p className='text-muted-foreground text-balance'>
            Ihr zuverlässiger Partner für professionelle Display-Lösungen und erstklassigen Support.
            Schnelle Hilfe bei allen Problemen mit Ihrem Display.
          </p>
          <Separator className='!w-35' />
          <a href='/'>Support anfragen</a>
          <a href='/track'>RMA-Status prüfen</a>
        </div>

        <div className='flex flex-col gap-5'>
          <div className='text-lg font-medium'>Support</div>
          <ul className='text-muted-foreground space-y-3'>
            <li>
              <a href='/'>Support anfragen</a>
            </li>
            <li>
              <a href='/track'>RMA-Status prüfen</a>
            </li>
            <li>
              <a href='#'>FAQ</a>
            </li>
            <li>
              <a href='#'>Anleitungen</a>
            </li>
            <li>
              <a href='#'>Troubleshooting</a>
            </li>
          </ul>
        </div>

        <div className='flex flex-col gap-5'>
          <div className='text-lg font-medium'>Rechtliches</div>
          <ul className='text-muted-foreground space-y-3'>
            <li>
              <a href='#'>Datenschutz</a>
            </li>
            <li>
              <a href='#'>Impressum</a>
            </li>
            <li>
              <a href='#'>AGB</a>
            </li>
            <li>
              <a href='#'>Widerrufsbelehrung</a>
            </li>
          </ul>
        </div>

        <div className='flex flex-col gap-5'>
          <div className='text-lg font-medium'>Kontakt</div>
          <ul className='text-muted-foreground space-y-3'>
            <li className='flex items-start gap-2'>
              <MapPinIcon className='size-4 mt-1 shrink-0' />
              <span>AVANTOR Service Center<br />Musterstraße 123<br />12345 Berlin</span>
            </li>
            <li className='flex items-center gap-2'>
              <PhoneIcon className='size-4 shrink-0' />
              <a href='tel:+4912345678'>+49 123 456 789</a>
            </li>
            <li className='flex items-center gap-2'>
              <MailIcon className='size-4 shrink-0' />
              <a href='mailto:support@esysync.de'>support@esysync.de</a>
            </li>
          </ul>
        </div>
      </div>

      <Separator />

      <div className='mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-6 sm:px-6'>
        <p className='font-medium'>
          {`©${new Date().getFullYear()}`} <a href='#'>AVANTOR Service Center</a>. Alle Rechte vorbehalten.
        </p>

        <p className='text-muted-foreground text-sm'>
          Ein Service von <span className='font-medium text-foreground'>ESYSYNC</span>
        </p>
      </div>
    </footer>
  )
}

export default Footer

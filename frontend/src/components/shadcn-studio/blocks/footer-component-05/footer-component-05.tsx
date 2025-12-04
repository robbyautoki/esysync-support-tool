import { MailIcon, PhoneIcon, MapPinIcon } from 'lucide-react'

import { Separator } from '@/components/ui/separator'

import logoPath from '@assets/logo.png'

const Footer = () => {
  return (
    <footer className='bg-muted/30 border-t'>
      <div className='mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-2 sm:gap-8 sm:px-6 sm:py-12 lg:grid-cols-4'>
        {/* Company Info */}
        <div className='flex flex-col items-start gap-4 lg:col-span-1'>
          <a href='/'>
            <img src={logoPath} alt='ESYSYNC Logo' className='h-10 w-auto' />
          </a>
          <p className='text-muted-foreground text-sm text-balance'>
            Ihr zuverlässiger Partner für professionelle Display-Lösungen und erstklassigen Support.
          </p>
        </div>

        {/* Support Links */}
        <div className='flex flex-col gap-4'>
          <div className='text-lg font-medium'>Support</div>
          <ul className='text-muted-foreground space-y-2 text-sm'>
            <li>
              <a href='/' className='hover:text-primary transition-colors'>
                Support anfragen
              </a>
            </li>
            <li>
              <a href='/track' className='hover:text-primary transition-colors'>
                RMA-Status prüfen
              </a>
            </li>
            <li>
              <a href='#' className='hover:text-primary transition-colors'>
                FAQ
              </a>
            </li>
            <li>
              <a href='#' className='hover:text-primary transition-colors'>
                Anleitungen
              </a>
            </li>
          </ul>
        </div>

        {/* Legal Links */}
        <div className='flex flex-col gap-4'>
          <div className='text-lg font-medium'>Rechtliches</div>
          <ul className='text-muted-foreground space-y-2 text-sm'>
            <li>
              <a href='#' className='hover:text-primary transition-colors'>
                Datenschutz
              </a>
            </li>
            <li>
              <a href='#' className='hover:text-primary transition-colors'>
                Impressum
              </a>
            </li>
            <li>
              <a href='#' className='hover:text-primary transition-colors'>
                AGB
              </a>
            </li>
            <li>
              <a href='#' className='hover:text-primary transition-colors'>
                Widerrufsbelehrung
              </a>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className='flex flex-col gap-4'>
          <div className='text-lg font-medium'>Kontakt</div>
          <ul className='text-muted-foreground space-y-3 text-sm'>
            <li className='flex items-center gap-2'>
              <MapPinIcon className='size-4 text-primary' />
              <span>AVANTOR Service Center<br />Musterstraße 123, 12345 Berlin</span>
            </li>
            <li className='flex items-center gap-2'>
              <PhoneIcon className='size-4 text-primary' />
              <a href='tel:+4912345678' className='hover:text-primary transition-colors'>
                +49 123 456 789
              </a>
            </li>
            <li className='flex items-center gap-2'>
              <MailIcon className='size-4 text-primary' />
              <a href='mailto:support@esysync.de' className='hover:text-primary transition-colors'>
                support@esysync.de
              </a>
            </li>
          </ul>
        </div>
      </div>

      <Separator />

      {/* Copyright */}
      <div className='mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-6 sm:px-6'>
        <p className='text-muted-foreground text-sm'>
          &copy; {new Date().getFullYear()} AVANTOR Service Center. Alle Rechte vorbehalten.
        </p>
        <p className='text-muted-foreground text-sm'>
          Ein Service von <span className='font-medium text-foreground'>ESYSYNC</span>
        </p>
      </div>
    </footer>
  )
}

export default Footer

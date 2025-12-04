import { GithubIcon, InstagramIcon, ShieldCheckIcon, TwitterIcon, YoutubeIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

import Logo from '@/assets/svg/logo'

const Footer = () => {
  return (
    <footer>
      <div className='mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-2 sm:gap-8 sm:px-6 sm:py-16 md:py-24 lg:grid-cols-5'>
        <div className='flex flex-col items-start gap-4 lg:col-span-2'>
          <a href='#'>
            <Logo className='gap-3' />
          </a>
          <p className='text-muted-foreground text-balance'>
            An open-source collection of copy-and-paste shadcn/ui components, blocks, and templates - paired with a
            powerful Shadcn theme generator to craft, customize, and ship faster.
          </p>
          <div className='flex items-center gap-4'>
            <a href='#' target='#'>
              <GithubIcon className='size-5' />
            </a>
            <a href='#' target='#'>
              <InstagramIcon className='size-5 text-sky-600 dark:text-sky-400' />
            </a>
            <a href='#' target='#'>
              <TwitterIcon className='size-5 text-amber-600 dark:text-amber-400' />
            </a>
            <a href='#' target='#'>
              <YoutubeIcon className='text-destructive size-5' />
            </a>
          </div>
          <Separator className='!w-35' />
          <a href='#'>Roadmap</a>
          <a href='#'>Changelog</a>
        </div>

        <div className='flex flex-col gap-5'>
          <div className='text-lg font-medium'>Resources</div>
          <ul className='text-muted-foreground space-y-3'>
            <li>
              <a href='#'>Shadcn studio PRO</a>
            </li>
            <li>
              <a href='#'>Shadcn studio Figma</a>
            </li>
            <li>
              <a href='#'>Shadcn studio Blocks</a>
            </li>
            <li>
              <a href='#'>Shadcn studio Templates</a>
            </li>
            <li>
              <a href='#'>Shadcn studio Builder</a>
            </li>
          </ul>
        </div>

        <div className='flex flex-col gap-5'>
          <div className='text-lg font-medium'>Help and Support</div>
          <ul className='text-muted-foreground space-y-3'>
            <li>
              <a href='#'>Support</a>
            </li>
            <li>
              <a href='#'>Affiliation Program</a>
            </li>
            <li>
              <a href='#'>FAQs</a>
            </li>
            <li>
              <a href='#'>Discord Community</a>
            </li>
            <li>
              <a href='#'>Blog</a>
            </li>
            <li>
              <a href='#'>About Us</a>
            </li>
            <li>
              <a href='#'>Contact Us</a>
            </li>
            <li>
              <a href='#'>Hire Us</a>
            </li>
          </ul>
        </div>

        <div className='flex flex-col gap-5'>
          <div className='text-lg font-medium'>Legal</div>
          <ul className='text-muted-foreground space-y-3'>
            <li>
              <a href='#'>License</a>
            </li>
            <li>
              <a href='#'>Privacy policy</a>
            </li>
            <li>
              <a href='#'>Terms & Condition</a>
            </li>
            <li>
              <a href='#'>Brand Guideline</a>
            </li>
          </ul>
        </div>
      </div>

      <Separator />

      <div className='mx-auto flex max-w-7xl flex-wrap justify-between gap-3 px-4 py-6 max-sm:flex-col sm:items-center sm:px-6'>
        <p className='text-lg font-semibold'>Our Products:</p>
        <div className='flex w-fit gap-x-5 gap-y-3 max-sm:flex-col'>
          <a href='https://themeselection.com'>
            <img
              src='https://cdn.themeselection.com/ts-assets/themeselection/logo/logo.png'
              alt='themeselection logo'
              className='h-7.5'
            />
          </a>
          <Separator orientation='vertical' className='!h-7 max-sm:hidden' />
          <a href='https://pixinvent.com'>
            <img
              src='https://cdn.themeselection.com/ts-assets/pixinvent/logo/logo.png'
              alt='pixinvent logo'
              className='h-7.5'
            />
          </a>
          <Separator orientation='vertical' className='!h-7 max-sm:hidden' />
          <a href='https://pixinvent.com'>
            <img
              src='https://ts-assets.b-cdn.net/ts-assets/jetship/jetship-laravel-boilerplate/logo/logo.png'
              alt='jetship logo'
              className='h-7.5'
            />
          </a>
        </div>
      </div>

      <Separator />

      <div className='mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-6 sm:px-6'>
        <p className='font-medium'>
          {`©${new Date().getFullYear()}`} <a href='#'>Shadcn/studio</a>, Made with ❤️ for better web.
        </p>

        <div className='flex flex-wrap items-center gap-4'>
          <Badge variant='outline' className='text-base font-normal'>
            <ShieldCheckIcon className='!size-4.5 text-green-600' /> Secure Payment
          </Badge>
          <img
            src='https://cdn.shadcnstudio.com/ss-assets/brand-logo/lemon-squeezy.png'
            alt='Lemon Squeezy'
            className='h-6 dark:hidden'
          />
          <img
            src='https://cdn.shadcnstudio.com/ss-assets/brand-logo/lemon-squeezy-white.png'
            alt='Lemon Squeezy'
            className='hidden h-6 dark:inline-block'
          />
          <img src='https://cdn.shadcnstudio.com/ss-assets/brand-logo/visa.png' alt='Visa' className='h-5' />
          <img src='https://cdn.shadcnstudio.com/ss-assets/brand-logo/paypal.png' alt='Paypal' className='h-5' />
          <img src='https://cdn.shadcnstudio.com/ss-assets/brand-logo/master.png' alt='Mastercard' className='h-5' />
        </div>
      </div>
    </footer>
  )
}

export default Footer

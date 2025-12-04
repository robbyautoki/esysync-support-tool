import { HeadphonesIcon, MonitorIcon, WrenchIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { MotionPreset } from '@/components/ui/motion-preset'
import { Ripple } from '@/components/shadcn-studio/blocks/motion-ripple'

import { cn } from '@/lib/utils'
import logoPath from '@assets/logo.png'

interface HeroSectionProps {
  onStartSupport: () => void
}

const HeroSection = ({ onStartSupport }: HeroSectionProps) => {
  return (
    <section className='flex-1 pt-4 sm:pt-6 lg:pt-8'>
      <div className='mx-auto flex max-w-7xl flex-col items-center gap-16 px-4 sm:px-6 lg:px-8'>
        {/* Logo */}
        <MotionPreset
          fade
          slide={{ direction: 'down', offset: 30 }}
          transition={{ duration: 0.5 }}
        >
          <img
            src={logoPath}
            alt="ESYSYNC Logo"
            className="h-16 w-auto"
          />
        </MotionPreset>

        {/* Hero Content */}
        <div className='flex flex-col items-center gap-6 text-center'>
          <MotionPreset
            fade
            slide={{ direction: 'up', offset: 50 }}
            transition={{ duration: 0.5 }}
            className='bg-background border-primary flex w-fit items-center gap-2.5 rounded-full border px-2 py-1'
          >
            <span className='bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs font-medium'>
              Support
            </span>
            <span className='text-muted-foreground'>Schnelle Hilfe für Ihr Display</span>
          </MotionPreset>

          <MotionPreset
            component='h1'
            fade
            slide={{ direction: 'up', offset: 50 }}
            delay={0.3}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className='max-w-3xl text-3xl leading-[1.29167] font-bold sm:text-4xl lg:text-5xl'
          >
            Willkommen beim ESYSYNC Support Center
          </MotionPreset>

          <MotionPreset
            component='p'
            fade
            slide={{ direction: 'up', offset: 50 }}
            delay={0.6}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className='text-muted-foreground max-w-2xl text-lg'
          >
            Wir helfen Ihnen schnell und unkompliziert bei Problemen mit Ihrem Display.
            Starten Sie jetzt den Support-Prozess und erhalten Sie innerhalb weniger Minuten Ihre RMA-Nummer.
          </MotionPreset>

          <MotionPreset
            fade
            slide={{ direction: 'up', offset: 50 }}
            delay={0.9}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className='flex flex-wrap items-center justify-center gap-4 pt-4'
          >
            <Button
              size='lg'
              onClick={onStartSupport}
              className={cn(
                'group animate-rainbow text-primary-foreground focus-visible:ring-ring/50 relative inline-flex h-14 cursor-pointer items-center justify-center gap-3 rounded-full border-2 border-transparent bg-[length:200%] [background-clip:padding-box,border-box,border-box] [background-origin:border-box] px-8 py-2 text-lg font-semibold transition-colors focus-visible:ring-[3px] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
                'before:animate-rainbow before:absolute before:bottom-[-20%] before:left-0 before:z-0 before:h-1/5 before:w-full before:bg-[linear-gradient(90deg,#ff4242,#a1ff42,#42a1ff,#42d0ff,#a142ff)] before:[filter:blur(calc(0.625*1rem))]',
                'bg-[linear-gradient(var(--primary),var(--primary)),linear-gradient(var(--primary)_30%,rgba(0,0,0,0)),linear-gradient(90deg,#ff4242,#a1ff42,#42a1ff,#42d0ff,#a142ff)]'
              )}
            >
              <HeadphonesIcon className='size-5' />
              Support anfragen
            </Button>
          </MotionPreset>
        </div>
      </div>

      {/* Features Section */}
      <div className='relative pt-12 sm:pt-16 lg:pt-24'>
        <MotionPreset fade transition={{ duration: 0.5, ease: 'easeOut' }} delay={1}>
          <Ripple numCircles={4} mainCircleSize={320} className='*:border-0!' />
        </MotionPreset>

        <div className='relative mx-auto max-w-5xl px-4'>
          <MotionPreset
            fade
            slide={{ direction: 'up', offset: 50 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            delay={1.2}
          >
            <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
              {/* Feature 1 */}
              <div className='bg-background flex flex-col items-center gap-4 rounded-xl border p-6 shadow-sm'>
                <div className='bg-primary/10 rounded-full p-4'>
                  <MonitorIcon className='text-primary size-8' />
                </div>
                <h3 className='text-lg font-semibold'>Display-Probleme</h3>
                <p className='text-muted-foreground text-center text-sm'>
                  Hardware, Software oder Netzwerk - wir helfen bei allen Display-Problemen
                </p>
              </div>

              {/* Feature 2 */}
              <div className='bg-background flex flex-col items-center gap-4 rounded-xl border p-6 shadow-sm'>
                <div className='bg-primary/10 rounded-full p-4'>
                  <WrenchIcon className='text-primary size-8' />
                </div>
                <h3 className='text-lg font-semibold'>Schritt-für-Schritt</h3>
                <p className='text-muted-foreground text-center text-sm'>
                  Geführter Troubleshooting-Prozess mit Video-Anleitungen
                </p>
              </div>

              {/* Feature 3 */}
              <div className='bg-background flex flex-col items-center gap-4 rounded-xl border p-6 shadow-sm'>
                <div className='bg-primary/10 rounded-full p-4'>
                  <HeadphonesIcon className='text-primary size-8' />
                </div>
                <h3 className='text-lg font-semibold'>Schnelle RMA</h3>
                <p className='text-muted-foreground text-center text-sm'>
                  Erhalten Sie sofort Ihre RMA-Nummer und Versandunterlagen
                </p>
              </div>
            </div>
          </MotionPreset>
        </div>

        {/* Trust Banner */}
        <MotionPreset
          component='div'
          fade
          slide={{ direction: 'down', offset: 50 }}
          delay={1.5}
          transition={{ duration: 0.5 }}
          className='bg-primary relative z-1 mt-16 flex items-center justify-center gap-x-10 p-4'
        >
          <p className='text-center text-lg font-medium text-white dark:text-black'>
            Professioneller Support von AVANTOR - Ihrem Partner für Display-Lösungen
          </p>
        </MotionPreset>
      </div>
    </section>
  )
}

export default HeroSection

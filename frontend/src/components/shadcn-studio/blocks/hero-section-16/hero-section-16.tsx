import { DollarSignIcon } from 'lucide-react'

import WeeklyOverviewCard from '@/components/shadcn-studio/blocks/chart-weekly-overview'
import StatisticsCard, { type StatisticsCardProps } from '@/components/shadcn-studio/blocks/statistics-card-02'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Cursor, CursorFollow, CursorProvider } from '@/components/ui/cursor'
import { MotionPreset } from '@/components/ui/motion-preset'
import { Marquee } from '@/components/ui/marquee'
import { Ripple } from '@/components/shadcn-studio/blocks/motion-ripple'

import { cn } from '@/lib/utils'

const StatisticsCardData: StatisticsCardProps[] = [
  {
    icon: <DollarSignIcon className='size-3.5' />,
    title: 'Total Revenue',
    value: '$12,345',
    changePercentage: 15
  }
]

interface HeroSectionProps {
  onStartSupport?: () => void
}

const HeroSection = ({ onStartSupport }: HeroSectionProps) => {
  return (
    <section className='flex-1 pt-4 sm:pt-6 lg:pt-8'>
      <div className='mx-auto flex max-w-7xl flex-col items-center gap-16 px-4 sm:px-6 lg:px-8'>
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
            className='text-muted-foreground max-w-4xl'
          >
            Wir helfen Ihnen schnell und unkompliziert bei Problemen mit Ihrem Display.
            Starten Sie jetzt den Support-Prozess und erhalten Sie innerhalb weniger Minuten Ihre RMA-Nummer.
          </MotionPreset>

          <MotionPreset
            fade
            slide={{ direction: 'up', offset: 50 }}
            delay={0.9}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className='flex flex-wrap items-center gap-4'
          >
            <div className='bg-background flex h-fit w-full max-w-100 items-center justify-between gap-2.5 rounded-full border px-3.5 py-2'>
              <Label className='sr-only' htmlFor='prompt-space'>
                Ihre E-Mail-Adresse
              </Label>
              <Input
                type='text'
                placeholder='Ihre E-Mail-Adresse'
                id='prompt-space'
                className='placeholder:text-muted-foreground h-6 border-0 bg-transparent p-0 shadow-none focus:border-0 focus:ring-0 focus-visible:ring-0 md:text-base dark:bg-transparent'
              />

              <Button
                type='submit'
                onClick={onStartSupport}
                className={cn(
                  'group animate-rainbow text-primary-foreground focus-visible:ring-ring/50 relative inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-transparent bg-[length:200%] [background-clip:padding-box,border-box,border-box] [background-origin:border-box] px-2 py-1 text-xs font-medium transition-colors focus-visible:ring-[3px] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 max-lg:hidden',

                  // before styles
                  'before:animate-rainbow before:absolute before:bottom-[-20%] before:left-0 before:z-0 before:h-1/5 before:w-full before:bg-[linear-gradient(90deg,#ff4242,#a1ff42,#42a1ff,#42d0ff,#a142ff)] before:[filter:blur(calc(0.625*1rem))]',

                  // bg styles
                  'bg-[linear-gradient(var(--primary),var(--primary)),linear-gradient(var(--primary)_30%,rgba(0,0,0,0)),linear-gradient(90deg,#ff4242,#a1ff42,#42a1ff,#42d0ff,#a142ff)]'
                )}
              >
                Support anfragen
              </Button>
            </div>
          </MotionPreset>
        </div>

        {/* Hero Image with 3D Tilt Effect */}
      </div>

      <div className='relative pt-12 sm:pt-16 lg:pt-24'>
        <MotionPreset fade transition={{ duration: 0.5, ease: 'easeOut' }} delay={1}>
          <Ripple numCircles={4} mainCircleSize={320} className='*:border-0!' />{' '}
        </MotionPreset>
        <div className='relative mx-auto max-w-7xl'>
          <MotionPreset
            fade
            slide={{ direction: 'down', offset: 50 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            delay={1}
          >
            <img
              src='https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/hero/image-36.png'
              alt='girl Profile'
              className='relative h-122 w-full object-contain max-sm:-bottom-18'
            />
          </MotionPreset>
          <CursorProvider>
            <Cursor>
              <svg
                className='size-6 text-sky-600 dark:text-sky-400'
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 40 40'
              >
                <path
                  fill='currentColor'
                  d='M1.8 4.4 7 36.2c.3 1.8 2.6 2.3 3.6.8l3.9-5.7c1.7-2.5 4.5-4.1 7.5-4.3l6.9-.5c1.8-.1 2.5-2.4 1.1-3.5L5 2.5c-1.4-1.1-3.5 0-3.3 1.9Z'
                />
              </svg>
            </Cursor>
            <CursorFollow>
              <div className='rounded-lg bg-sky-600 px-2 py-1 text-sm text-white shadow-lg dark:bg-sky-400'>Jake</div>
            </CursorFollow>
          </CursorProvider>
          <MotionPreset
            fade
            blur
            delay={0.6}
            className='absolute end-13 top-0 w-full max-w-68 transition-transform duration-500 hover:scale-102 hover:rotate-6 max-lg:hidden'
          >
            {StatisticsCardData.map((card, index) => (
              <StatisticsCard
                key={index}
                icon={card.icon}
                title={card.title}
                value={card.value}
                changePercentage={card.changePercentage}
              />
            ))}
          </MotionPreset>
          <MotionPreset
            fade
            blur
            delay={0.6}
            className='absolute start-0 top-10 scale-50 transition-transform duration-500 hover:scale-55 hover:-rotate-6 max-xl:scale-40 max-lg:hidden'
          >
            <WeeklyOverviewCard />
          </MotionPreset>
        </div>
        <MotionPreset
          component='div'
          fade
          slide={{ direction: 'down', offset: 50 }}
          delay={0}
          transition={{ duration: 0.5 }}
          className='bg-primary relative z-1 flex items-center gap-x-10 p-4 max-sm:flex-col'
        >
          <p className='w-60 shrink-0 grow text-lg font-medium text-white uppercase dark:text-black'>
            Vertrauen Sie AVANTOR
          </p>
          <div className='relative'>
            <div className='from-primary pointer-events-none absolute inset-y-0 left-0 z-1 w-15 bg-gradient-to-r via-85% to-transparent max-sm:w-15' />
            <div className='from-primary pointer-events-none absolute inset-y-0 right-0 z-1 w-15 bg-gradient-to-l via-85% to-transparent max-sm:w-15' />
            <Marquee
              pauseOnHover
              duration={20}
              gap={4}
              reverse
              className='[&_.animate-marquee-horizontal]:items-center'
            >
              <img
                src='https://cdn.shadcnstudio.com/ss-assets/brand-logo/um-logo.png'
                alt='University of Mississippi'
                className='h-7.5 w-auto shrink-0 object-contain opacity-80 dark:invert'
              />
              <img
                src='https://cdn.shadcnstudio.com/ss-assets/brand-logo/star-helth-logo.png'
                alt='Star Health'
                className='h-9 w-auto shrink-0 object-contain opacity-80 dark:invert'
              />
              <img
                src='https://cdn.shadcnstudio.com/ss-assets/brand-logo/dhl-logo.png'
                alt='DHL'
                className='h-4 w-auto shrink-0 object-contain opacity-80 dark:invert'
              />
              <img
                src='https://cdn.shadcnstudio.com/ss-assets/brand-logo/sense-arena-logo.png'
                alt='Sense Arena'
                className='h-11 w-auto shrink-0 object-contain opacity-80 dark:invert'
              />
              <img
                src='https://cdn.shadcnstudio.com/ss-assets/brand-logo/shemaroo-logo.png'
                alt='Shemaroo'
                className='h-10 w-auto shrink-0 object-contain opacity-80 dark:invert'
              />
              <img
                src='https://cdn.shadcnstudio.com/ss-assets/brand-logo/mercedes-benz-logo.png'
                alt='Mercedes Benz'
                className='h-7.5 w-auto shrink-0 object-contain opacity-80 dark:invert'
              />
            </Marquee>
          </div>
        </MotionPreset>
      </div>
    </section>
  )
}

export default HeroSection

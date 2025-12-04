import { useState } from 'react'

import Header from '@/components/shadcn-studio/blocks/hero-section-16/header'
import HeroSection from '@/components/shadcn-studio/blocks/hero-section-16/hero-section-16'
import SupportForm from '@/components/shadcn-studio/blocks/support-form/SupportForm'
import Footer from '@/components/shadcn-studio/blocks/footer-component-05/footer-component-05'

import type { Navigation } from '@/components/shadcn-studio/blocks/hero-navigation-02'

const navigationData: Navigation[] = [
  { title: 'Support', href: '/' },
  { title: 'RMA Status', href: '/track' },
  { title: 'Kontakt', href: '#kontakt' },
]

export interface SupportFormData {
  selectedError: string | null
  selectedCategory: string | null
  restartConfirmed: boolean
  troubleshootingCompleted: boolean
  problemResolved: boolean
  shippingMethod: string | null
  // Customer and display data
  accountNumber: string | null
  displayNumber: string | null
  displayLocation: string | null
  returnAddress: string | null
  contactEmail: string | null
  // Additional device affected
  additionalDeviceAffected: boolean
  resolvedViaTutorial?: boolean
  // Shipping and contact person data
  alternativeShipping: boolean
  alternativeAddress: string | null
  alternativeCity: string | null
  alternativeZip: string | null
  contactPerson: string | null
  contactTitle: 'Frau' | 'Herr' | 'Divers'
  rmaNumber?: string
  // ESYSYNC-specific fields
  issueScope?: string | null
  specificMessage?: string | null
  troubleshootingSteps?: Record<string, boolean>
}

const initialFormData: SupportFormData = {
  selectedError: null,
  selectedCategory: null,
  restartConfirmed: false,
  troubleshootingCompleted: false,
  problemResolved: false,
  shippingMethod: null,
  accountNumber: null,
  displayNumber: null,
  displayLocation: null,
  returnAddress: null,
  contactEmail: null,
  additionalDeviceAffected: false,
  resolvedViaTutorial: false,
  alternativeShipping: false,
  alternativeAddress: null,
  alternativeCity: null,
  alternativeZip: null,
  contactPerson: null,
  contactTitle: 'Frau',
  issueScope: null,
  specificMessage: null,
  troubleshootingSteps: {},
}

export default function SupportPage() {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<SupportFormData>(initialFormData)

  const updateFormData = (updates: Partial<SupportFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const handleStartSupport = () => {
    setShowForm(true)
  }

  const handleComplete = () => {
    setFormData(initialFormData)
    setShowForm(false)
  }

  return (
    <div className='min-h-screen bg-background flex flex-col'>
      <Header navigationData={navigationData} />
      {showForm ? (
        <main className='flex-1 py-8'>
          <div className='mx-auto max-w-4xl px-4'>
            <SupportForm
              formData={formData}
              updateFormData={updateFormData}
              onComplete={handleComplete}
            />
          </div>
        </main>
      ) : (
        <HeroSection onStartSupport={handleStartSupport} />
      )}
      <Footer />
    </div>
  )
}

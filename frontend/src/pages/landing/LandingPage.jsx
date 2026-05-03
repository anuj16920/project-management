import React, { Suspense, lazy } from 'react'
import Navbar       from './components/Navbar'
import Hero         from './components/Hero'

const Stats        = lazy(() => import('./components/Stats'))
const Features     = lazy(() => import('./components/Features'))
const HowItWorks   = lazy(() => import('./components/HowItWorks'))
const Modules      = lazy(() => import('./components/Modules'))
const Pricing      = lazy(() => import('./components/Pricing'))
const Testimonials = lazy(() => import('./components/Testimonials'))
const CTA          = lazy(() => import('./components/CTA'))
const Footer       = lazy(() => import('./components/Footer'))

const Loader = () => (
  <div className="w-full py-24 flex items-center justify-center">
    <div className="w-7 h-7 border-2 border-accent border-t-transparent rounded-full animate-spin" />
  </div>
)

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg font-body">
      <Navbar />
      <main>
        <Hero />
        <Suspense fallback={<Loader />}>
          <Stats />
          <Features />
          <HowItWorks />
          <Modules />
          <Pricing />
          <Testimonials />
          <CTA />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  )
}
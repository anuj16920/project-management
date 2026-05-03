import React from 'react'
import CountUp from 'react-countup'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import { STATS } from '@/lib/constants'

export default function Stats() {
  const { ref, inView } = useScrollAnimation()
  return (
    <section ref={ref} className="py-20 border-y border-white/5 bg-surface">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((s, i) => (
            <div key={i}>
              <div className="font-display font-black text-4xl md:text-5xl text-text-p mb-2">
                {inView
                  ? <CountUp end={s.value} duration={2.5} decimals={s.decimals||0} suffix={s.suffix} />
                  : <span>0{s.suffix}</span>}
              </div>
              <p className="text-text-m text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
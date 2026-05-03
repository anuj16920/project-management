import React, { useRef } from 'react'

export default function OTPInput({ length = 6, value, onChange }) {
  const inputs = useRef([])

  const handleChange = (e, i) => {
    const val = e.target.value.replace(/\D/g, '')
    if (!val) return
    const arr = value.split('')
    arr[i] = val[0]
    onChange(arr.join(''))
    if (i < length - 1) inputs.current[i + 1]?.focus()
  }

  const handleKeyDown = (e, i) => {
    if (e.key === 'Backspace') {
      const arr = value.split('')
      if (!arr[i] && i > 0) {
        arr[i - 1] = ''
        onChange(arr.join(''))
        inputs.current[i - 1]?.focus()
      } else {
        arr[i] = ''
        onChange(arr.join(''))
      }
    }
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g,'').slice(0, length)
    onChange(pasted.padEnd(length, ''))
    inputs.current[Math.min(pasted.length, length - 1)]?.focus()
    e.preventDefault()
  }

  return (
    <div className="flex gap-3 justify-center">
      {Array(length).fill(0).map((_, i) => (
        <input key={i}
          ref={el => inputs.current[i] = el}
          type="text" inputMode="numeric" maxLength={1}
          value={value[i] || ''}
          onChange={e => handleChange(e, i)}
          onKeyDown={e => handleKeyDown(e, i)}
          onPaste={handlePaste}
          className="w-12 h-14 text-center text-xl font-display font-bold text-text-p bg-surface2 border border-white/10 focus:border-accent/60 focus:ring-2 focus:ring-accent/20 rounded-xl outline-none transition-all"
        />
      ))}
    </div>
  )
}
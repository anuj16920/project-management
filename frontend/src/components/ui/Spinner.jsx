import React from 'react'

export default function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm:'w-4 h-4', md:'w-6 h-6', lg:'w-8 h-8', xl:'w-10 h-10' }
  return (
    <div className={`${sizes[size]} border-2 border-accent border-t-transparent rounded-full animate-spin ${className}`} />
  )
}
import React from 'react'

export function Skeleton({ className = '' }) {
  return (
    <div className={`bg-surface2 rounded-lg animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-surface2 via-white/5 to-surface2 ${className}`} />
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-surface border border-white/5 rounded-2xl p-5 space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  )
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array(4).fill(0).map((_,i) => <SkeletonCard key={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-surface border border-white/5 rounded-2xl p-5">
          <Skeleton className="h-4 w-1/4 mb-6" />
          <Skeleton className="h-48 w-full" />
        </div>
        <div className="bg-surface border border-white/5 rounded-2xl p-5 space-y-3">
          <Skeleton className="h-4 w-1/3 mb-4" />
          {Array(5).fill(0).map((_,i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      </div>
    </div>
  )
}
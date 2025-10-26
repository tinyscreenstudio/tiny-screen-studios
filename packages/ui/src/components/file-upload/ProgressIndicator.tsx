import React from 'react'
import { useAppStore } from '../../store/appStore'

export function ProgressIndicator() {
  const { isProcessing, progressText, progressPercentage } = useAppStore()

  if (!isProcessing) return null

  return (
    <div className="mt-6 animate-slide-up">
      <div className="card p-4" style={{ backgroundColor: 'rgba(99, 102, 241, 0.05)', border: `1px solid rgba(99, 102, 241, 0.2)` }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-6 h-6 relative">
            <div className="absolute inset-0 border-2 rounded-full" style={{ borderColor: 'var(--color-border)' }}></div>
            <div className="absolute inset-0 border-2 border-transparent rounded-full animate-spin" style={{ borderTopColor: 'var(--color-primary)' }}></div>
          </div>
          <span className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>{progressText}</span>
        </div>
        
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${Math.min(100, Math.max(0, progressPercentage))}%` }}
          />
        </div>
        
        <div className="flex justify-between text-xs mt-2" style={{ color: 'var(--color-muted)' }}>
          <span>Processing...</span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>{Math.round(progressPercentage)}%</span>
        </div>
      </div>
    </div>
  )
}
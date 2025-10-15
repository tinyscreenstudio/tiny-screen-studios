import React from 'react'
import { useAppStore } from '../store/appStore'

export function ProgressIndicator() {
  const { isProcessing, progressText, progressPercentage } = useAppStore()

  if (!isProcessing) return null

  return (
    <div className="mt-6 animate-slide-up">
      <div className="card p-4 bg-primary-50 border border-primary-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-6 h-6 relative">
            <div className="absolute inset-0 border-2 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 border-2 border-transparent border-t-primary-600 rounded-full animate-spin"></div>
          </div>
          <span className="text-sm font-medium text-primary-700">{progressText}</span>
        </div>
        
        <div className="progress">
          <div 
            className="progress-fill"
            style={{ width: `${Math.min(100, Math.max(0, progressPercentage))}%` }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-gray-600 mt-2">
          <span>Processing...</span>
          <span className="font-mono">{Math.round(progressPercentage)}%</span>
        </div>
      </div>
    </div>
  )
}
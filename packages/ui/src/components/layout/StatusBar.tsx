import React from 'react'
import { useAppStore } from '../../store/appStore'
import { ClockIcon, DocumentIcon, CpuChipIcon } from '@heroicons/react/24/outline'

export function StatusBar() {
  const { 
    currentFiles, 
    currentPackedFrames, 
    devicePreset, 
    isProcessing,
    progressText,
    progressPercentage 
  } = useAppStore()

  return (
    <div style={{ borderBottom: `1px solid var(--color-border)`, backgroundColor: 'var(--color-surface)' }} className="backdrop-blur-sm">
      <div className="container mx-auto px-6 py-3 max-w-[1600px]">
        <div className="flex items-center justify-between text-sm">
          {/* Left side - File info */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <DocumentIcon className="w-4 h-4" style={{ color: 'var(--color-info)' }} />
              <span style={{ color: 'var(--color-text)', fontFamily: 'var(--font-mono)' }}>
                {currentFiles.length} file{currentFiles.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            {currentPackedFrames.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-success)' }}></div>
                <span style={{ color: 'var(--color-text)', fontFamily: 'var(--font-mono)' }}>
                  {currentPackedFrames.length} frame{currentPackedFrames.length !== 1 ? 's' : ''} ready
                </span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <CpuChipIcon className="w-4 h-4" style={{ color: '#ec4899' }} />
              <span style={{ color: 'var(--color-text)', fontFamily: 'var(--font-mono)' }}>{devicePreset}</span>
            </div>
          </div>

          {/* Center - Processing status */}
          {isProcessing && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-warning)' }}></div>
                <span style={{ color: 'var(--color-warning)', fontFamily: 'var(--font-mono)' }}>{progressText}</span>
              </div>
              <div className="w-32 h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
                <div 
                  className="h-full transition-all duration-300"
                  style={{ 
                    width: `${progressPercentage}%`,
                    background: 'linear-gradient(90deg, var(--color-info) 0%, #ec4899 100%)'
                  }}
                />
              </div>
            </div>
          )}

          {/* Right side - System info */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4" style={{ color: 'var(--color-muted)' }} />
              <span style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            
            <div style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>
              v0.1.0
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
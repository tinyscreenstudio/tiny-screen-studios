import React from 'react'
import { useAppStore } from '../store/appStore'
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
    <div className="border-b border-dark-700/50 bg-dark-800/30 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-3 max-w-[1600px]">
        <div className="flex items-center justify-between text-sm">
          {/* Left side - File info */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <DocumentIcon className="w-4 h-4 text-neon-cyan" />
              <span className="text-dark-200 font-mono">
                {currentFiles.length} file{currentFiles.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            {currentPackedFrames.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
                <span className="text-dark-200 font-mono">
                  {currentPackedFrames.length} frame{currentPackedFrames.length !== 1 ? 's' : ''} ready
                </span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <CpuChipIcon className="w-4 h-4 text-neon-pink" />
              <span className="text-dark-200 font-mono">{devicePreset}</span>
            </div>
          </div>

          {/* Center - Processing status */}
          {isProcessing && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-neon-yellow rounded-full animate-pulse"></div>
                <span className="text-neon-yellow font-mono">{progressText}</span>
              </div>
              <div className="w-32 h-1 bg-dark-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-neon-cyan to-neon-pink transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Right side - System info */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-dark-400" />
              <span className="text-dark-400 font-mono">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            
            <div className="text-dark-400 font-mono">
              v0.1.0
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
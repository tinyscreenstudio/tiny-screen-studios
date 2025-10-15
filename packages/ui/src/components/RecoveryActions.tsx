import React from 'react'
import { ArrowPathIcon, TrashIcon, Cog6ToothIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { useAppStore } from '../store/appStore'
import { processFiles } from '../utils/fileProcessor'

export function RecoveryActions() {
  const { 
    currentFiles, 
    isProcessing,
    clearFiles, 
    resetSettings,
    validationResults,
    fileValidation 
  } = useAppStore()

  const hasErrors = validationResults?.errors.length || fileValidation?.fileErrors.size

  if (!hasErrors || isProcessing) return null

  const handleRetry = () => {
    if (currentFiles.length > 0) {
      processFiles(currentFiles)
    }
  }

  const handleClearFiles = () => {
    clearFiles()
  }

  const handleResetSettings = () => {
    resetSettings()
    if (currentFiles.length > 0) {
      processFiles(currentFiles)
    }
  }

  return (
    <div className="mt-6 glass-panel border border-neon-yellow/30 bg-neon-yellow/5">
      <div className="flex items-center gap-3 mb-4">
        <ExclamationTriangleIcon className="w-5 h-5 text-neon-yellow" />
        <h4 className="text-sm font-semibold text-dark-100">
          Recovery Options
        </h4>
      </div>
      
      <p className="text-sm text-dark-300 mb-4">
        Something went wrong during processing. Try one of these recovery options:
      </p>
      
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleRetry}
          className="btn-neon-primary flex items-center gap-2 text-sm"
        >
          <ArrowPathIcon className="w-4 h-4" />
          Retry Processing
        </button>
        
        <button
          onClick={handleClearFiles}
          className="btn-neon-secondary flex items-center gap-2 text-sm"
        >
          <TrashIcon className="w-4 h-4" />
          Clear Files
        </button>
        
        <button
          onClick={handleResetSettings}
          className="btn-neon flex items-center gap-2 text-sm"
        >
          <Cog6ToothIcon className="w-4 h-4" />
          Reset Settings
        </button>
      </div>
    </div>
  )
}
import React from 'react'
import { ArrowPathIcon, TrashIcon, Cog6ToothIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { useAppStore } from '../../store/appStore'
import { processFiles } from '../../utils/fileProcessor'

export function RecoveryActions() {
  const { 
    currentFiles, 
    isProcessing,
    clearFiles, 
    resetSettings,
    validationResults
  } = useAppStore()

  const hasProcessingErrors = (validationResults?.errors?.length ?? 0) > 0

  // Only show recovery actions for processing errors, not file validation errors
  if (!hasProcessingErrors || isProcessing) return null

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

  // Get the error message to display
  const errorMessage = validationResults?.errors[0]?.message || 'An unknown error occurred during processing.'

  return (
    <div className="card mt-6 p-6" style={{ borderLeft: `4px solid var(--color-danger)`, backgroundColor: 'rgba(239, 68, 68, 0.05)' }}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
            <ExclamationTriangleIcon className="w-6 h-6" style={{ color: 'var(--color-danger)' }} />
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
            Processing Failed
          </h3>
          <p className="mb-4 font-medium" style={{ color: 'var(--color-danger)' }}>
            {errorMessage}
          </p>
          <p className="mb-6" style={{ color: 'var(--color-muted)' }}>
            Here are some quick solutions to get you back on track:
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={handleRetry}
              className="btn-primary flex items-center justify-center gap-2 py-3"
            >
              <ArrowPathIcon className="w-4 h-4" />
              <span>Retry Processing</span>
            </button>
            
            <button
              onClick={handleResetSettings}
              className="btn-secondary flex items-center justify-center gap-2 py-3"
            >
              <Cog6ToothIcon className="w-4 h-4" />
              <span>Reset Settings</span>
            </button>
            
            <button
              onClick={handleClearFiles}
              className="btn-outline flex items-center justify-center gap-2 py-3"
            >
              <TrashIcon className="w-4 h-4" />
              <span>Clear Files</span>
            </button>
          </div>
          
          <div className="mt-4 text-xs" style={{ color: 'var(--color-muted)' }}>
            <p><strong>Tip:</strong> Most issues are resolved by retrying or resetting your display settings.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
import React from 'react'
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { useAppStore } from '../store/appStore'

export function ValidationResults() {
  const { validationResults, fileValidation } = useAppStore()

  if (!validationResults && !fileValidation) return null

  return (
    <div className="mt-6 space-y-3">
      {/* File validation results */}
      {fileValidation && fileValidation.validCount > 0 && (
        <div className="status-success flex items-start gap-3">
          <CheckCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5 text-neon-green" />
          <div>
            <div className="font-medium">Files Validated</div>
            <div className="text-sm opacity-90 mt-1">
              {fileValidation.validCount} valid PNG file(s) ready for processing
            </div>
          </div>
        </div>
      )}

      {fileValidation && fileValidation.fileErrors.size > 0 && (
        <div className="status-error flex items-start gap-3">
          <XCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5 text-neon-pink" />
          <div>
            <div className="font-medium">File Errors</div>
            <div className="text-sm opacity-90 mt-1">
              {fileValidation.fileErrors.size} file(s) have errors and will be skipped
            </div>
          </div>
        </div>
      )}

      {fileValidation?.warnings.map((warning, index) => (
        <div key={index} className="status-warning flex items-start gap-3">
          <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5 text-neon-yellow" />
          <div>
            <div className="font-medium">Warning</div>
            <div className="text-sm opacity-90 mt-1">{warning}</div>
          </div>
        </div>
      ))}

      {/* Processing validation results */}
      {validationResults?.errors.map((error, index) => (
        <div key={index} className="status-error flex items-start gap-3">
          <XCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5 text-neon-pink" />
          <div>
            <div className="font-medium">Processing Error</div>
            <div className="text-sm opacity-90 mt-1">{error.message}</div>
          </div>
        </div>
      ))}

      {validationResults?.warnings.map((warning, index) => (
        <div key={index} className="status-warning flex items-start gap-3">
          <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5 text-neon-yellow" />
          <div>
            <div className="font-medium">Processing Warning</div>
            <div className="text-sm opacity-90 mt-1">{warning.message}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
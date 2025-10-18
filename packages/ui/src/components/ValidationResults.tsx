import React from 'react'
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { useAppStore } from '../store/appStore'

export function ValidationResults() {
  const { validationResults, fileValidation } = useAppStore()

  if (!validationResults && !fileValidation) return null

  // Check if there are any errors
  const hasProcessingErrors = (validationResults?.errors?.length ?? 0) > 0
  const hasFileErrors = (fileValidation?.fileErrors?.size ?? 0) > 0

  return (
    <div className="mt-6 space-y-3">
      {/* Only show success if no processing errors */}
      {fileValidation && fileValidation.validCount > 0 && !hasProcessingErrors && (
        <div className="status-success flex items-start gap-3">
          <CheckCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-success)' }} />
          <div>
            <div className="font-medium" style={{ color: 'var(--color-success)' }}>Files Validated</div>
            <div className="text-sm mt-1" style={{ color: 'var(--color-success)' }}>
              {fileValidation.validCount} valid PNG file(s) ready for processing
            </div>
          </div>
        </div>
      )}

      {/* File errors */}
      {hasFileErrors && (
        <div className="status-error flex items-start gap-3">
          <XCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-danger)' }} />
          <div>
            <div className="font-medium" style={{ color: 'var(--color-danger)' }}>File Errors</div>
            <div className="text-sm mt-1" style={{ color: 'var(--color-danger)' }}>
              {fileValidation?.fileErrors.size} file(s) have errors and will be skipped
            </div>
          </div>
        </div>
      )}



      {/* Warnings */}
      {fileValidation?.warnings.map((warning, index) => (
        <div key={index} className="status-warning flex items-start gap-3">
          <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-warning)' }} />
          <div>
            <div className="font-medium" style={{ color: 'var(--color-warning)' }}>Warning</div>
            <div className="text-sm mt-1" style={{ color: 'var(--color-warning)' }}>{warning}</div>
          </div>
        </div>
      ))}

      {validationResults?.warnings.map((warning, index) => (
        <div key={index} className="status-warning flex items-start gap-3">
          <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-warning)' }} />
          <div>
            <div className="font-medium" style={{ color: 'var(--color-warning)' }}>Processing Warning</div>
            <div className="text-sm mt-1" style={{ color: 'var(--color-warning)' }}>{warning.message}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
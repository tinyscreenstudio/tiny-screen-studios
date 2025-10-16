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
        <div className="status-success">
          <CheckCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" />
          <div>
            <div className="font-medium text-emerald-800">Files Validated</div>
            <div className="text-sm text-emerald-700 mt-1">
              {fileValidation.validCount} valid PNG file(s) ready for processing
            </div>
          </div>
        </div>
      )}

      {/* File errors */}
      {hasFileErrors && (
        <div className="status-error">
          <XCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
          <div>
            <div className="font-medium text-red-800">File Errors</div>
            <div className="text-sm text-red-700 mt-1">
              {fileValidation?.fileErrors.size} file(s) have errors and will be skipped
            </div>
          </div>
        </div>
      )}



      {/* Warnings */}
      {fileValidation?.warnings.map((warning, index) => (
        <div key={index} className="status-warning">
          <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
          <div>
            <div className="font-medium text-amber-800">Warning</div>
            <div className="text-sm text-amber-700 mt-1">{warning}</div>
          </div>
        </div>
      ))}

      {validationResults?.warnings.map((warning, index) => (
        <div key={index} className="status-warning">
          <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
          <div>
            <div className="font-medium text-amber-800">Processing Warning</div>
            <div className="text-sm text-amber-700 mt-1">{warning.message}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
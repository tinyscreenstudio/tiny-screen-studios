import React from 'react'
import { DocumentIcon, CheckCircleIcon, XCircleIcon, PhotoIcon } from '@heroicons/react/24/outline'
import { useAppStore } from '../store/appStore'

export function FileList() {
  const { currentFiles, fileValidation } = useAppStore()

  if (currentFiles.length === 0) return null

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  return (
    <div className="mt-6">
      <h3 className="text-sm font-medium mb-3 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
        <PhotoIcon className="w-4 h-4" style={{ color: 'var(--color-info)' }} />
        Uploaded Files ({currentFiles.length})
      </h3>
      
      <div className="max-h-64 overflow-y-auto" style={{ backgroundColor: 'var(--color-surface)', border: `1px solid var(--color-border)`, borderRadius: 'var(--radius-md)' }}>
        {currentFiles.map((file, index) => {
          const hasError = fileValidation?.fileErrors.has(index)
          const errorMessage = fileValidation?.fileErrors.get(index)
          
          return (
            <div 
              key={index} 
              className="flex items-center justify-between p-3 last:border-b-0 hover:opacity-80 transition-colors duration-200"
              style={{ 
                borderBottom: `1px solid var(--color-border)`,
                backgroundColor: hasError ? 'rgba(239, 68, 68, 0.05)' : 'rgba(16, 185, 129, 0.05)'
              }}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{
                  backgroundColor: hasError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                  border: `1px solid ${hasError ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                }}>
                  <DocumentIcon className="w-4 h-4" style={{ color: hasError ? 'var(--color-danger)' : 'var(--color-success)' }} />
                </div>
                
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-mono)' }}>
                    {file.name}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                {hasError ? (
                  <div className="flex items-center gap-2">
                    <XCircleIcon className="w-4 h-4" style={{ color: 'var(--color-danger)' }} />
                    <span className="text-xs font-medium max-w-32 truncate" style={{ color: 'var(--color-danger)' }}>
                      {errorMessage}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4" style={{ color: 'var(--color-success)' }} />
                    <span className="text-xs font-medium" style={{ color: 'var(--color-success)' }}>
                      Valid
                    </span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
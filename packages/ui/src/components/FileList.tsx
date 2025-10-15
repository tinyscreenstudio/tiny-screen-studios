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
      <h3 className="text-sm font-medium text-dark-200 mb-3 flex items-center gap-2">
        <PhotoIcon className="w-4 h-4 text-neon-cyan" />
        Uploaded Files ({currentFiles.length})
      </h3>
      
      <div className="glass-panel border border-dark-600/30 max-h-64 overflow-y-auto">
        {currentFiles.map((file, index) => {
          const hasError = fileValidation?.fileErrors.has(index)
          const errorMessage = fileValidation?.fileErrors.get(index)
          
          return (
            <div 
              key={index} 
              className={`
                flex items-center justify-between p-3 border-b border-dark-600/20 last:border-b-0
                ${hasError ? 'bg-neon-pink/5' : 'bg-neon-green/5'}
                hover:bg-dark-700/30 transition-colors duration-200
              `}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`
                  w-8 h-8 rounded-lg flex items-center justify-center
                  ${hasError 
                    ? 'bg-neon-pink/20 border border-neon-pink/30' 
                    : 'bg-neon-green/20 border border-neon-green/30'
                  }
                `}>
                  <DocumentIcon className={`w-4 h-4 ${hasError ? 'text-neon-pink' : 'text-neon-green'}`} />
                </div>
                
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-dark-100 truncate font-mono">
                    {file.name}
                  </p>
                  <p className="text-xs text-dark-400 font-mono">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                {hasError ? (
                  <div className="flex items-center gap-2">
                    <XCircleIcon className="w-4 h-4 text-neon-pink" />
                    <span className="text-xs text-neon-pink font-medium max-w-32 truncate">
                      {errorMessage}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-neon-green" />
                    <span className="text-xs text-neon-green font-medium">
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
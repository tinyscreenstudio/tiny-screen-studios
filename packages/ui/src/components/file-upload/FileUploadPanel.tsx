import React, { useCallback, useRef, useState, useEffect } from 'react'
import { CloudArrowUpIcon, DocumentIcon, PhotoIcon, FilmIcon } from '@heroicons/react/24/outline'
import { useAppStore } from '../../store/appStore'
import { ValidationResults } from './ValidationResults'
import { ProgressIndicator } from './ProgressIndicator'
import { FileList } from './FileList'
import { RecoveryActions } from './RecoveryActions'
import { processFiles } from '../../utils/fileProcessor'

export function FileUploadPanel() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  
  const {
    currentFiles,
    isProcessing,
    fileValidation,
    validationResults,
    setCurrentFiles,
  } = useAppStore()

  // Reset file input when files are cleared
  useEffect(() => {
    if (currentFiles.length === 0 && fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [currentFiles.length])

  const handleFileSelect = useCallback((files: File[]) => {
    console.log('handleFileSelect called with:', files.length, 'files')
    console.log('isProcessing:', isProcessing)
    
    if (isProcessing || files.length === 0) {
      console.log('Skipping file processing - isProcessing:', isProcessing, 'files.length:', files.length)
      return
    }
    
    setCurrentFiles(files)
    processFiles(files)
  }, [isProcessing, setCurrentFiles])

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      handleFileSelect(Array.from(files))
    }
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
    const files = event.dataTransfer.files
    if (files) {
      handleFileSelect(Array.from(files))
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0.2) 100%)' }}>
          <DocumentIcon className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
        </div>
        <div>
          <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
            Upload Files
          </h2>
          <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Drag & drop your pixel art</p>
        </div>
      </div>

      {/* File Upload Area */}
      <div
        className={`
          upload-zone transition-all duration-300 group relative
          ${isDragOver ? 'dragover' : ''}
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={!isProcessing ? openFileDialog : undefined}
      >
        <div className="text-center">
          <CloudArrowUpIcon className="w-16 h-16 mx-auto mb-4 transition-colors duration-300" style={{ color: 'var(--color-muted)' }} />
          
          <p className="text-lg font-medium mb-2" style={{ color: 'var(--color-text)' }}>
            {isProcessing ? 'Processing files...' : 'Drop your pixel art here'}
          </p>
          <p className="mb-6" style={{ color: 'var(--color-muted)' }}>
            or click to browse your files
          </p>
          
          {!isProcessing && (
            <button
              className="btn-primary mb-6"
              onClick={(e) => {
                e.stopPropagation()
                openFileDialog()
              }}
            >
              Choose Files
            </button>
          )}
          
          <div className="flex items-center justify-center gap-6 text-sm" style={{ color: 'var(--color-muted)' }}>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }}>
              <PhotoIcon className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
              <span>PNG Images</span>
            </div>
            <div className="w-px h-6" style={{ backgroundColor: 'var(--color-border)' }}></div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }}>
              <FilmIcon className="w-4 h-4" style={{ color: '#8b5cf6' }} />
              <span>Animations</span>
            </div>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".png"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Progress Indicator */}
      <ProgressIndicator />

      {/* File List */}
      {currentFiles.length > 0 && <FileList />}

      {/* Validation Results */}
      <ValidationResults />

      {/* Recovery Actions */}
      {(validationResults?.errors.length || fileValidation?.fileErrors.size) && (
        <RecoveryActions />
      )}
    </div>
  )
}
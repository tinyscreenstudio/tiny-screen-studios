import React, { useCallback, useRef, useState } from 'react'
import { CloudArrowUpIcon, DocumentIcon, PhotoIcon, FilmIcon } from '@heroicons/react/24/outline'
import { useAppStore } from '../store/appStore'
import { ValidationResults } from './ValidationResults'
import { ProgressIndicator } from './ProgressIndicator'
import { FileList } from './FileList'
import { RecoveryActions } from './RecoveryActions'
import { processFiles } from '../utils/fileProcessor'

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

  const handleFileSelect = useCallback((files: File[]) => {
    if (isProcessing || files.length === 0) return
    
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
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl flex items-center justify-center">
          <DocumentIcon className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Upload Files
          </h2>
          <p className="text-gray-600 text-sm">Drag & drop your pixel art</p>
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
          <CloudArrowUpIcon className="w-16 h-16 text-gray-400 mx-auto mb-4 group-hover:text-indigo-500 transition-colors duration-300" />
          
          <p className="text-lg font-medium text-gray-900 mb-2">
            {isProcessing ? 'Processing files...' : 'Drop your pixel art here'}
          </p>
          <p className="text-gray-600 mb-6">
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
          
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
              <PhotoIcon className="w-4 h-4 text-indigo-500" />
              <span>PNG Images</span>
            </div>
            <div className="w-px h-6 bg-gray-300"></div>
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
              <FilmIcon className="w-4 h-4 text-purple-500" />
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
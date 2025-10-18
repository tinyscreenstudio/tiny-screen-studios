import React, { useState } from 'react'
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { useAppStore } from '../store/appStore'

export function ExportControlsPanel() {
  const [selectedFormat, setSelectedFormat] = useState<'binary' | 'concatenated' | 'carray' | 'cfiles'>('carray')
  const [exportStatus, setExportStatus] = useState<{
    isExporting: boolean
    progress: number
    message: string
    type: 'info' | 'success' | 'error'
  }>({
    isExporting: false,
    progress: 0,
    message: '',
    type: 'info'
  })

  const {
    currentPackedFrames,
    symbolName,
    bytesPerRow,
    perFrame,
    includeMetadata,
    setSymbolName,
    setBytesPerRow,
    setPerFrame,
    setIncludeMetadata,
  } = useAppStore()

  const hasFrames = currentPackedFrames.length > 0

  const handleExport = async (type: 'binary' | 'concatenated' | 'carray' | 'cfiles') => {
    if (!hasFrames) return

    setExportStatus({
      isExporting: true,
      progress: 0,
      message: 'Preparing export...',
      type: 'info'
    })

    try {
      const { makeByteFiles, makeConcatenatedByteFile, makeCArrayFiles } = await import('@tiny-screen-studios/core')
      
      setExportStatus(prev => ({ ...prev, progress: 25, message: 'Processing frames...' }))

      setExportStatus(prev => ({ ...prev, progress: 50, message: 'Generating output...' }))

      switch (type) {
        case 'binary': {
          const files = makeByteFiles(currentPackedFrames, symbolName)
          setExportStatus(prev => ({ ...prev, progress: 75, message: 'Creating download...' }))
          for (const file of files) {
            downloadFile(file.name, file.data, file.mimeType || 'application/octet-stream')
          }
          break
        }
        case 'concatenated': {
          const file = makeConcatenatedByteFile(currentPackedFrames, symbolName)
          setExportStatus(prev => ({ ...prev, progress: 75, message: 'Creating download...' }))
          downloadFile(file.name, file.data, file.mimeType || 'application/octet-stream')
          break
        }
        case 'carray': {
          const { toCRawArray } = await import('@tiny-screen-studios/core')
          const cCode = toCRawArray(currentPackedFrames, symbolName, {
            bytesPerRow,
            perFrame,
            includeMetadata,
          })
          setExportStatus(prev => ({ ...prev, progress: 75, message: 'Creating download...' }))
          downloadFile(`${symbolName}.c`, cCode, 'text/plain')
          break
        }
        case 'cfiles': {
          const files = makeCArrayFiles(currentPackedFrames, symbolName, {
            bytesPerRow,
            perFrame,
            includeMetadata,
          })
          setExportStatus(prev => ({ ...prev, progress: 75, message: 'Creating download...' }))
          for (const file of files) {
            downloadFile(file.name, file.data, file.mimeType || 'text/plain')
          }
          break
        }
        default:
          throw new Error('Unknown export type')
      }

      setExportStatus({
        isExporting: false,
        progress: 100,
        message: 'Export completed successfully!',
        type: 'success'
      })

      // Clear success message after 3 seconds
      setTimeout(() => {
        setExportStatus(prev => ({ ...prev, message: '', progress: 0 }))
      }, 3000)

    } catch (error) {
      console.error('Export error:', error)
      setExportStatus({
        isExporting: false,
        progress: 0,
        message: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error'
      })

      // Clear error message after 5 seconds
      setTimeout(() => {
        setExportStatus(prev => ({ ...prev, message: '' }))
      }, 5000)
    }
  }

  const downloadFile = (filename: string, content: string | Uint8Array, mimeType: string) => {
    const blob = new Blob([content as BlobPart], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="card p-3">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0.2) 100%)' }}>
          <ArrowDownTrayIcon className="w-4 h-4" style={{ color: '#8b5cf6' }} />
        </div>
        <div>
          <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>
            Export & Download
          </h2>
        </div>
        {hasFrames && (
          <div className="ml-auto flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-success)' }}></div>
            <span style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>READY</span>
          </div>
        )}
      </div>

      {/* Streamlined Export Configuration */}
      <div className="space-y-3">
        {/* Configuration Row */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Symbol Name */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium whitespace-nowrap" style={{ color: 'var(--color-text)' }}>Symbol Name:</label>
            <input
              type="text"
              value={symbolName}
              onChange={(e) => setSymbolName(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
              className="w-32 px-2 py-1 text-xs rounded focus:outline-none focus:ring-1"
              style={{ 
                backgroundColor: 'var(--color-bg)', 
                border: `1px solid var(--color-border)`,
                color: 'var(--color-text)',
                fontFamily: 'var(--font-mono)'
              }}
              placeholder="display_data"
              disabled={exportStatus.isExporting}
            />
          </div>

          {/* Bytes per Row */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium whitespace-nowrap" style={{ color: 'var(--color-text)' }}>Bytes per Row:</label>
            <input
              type="range"
              min="8"
              max="32"
              value={bytesPerRow}
              onChange={(e) => setBytesPerRow(parseInt(e.target.value))}
              className="slider w-20"
              disabled={exportStatus.isExporting}
            />
            <span className="text-xs px-1 py-0.5 rounded border min-w-[2rem] text-center" style={{ 
              fontFamily: 'var(--font-mono)', 
              color: 'var(--color-primary)', 
              backgroundColor: 'var(--color-bg)',
              borderColor: 'var(--color-border)'
            }}>
              {bytesPerRow}
            </span>
          </div>

          {/* Options */}
          <div className="flex items-center gap-3 ml-auto">
            <label className="flex items-center gap-1 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={perFrame}
                onChange={(e) => setPerFrame(e.target.checked)}
                className="w-3 h-3 rounded"
                disabled={exportStatus.isExporting}
              />
              <span style={{ color: 'var(--color-text)' }}>Separate Arrays</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={includeMetadata}
                onChange={(e) => setIncludeMetadata(e.target.checked)}
                className="w-3 h-3 rounded"
                disabled={exportStatus.isExporting}
              />
              <span style={{ color: 'var(--color-text)' }}>Include Metadata</span>
            </label>
          </div>
        </div>

        {/* Download Row */}
        <div className="flex items-center justify-between pt-2" style={{ borderTop: `1px solid var(--color-border)` }}>
          <div className="flex items-center gap-2">
            <ArrowDownTrayIcon className="w-4 h-4" style={{ color: 'var(--color-muted)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>Export as:</span>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value as 'binary' | 'concatenated' | 'carray' | 'cfiles')}
              className="px-2 py-1 text-xs rounded focus:outline-none"
              style={{ 
                backgroundColor: 'var(--color-bg)', 
                border: `1px solid var(--color-border)`,
                color: 'var(--color-text)'
              }}
              disabled={exportStatus.isExporting}
            >
              <option value="carray">C Array (.c file)</option>
              <option value="cfiles">C Files (.c + .h)</option>
              <option value="binary">Raw Binary (.bin files)</option>
              <option value="concatenated">Concatenated (.bin)</option>
            </select>
            <button
              onClick={() => handleExport(selectedFormat)}
              disabled={!hasFrames || exportStatus.isExporting}
              className="px-4 py-1 text-xs font-medium rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
              style={{ 
                backgroundColor: 'var(--color-primary)', 
                color: 'var(--color-primary-contrast)' 
              }}
            >
              <ArrowDownTrayIcon className="w-3 h-3" />
              Download
            </button>
          </div>
        </div>
      </div>

      {/* Export Status */}
      {exportStatus.message && (
        <div className={`mt-6 p-4 rounded-lg border ${
          exportStatus.type === 'success' ? 'status-success' :
          exportStatus.type === 'error' ? 'status-error' :
          'status-info'
        }`}>
          {exportStatus.isExporting && (
            <div className="mb-3">
              <div className="progress">
                <div 
                  className="progress-fill"
                  style={{ width: `${exportStatus.progress}%` }}
                />
              </div>
            </div>
          )}
          <p className="text-sm font-medium">{exportStatus.message}</p>
        </div>
      )}
    </div>
  )
}
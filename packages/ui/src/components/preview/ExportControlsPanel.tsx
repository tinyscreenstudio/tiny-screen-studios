import React, { useState, useEffect } from 'react'
import {
  ArrowDownTrayIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline'
import { useAppStore } from '../../store/appStore'
import { Tooltip } from '../ui'
import type { AddressingMode, BitOrderMode } from '@tiny-screen-studios/core'

export function ExportControlsPanel() {
  const [selectedFormat, setSelectedFormat] = useState<
    'binary' | 'concatenated' | 'carray' | 'cfiles'
  >('carray')
  const [selectedPreset, setSelectedPreset] = useState<string>('')
  const [exportStatus, setExportStatus] = useState<{
    isExporting: boolean
    progress: number
    message: string
    type: 'info' | 'success' | 'error'
  }>({
    isExporting: false,
    progress: 0,
    message: '',
    type: 'info',
  })

  const {
    currentPackedFrames,
    symbolName,
    bytesPerRow,
    perFrame,
    includeMetadata,
    addressing,
    bitOrder,
    autoLineWrap,
    setSymbolName,
    setBytesPerRow,
    setPerFrame,
    setIncludeMetadata,
    setAddressing,
    setBitOrder,
    setAutoLineWrap,
  } = useAppStore()

  // Auto-calculate bytes per row when addressing changes
  useEffect(() => {
    if (autoLineWrap && currentPackedFrames.length > 0) {
      const firstFrame = currentPackedFrames[0]
      if (firstFrame) {
        if (addressing === 'vertical') {
          setBytesPerRow(firstFrame.dims.width) // e.g., 128
        } else {
          setBytesPerRow(Math.ceil(firstFrame.dims.width / 8)) // e.g., 16
        }
      }
    }
  }, [addressing, autoLineWrap, currentPackedFrames, setBytesPerRow])

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
            addressing,
            bitOrder,
            autoLineWrap,
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
            addressing,
            bitOrder,
            autoLineWrap,
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
        {/* Preset Selector */}
        <div className="flex items-center gap-2 pb-2" style={{ borderBottom: `1px solid var(--color-border)` }}>
          <label className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>Quick Preset:</label>
          <select
            value={selectedPreset}
            onChange={(e) => {
              const preset = e.target.value
              setSelectedPreset(preset)
              if (preset === 'qmk') {
                setAddressing('vertical')
                setBitOrder('lsb-first')
              } else if (preset === 'adafruit') {
                setAddressing('horizontal')
                setBitOrder('msb-first')
              }
            }}
            className="px-2 py-1 text-xs rounded focus:outline-none"
            style={{
              backgroundColor: 'var(--color-bg)',
              border: `1px solid var(--color-border)`,
              color: selectedPreset === '' ? 'var(--color-muted)' : 'var(--color-text)'
            }}
            disabled={exportStatus.isExporting}
          >
            <option value="">Choose preset...</option>
            <option value="qmk">QMK / SSD1306 (Vertical, LSB-first)</option>
            <option value="adafruit">Adafruit GFX drawBitmap (Horizontal, MSB-first)</option>
          </select>
        </div>

        {/* Array Name */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium w-24" style={{ color: 'var(--color-text)' }}>Array Name:</label>
          <input
            type="text"
            value={symbolName}
            onChange={(e) => setSymbolName(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
            className="flex-1 px-2 py-1 text-xs rounded focus:outline-none focus:ring-1"
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

        {/* Addressing Mode */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium w-24 flex items-center gap-1" style={{ color: 'var(--color-text)' }}>
            Addressing:
            <Tooltip content="How bits are packed. Vertical (page/column-major) = 1 byte = 8 vertical pixels (SSD1306/SH1106 native). Horizontal (row-major) = 1 byte = 8 horizontal pixels (handy for drawBitmap-style APIs).">
              <InformationCircleIcon className="w-3 h-3 cursor-help" style={{ color: 'var(--color-muted)' }} />
            </Tooltip>
          </label>
          <select
            value={addressing}
            onChange={(e) => setAddressing(e.target.value as AddressingMode)}
            className="flex-1 px-2 py-1 text-xs rounded focus:outline-none"
            style={{
              backgroundColor: 'var(--color-bg)',
              border: `1px solid var(--color-border)`,
              color: 'var(--color-text)'
            }}
            disabled={exportStatus.isExporting}
          >
            <option value="vertical">Vertical (page/column-major)</option>
            <option value="horizontal">Horizontal (row-major)</option>
          </select>
        </div>

        {/* Bit Order */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium w-24 flex items-center gap-1" style={{ color: 'var(--color-text)' }}>
            Bit Order:
            <Tooltip content="Within a byte, which bit is the first pixel. LSB-first = bit0 is first pixel; MSB-first = bit7 is first pixel. Match your library.">
              <InformationCircleIcon className="w-3 h-3 cursor-help" style={{ color: 'var(--color-muted)' }} />
            </Tooltip>
          </label>
          <select
            value={bitOrder}
            onChange={(e) => setBitOrder(e.target.value as BitOrderMode)}
            className="flex-1 px-2 py-1 text-xs rounded focus:outline-none"
            style={{
              backgroundColor: 'var(--color-bg)',
              border: `1px solid var(--color-border)`,
              color: 'var(--color-text)'
            }}
            disabled={exportStatus.isExporting}
          >
            <option value="lsb-first">LSB-first (bit 0 = first pixel)</option>
            <option value="msb-first">MSB-first (bit 7 = first pixel)</option>
          </select>
        </div>

        {/* Bytes per Row */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium w-24 flex items-center gap-1" style={{ color: 'var(--color-text)' }}>
            Bytes per Row:
            <Tooltip content="How many bytes to place on each line of the export. Formatting only—doesn't change pixel packing.">
              <InformationCircleIcon className="w-3 h-3 cursor-help" style={{ color: 'var(--color-muted)' }} />
            </Tooltip>
          </label>
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={autoLineWrap}
              onChange={(e) => setAutoLineWrap(e.target.checked)}
              className="w-3 h-3 rounded"
              disabled={exportStatus.isExporting}
            />
            <span style={{ color: 'var(--color-text)' }}>Auto</span>
          </label>
          <input
            type="range"
            min="8"
            max="128"
            value={bytesPerRow}
            onChange={(e) => setBytesPerRow(parseInt(e.target.value))}
            className="slider flex-1"
            disabled={exportStatus.isExporting || autoLineWrap}
          />
          <span className="text-xs px-2 py-0.5 rounded border min-w-[2.5rem] text-center" style={{
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-primary)',
            backgroundColor: 'var(--color-bg)',
            borderColor: 'var(--color-border)'
          }}>
            {bytesPerRow}
          </span>
        </div>

        {/* Options */}
        <div className="flex items-center gap-4 pt-2" style={{ borderTop: `1px solid var(--color-border)` }}>
          <label className="flex items-center gap-1 cursor-pointer text-xs">
            <input
              type="checkbox"
              checked={perFrame}
              onChange={(e) => setPerFrame(e.target.checked)}
              className="w-3 h-3 rounded"
              disabled={exportStatus.isExporting}
            />
            <span style={{ color: 'var(--color-text)' }}>Separate Arrays</span>
            <Tooltip content="Export each frame as its own array (easier indexing). Off = one concatenated array.">
              <InformationCircleIcon className="w-3 h-3 cursor-help" style={{ color: 'var(--color-muted)' }} />
            </Tooltip>
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
        <div className={`mt-6 p-4 rounded-lg border ${exportStatus.type === 'success' ? 'status-success' :
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

      {/* Compatibility Note */}
      {currentPackedFrames.length > 0 && currentPackedFrames[0]?.preset === 'SH1106_132x64' && (
        <div className="mt-3 p-2 rounded text-xs" style={{
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          color: 'var(--color-text)'
        }}>
          <strong>SH1106 Note:</strong> Controller is 132×64; visible area is 128×64. We center your art with 2-px margins.
        </div>
      )}
    </div>
  )
}
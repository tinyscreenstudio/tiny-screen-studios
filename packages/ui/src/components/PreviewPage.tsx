import React from 'react'
import { OLEDPreviewCanvas } from './OLEDPreviewCanvas'
import { FileUploadPanel } from './FileUploadPanel'
import { DeviceSettingsPanel } from './DeviceSettingsPanel'
import { ExportControlsPanel } from './ExportControlsPanel'
import { useAppStore } from '../store/appStore'
interface PreviewPageProps {}

export function PreviewPage({}: PreviewPageProps) {
  const { currentPackedFrames, devicePreset, showExportPanel } = useAppStore()
  const hasFrames = currentPackedFrames.length > 0

  return (
    <div className="space-y-8">
      {/* OLED Studio Banner */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}></div>
        </div>
        
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" strokeWidth="2"/>
                <line x1="8" y1="21" x2="16" y2="21" strokeWidth="2"/>
                <line x1="12" y1="17" x2="12" y2="21" strokeWidth="2"/>
                <rect x="6" y="7" width="4" height="2" fill="currentColor"/>
                <rect x="14" y="7" width="4" height="2" fill="currentColor"/>
                <rect x="6" y="11" width="8" height="2" fill="currentColor"/>
              </svg>
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-white truncate bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                OLED Studio
              </h1>
              <p className="text-gray-300 text-sm sm:text-base">Real-time display simulation and conversion tools</p>
            </div>
          </div>

          {hasFrames && (
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-1.5 text-sm font-medium">
                <span className="text-indigo-300">{currentPackedFrames.length}</span> frame{currentPackedFrames.length !== 1 ? 's' : ''}
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-1.5 text-sm font-medium">
                <span className="text-purple-300">{devicePreset}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {hasFrames ? (
        /* 2-Row Layout: Settings+Preview (top), Export (bottom) */
        <div className="space-y-6">
          {/* Top Row: Device Settings + Preview */}
          <div className="flex flex-col lg:flex-row gap-6 lg:items-stretch">
            {/* Device Settings (40%) */}
            <div className="lg:w-2/5 flex">
              <DeviceSettingsPanel />
            </div>

            {/* OLED Preview (60%) */}
            <div className="lg:w-3/5 flex">
              <OLEDPreviewCanvas />
            </div>
          </div>

          {/* Bottom Row: Export Panel (Full Width) */}
          {showExportPanel && (
            <div className="w-full">
              <ExportControlsPanel />
            </div>
          )}
        </div>
      ) : (
        /* Layout when no files - Upload is the focus */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Area */}
          <div>
            <FileUploadPanel />
          </div>

          {/* Getting Started */}
          <div className="card p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Getting Started</h3>
            <div className="space-y-4 text-gray-600">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-indigo-600 text-sm font-semibold">1</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Upload Your Files</p>
                  <p className="text-sm">Drag & drop PNG images or click to browse</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-indigo-600 text-sm font-semibold">2</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Configure Display</p>
                  <p className="text-sm">Choose your OLED controller type</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-indigo-600 text-sm font-semibold">3</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Preview & Export</p>
                  <p className="text-sm">See live preview and download code</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
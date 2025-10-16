import React from 'react'
import { OLEDPreviewCanvas } from './OLEDPreviewCanvas'
import { FileUploadPanel } from './FileUploadPanel'
import { DeviceSettingsPanel } from './DeviceSettingsPanel'
import { ExportControlsPanel } from './ExportControlsPanel'
import { useAppStore } from '../store/appStore'
interface PreviewPageProps { }

export function PreviewPage({ }: PreviewPageProps) {
  const { currentPackedFrames, devicePreset, showExportPanel } = useAppStore()
  const hasFrames = currentPackedFrames.length > 0

  return (
    <div className="space-y-8">
      {/* OLED Studio Hero Section */}
      <div className="relative bg-gradient-to-br from-white via-gray-50 to-indigo-50 rounded-3xl py-16 px-8 shadow-xl overflow-hidden border border-gray-200">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #6366f1 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}></div>
        </div>

        {/* Subtle Animated Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-100/30 to-purple-100/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-cyan-100/30 to-blue-100/30 rounded-full blur-3xl animate-pulse [animation-delay:1s]"></div>

        <div className="relative text-center">
          {/* Hero Content */}
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-800 bg-clip-text text-transparent">
              OLED Studio
            </h1>
            <p className="text-gray-600 text-xl md:text-2xl leading-relaxed mb-8 max-w-3xl mx-auto">
              Professional real-time display simulation and conversion tools for embedded OLED displays
            </p>

            {/* Feature Highlights */}
            <div className="flex flex-wrap justify-center items-center gap-6 mb-8">
              <div className="flex items-center gap-2 text-gray-500">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm md:text-base">Real-time Preview</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse [animation-delay:0.5s]"></div>
                <span className="text-sm md:text-base">Hardware Accurate</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse [animation-delay:1s]"></div>
                <span className="text-sm md:text-base">Multiple Formats</span>
              </div>
            </div>

            {/* Project Stats */}
            {hasFrames && (
              <div className="flex justify-center">
                <div className="flex items-center gap-6">
                  <div className="bg-white/80 backdrop-blur-sm border border-indigo-200 rounded-xl px-6 py-4 text-center shadow-sm">
                    <div className="text-3xl font-bold text-indigo-600">{currentPackedFrames.length}</div>
                    <div className="text-sm text-gray-500">Frame{currentPackedFrames.length !== 1 ? 's' : ''}</div>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm border border-purple-200 rounded-xl px-6 py-4 text-center shadow-sm">
                    <div className="text-xl font-bold text-purple-600">{devicePreset}</div>
                    <div className="text-sm text-gray-500">Display</div>
                  </div>
                </div>
              </div>
            )}
          </div>
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

            {/* OLED Studio (60%) */}
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
        /* Integrated Upload Section */
        <div className="card p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Get Started with Your Pixel Art</h2>
            <p className="text-gray-600">Upload your PNG images and convert them for OLED displays in seconds</p>
          </div>

          {/* Upload Area */}
          <div className="mb-8">
            <FileUploadPanel />
          </div>

          {/* Quick Steps */}
          <div className="border-t border-gray-200 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Upload Images</h3>
                <p className="text-sm text-gray-600">Drag & drop PNG files or click to browse</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Configure Display</h3>
                <p className="text-sm text-gray-600">Choose your OLED controller type</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Preview & Export</h3>
                <p className="text-sm text-gray-600">See live preview and download code</p>
              </div>
            </div>
          </div>

          {/* Supported Formats */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-gray-500">
              <span>Supports:</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>PNG Images</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Animations</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span>SSD1306 & SH1106</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
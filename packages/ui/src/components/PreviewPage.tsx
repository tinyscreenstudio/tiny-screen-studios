import React from 'react'
import { SparklesIcon } from '@heroicons/react/24/outline'
import { OLEDPreviewCanvas } from './OLEDPreviewCanvas'
import { FileUploadPanel } from './FileUploadPanel'
import { DeviceSettingsPanel } from './DeviceSettingsPanel'
import { ExportControlsPanel } from './ExportControlsPanel'
import { useAppStore } from '../store/appStore'
interface PreviewPageProps { }

export function PreviewPage({ }: PreviewPageProps) {
  const { currentPackedFrames, showExportPanel } = useAppStore()
  const hasFrames = currentPackedFrames.length > 0

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl mb-8">
        {/* Light pixel-art inspired background */}
        <div className="absolute inset-0">
          {/* Subtle pixel grid pattern */}
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, var(--color-primary) 1px, transparent 0)`,
            backgroundSize: '20px 20px'
          }}></div>

          {/* Floating pixel blocks - light theme */}
          <div className="absolute top-20 left-10 w-6 h-6 opacity-60 animate-float pixelated" style={{ backgroundColor: 'rgba(99, 102, 241, 0.3)' }}></div>
          <div className="absolute top-32 right-20 w-4 h-4 opacity-70 animate-float-delayed pixelated" style={{ backgroundColor: 'rgba(139, 92, 246, 0.3)' }}></div>
          <div className="absolute bottom-40 left-1/4 w-8 h-8 opacity-50 animate-float-slow pixelated" style={{ backgroundColor: 'rgba(59, 130, 246, 0.3)' }}></div>
          <div className="absolute bottom-20 right-1/3 w-5 h-5 opacity-65 animate-pulse pixelated" style={{ backgroundColor: 'rgba(6, 182, 212, 0.3)' }}></div>

          {/* Light geometric shapes */}
          <div className="absolute top-1/4 right-1/4 w-32 h-32 rounded-full opacity-40 blur-xl animate-float" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)' }}></div>
          <div className="absolute bottom-1/3 left-1/5 w-24 h-24 rounded-full opacity-50 blur-xl animate-float-delayed" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)' }}></div>
        </div>

        <div className="relative w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20 lg:py-32">
            <div className="animate-fade-in">
              {/* Clean badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 backdrop-blur-sm rounded-full text-sm font-medium mb-8 shadow-sm" style={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                border: `1px solid rgba(99, 102, 241, 0.3)`,
                color: 'var(--color-primary)'
              }}>
                <SparklesIcon className="w-4 h-4" />
                Professional OLED Tools
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight" style={{ color: 'var(--color-text)' }}>
                OLED Studio
              </h1>

              <p className="text-lg sm:text-xl lg:text-2xl max-w-4xl mx-auto mb-12 leading-relaxed font-light" style={{ color: 'var(--color-muted)' }}>
                Professional real-time display simulation and conversion tools for <span style={{ color: 'var(--color-primary)', fontWeight: '600' }}>embedded OLED</span> displays. <span style={{ color: '#8b5cf6', fontWeight: '600' }}>Hardware accurate</span> tools for embedded developers.
              </p>

              {/* Feature highlights - clean light style */}
              <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm" style={{ color: 'var(--color-muted)' }}>
                <div className="flex items-center gap-2 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', border: `1px solid rgba(16, 185, 129, 0.3)` }}>
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-success)' }}></div>
                  Real-time Preview
                </div>
                <div className="flex items-center gap-2 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', border: `1px solid rgba(59, 130, 246, 0.3)` }}>
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-info)' }}></div>
                  Hardware Accurate
                </div>
                <div className="flex items-center gap-2 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', border: `1px solid rgba(139, 92, 246, 0.3)` }}>
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#8b5cf6' }}></div>
                  Multiple Formats
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-8">

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
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>Get Started with Your Pixel Art</h2>
            <p style={{ color: 'var(--color-muted)' }}>Upload your PNG images and convert them for OLED displays in seconds</p>
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
    </>
  )
}
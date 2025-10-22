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
      {/* Hero Section - OLED Dark Theme */}
      <section className="relative overflow-hidden rounded-3xl mb-8" style={{
        background: 'linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #000000 100%)',
        border: '2px solid var(--color-primary)'
      }}>
        {/* OLED pixel grid */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `
            linear-gradient(0deg, transparent 24%, rgba(255, 107, 53, 0.05) 25%, rgba(255, 107, 53, 0.05) 26%, transparent 27%, transparent 74%, rgba(255, 107, 53, 0.05) 75%, rgba(255, 107, 53, 0.05) 76%, transparent 77%, transparent),
            linear-gradient(90deg, transparent 24%, rgba(255, 107, 53, 0.05) 25%, rgba(255, 107, 53, 0.05) 26%, transparent 27%, transparent 74%, rgba(255, 107, 53, 0.05) 75%, rgba(255, 107, 53, 0.05) 76%, transparent 77%, transparent)
          `,
          backgroundSize: '4px 4px'
        }}></div>

        {/* Glowing OLED pixels */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-2 h-2 glow-primary" style={{ backgroundColor: 'var(--color-primary)' }}></div>
          <div className="absolute top-32 right-20 w-2 h-2 glow-accent" style={{ backgroundColor: 'var(--color-accent)' }}></div>
          <div className="absolute bottom-40 left-1/4 w-2 h-2 glow-primary" style={{ backgroundColor: 'var(--color-primary)' }}></div>
          <div className="absolute bottom-20 right-1/3 w-2 h-2 glow-accent" style={{ backgroundColor: 'var(--color-accent)' }}></div>
        </div>

        {/* Gradient glow effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 opacity-30 blur-3xl" style={{ background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)' }}></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 opacity-30 blur-3xl" style={{ background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)' }}></div>

        <div className="relative w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16 lg:py-24">
            {/* OLED badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8" style={{
              backgroundColor: 'rgba(255, 107, 53, 0.1)',
              border: '1px solid var(--color-primary)',
              color: 'var(--color-primary)',
              boxShadow: '0 0 20px rgba(255, 107, 53, 0.3)'
            }}>
              <SparklesIcon className="w-4 h-4" />
              Professional OLED Tools
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white">
              OLED Studio
            </h1>

            <p className="text-lg sm:text-xl lg:text-2xl max-w-4xl mx-auto mb-12 leading-relaxed" style={{ color: '#888888' }}>
              Professional real-time display simulation and conversion tools for <span className="brand-orange font-semibold">embedded OLED</span> displays. <span className="brand-cyan font-semibold">Hardware accurate</span> tools for embedded developers.
            </p>

            {/* Feature highlights - OLED style */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm text-white">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-success)' }}></div>
                Real-time Preview
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-accent)' }}></div>
                Hardware Accurate
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }}></div>
                Multiple Formats
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
              <h2 className="text-2xl font-bold mb-2 text-gradient">Get Started with Your Pixel Art</h2>
              <p style={{ color: 'var(--color-muted)' }}>Upload your PNG images and convert them for OLED displays in seconds</p>
            </div>

            {/* Upload Area */}
            <div className="mb-8">
              <FileUploadPanel />
            </div>

            {/* Quick Steps */}
            <div className="pt-8" style={{ borderTop: '1px solid var(--color-border)' }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{
                    backgroundColor: 'rgba(255, 107, 53, 0.1)',
                    border: '1px solid rgba(255, 107, 53, 0.3)'
                  }}>
                    <svg className="w-6 h-6 brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-1 brand-orange">Upload Images</h3>
                  <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Drag & drop PNG files or click to browse</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{
                    backgroundColor: 'rgba(0, 217, 255, 0.1)',
                    border: '1px solid rgba(0, 217, 255, 0.3)'
                  }}>
                    <svg className="w-6 h-6 brand-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-1 brand-cyan">Configure Display</h3>
                  <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Choose your OLED controller type</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{
                    backgroundColor: 'rgba(157, 78, 221, 0.1)',
                    border: '1px solid rgba(157, 78, 221, 0.3)'
                  }}>
                    <svg className="w-6 h-6" style={{ color: '#9D4EDD' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-1" style={{ color: '#9D4EDD' }}>Preview & Export</h3>
                  <p className="text-sm" style={{ color: 'var(--color-muted)' }}>See live preview and download code</p>
                </div>
              </div>
            </div>

            {/* Supported Formats */}
            <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--color-border)' }}>
              <div className="flex flex-wrap justify-center items-center gap-4 text-sm" style={{ color: 'var(--color-muted)' }}>
                <span>Supports:</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }}></div>
                  <span>PNG Images</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-accent)' }}></div>
                  <span>Animations</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#9D4EDD' }}></div>
                  <span>SSD1306, SH1106 & SSD1309</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
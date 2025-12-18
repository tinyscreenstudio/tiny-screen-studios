import React from 'react'
import { OLEDPreviewCanvas } from './OLEDPreviewCanvas'
import { FileUploadPanel } from '../file-upload'
import { DeviceSettingsPanel } from './DeviceSettingsPanel'
import { ExportControlsPanel } from './ExportControlsPanel'
import { useAppStore } from '../../store/appStore'

interface PreviewPageProps { }

export function PreviewPage({ }: PreviewPageProps) {
  const { currentPackedFrames, showExportPanel } = useAppStore()
  const hasFrames = currentPackedFrames.length > 0

  return (
    <>
      {/* Banner — aligned to design tokens */}
      <section className="pt-16 pb-10 px-6 border-b border-border bg-bg-secondary/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3 tracking-tight text-text-primary">
            OLED Studio
          </h1>
          <p className="text-lg md:text-xl text-text-muted max-w-2xl mx-auto">
            Real-time preview, device settings, and export — streamlined.
          </p>
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
          <div className="bg-bg-secondary/30 p-6 rounded-xl border border-border">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold mb-2 text-text-primary">Get Started</h2>
              <p className="text-text-muted">Upload a PNG and convert it for OLED displays</p>
            </div>

            {/* Upload Area */}
            <div className="mb-8">
              <FileUploadPanel />
            </div>

            {/* Quick Steps */}
            <div className="pt-8 border-t border-border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 border border-border">
                    <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-1 text-text-primary">Upload Images</h3>
                  <p className="text-sm text-text-muted">Drag & drop PNG files or click to browse</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 border border-border">
                    <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-1 text-text-primary">Configure Display</h3>
                  <p className="text-sm text-text-muted">Choose your OLED controller type</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 border border-border">
                    <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h18v4H3zM3 7h18v14H3zM7 11h10v2H7z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-1 text-text-primary">Preview & Export</h3>
                  <p className="text-sm text-text-muted">Review and export to your preferred format</p>
                </div>
              </div>
            </div>

            {/* Supported Formats */}
            <div className="mt-8 pt-6 border-t border-border">
              <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-text-muted">
                <span>Supports:</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-border"></div>
                  <span>PNG Images</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-border"></div>
                  <span>Animations</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-border"></div>
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

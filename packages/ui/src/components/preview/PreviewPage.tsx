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
      <section className="pt-16 pb-16 px-6 border-b border-border bg-gradient-to-br from-primary/5 via-purple-500/5 to-blue-500/5">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="text-sm font-medium text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
              Preview Release
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight bg-gradient-to-r from-gray-900 via-primary to-purple-600 bg-clip-text text-transparent">
            Studio
          </h1>
          <p className="text-xl text-text-muted max-w-2xl mx-auto mb-8 leading-relaxed">
            Convert your pixel art to 1-bit format with real-time preview for SSD1306, SH1106, and SH1107 displays. 
            Professional tools for embedded developers.
          </p>
          
          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-center justify-center gap-2 text-sm text-text-muted">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Real-time Preview</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-text-muted">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span>Multiple Export Formats</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-text-muted">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <span>Display Optimization</span>
            </div>
          </div>

          {/* Supported displays */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="text-sm text-text-muted">Supported displays:</span>
            {['SSD1306', 'SH1106', 'SH1107', 'SSD1309'].map((display) => (
              <span
                key={display}
                className="px-3 py-1.5 bg-white border border-border rounded-full text-sm font-medium text-text hover:border-primary/50 transition-colors"
              >
                {display}
              </span>
            ))}
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

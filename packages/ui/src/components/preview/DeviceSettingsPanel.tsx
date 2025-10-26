import React from 'react'
import { CogIcon, QuestionMarkCircleIcon, CpuChipIcon } from '@heroicons/react/24/outline'
import { useAppStore } from '../../store/appStore'
import { DEVICE_PRESETS } from '@tiny-screen-studios/core'
import { Tooltip } from '../ui'
import { processFiles } from '../../utils/fileProcessor'
import { useDeviceConfig, useFeatureFlags } from '../../hooks/useAppConfig'

export function DeviceSettingsPanel() {
  const {
    devicePreset,
    threshold,
    invert,
    dithering,
    currentFiles,
    isProcessing,
    setDevicePreset,
    setThreshold,
    setInvert,
    setDithering,
  } = useAppStore()
  
  const deviceConfig = useDeviceConfig()
  const featureFlags = useFeatureFlags()

  const handlePresetChange = (preset: string) => {
    setDevicePreset(preset as any)
    if (currentFiles.length > 0 && !isProcessing) {
      processFiles(currentFiles)
    }
  }

  const handleThresholdChange = (value: number) => {
    setThreshold(value)
    if (currentFiles.length > 0 && !isProcessing) {
      // Debounced processing will be handled in the processor
      processFiles(currentFiles)
    }
  }

  const handleInvertChange = (checked: boolean) => {
    setInvert(checked)
    if (currentFiles.length > 0 && !isProcessing) {
      processFiles(currentFiles)
    }
  }

  const handleDitheringChange = (checked: boolean) => {
    setDithering(checked)
    if (currentFiles.length > 0 && !isProcessing) {
      processFiles(currentFiles)
    }
  }

  return (
    <div className="card p-6 flex-1 flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.2) 100%)' }}>
          <CogIcon className="w-6 h-6" style={{ color: 'var(--color-success)' }} />
        </div>
        <div>
          <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
            Device Settings
          </h2>
          <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Configure your display</p>
        </div>
      </div>

      {/* Device Preset Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-3" style={{ color: 'var(--color-text)' }}>
          <div className="flex items-center gap-2">
            <CpuChipIcon className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
            <span>Display Type</span>
            <Tooltip content="Choose your display type. SSD1306 is most common, SH1106 has slightly different dimensions.">
              <QuestionMarkCircleIcon className="w-4 h-4 transition-colors cursor-help" style={{ color: 'var(--color-muted)' }} />
            </Tooltip>
          </div>
        </label>

        <div className="relative">
          <select
            value={devicePreset}
            onChange={(e) => handlePresetChange(e.target.value)}
            className="select-field pr-10"
            disabled={isProcessing}
          >
            {deviceConfig.availablePresets.map((presetKey) => {
              const preset = DEVICE_PRESETS[presetKey]
              return (
                <option key={presetKey} value={presetKey}>
                  {presetKey} ({preset.width}×{preset.height})
                </option>
              )
            })}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--color-text)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Threshold Slider */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-3" style={{ color: 'var(--color-text)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>Brightness Threshold</span>
              <Tooltip content="Brightness cutoff for black/white conversion. Lower values = more black pixels.">
                <QuestionMarkCircleIcon className="w-4 h-4 transition-colors cursor-help" style={{ color: 'var(--color-muted)' }} />
              </Tooltip>
            </div>
            <span className="px-2 py-1 rounded text-sm" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', backgroundColor: 'rgba(99, 102, 241, 0.1)' }}>
              {threshold}
            </span>
          </div>
        </label>

        <input
          type="range"
          min="0"
          max="255"
          value={threshold}
          onChange={(e) => handleThresholdChange(parseInt(e.target.value))}
          className="slider"
          disabled={isProcessing}
        />
        <div className="flex justify-between text-xs mt-2" style={{ color: 'var(--color-muted)' }}>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-text)' }}></div>
            More Black
          </span>
          <span className="flex items-center gap-1">
            More White
            <div className="w-2 h-2 rounded-full border" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}></div>
          </span>
        </div>
      </div>

      {/* Processing Options */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <div className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, var(--color-success) 0%, var(--color-primary) 100%)' }}></div>
          Processing Options
        </h3>

        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={invert}
            onChange={(e) => handleInvertChange(e.target.checked)}
            className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
            disabled={isProcessing}
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium transition-colors" style={{ color: 'var(--color-text)' }}>
                Invert Output
              </span>
              {featureFlags.enableTooltips && (
                <Tooltip content="Swap black and white pixels. Useful for different display polarities.">
                  <QuestionMarkCircleIcon className="w-4 h-4 transition-colors cursor-help" style={{ color: 'var(--color-muted)' }} />
                </Tooltip>
              )}
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
              Swap black and white pixels
            </p>
          </div>
        </label>

        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={dithering}
            onChange={(e) => handleDitheringChange(e.target.checked)}
            className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
            disabled={isProcessing}
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium transition-colors" style={{ color: 'var(--color-text)' }}>
                Bayer Dithering
              </span>
              {featureFlags.enableTooltips && (
                <Tooltip content="Use Bayer dithering to simulate grayscale with dot patterns. Better for photos.">
                  <QuestionMarkCircleIcon className="w-4 h-4 transition-colors cursor-help" style={{ color: 'var(--color-muted)' }} />
                </Tooltip>
              )}
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
              4×4 pattern for grayscale simulation
            </p>
          </div>
        </label>
      </div>
    </div>
  )
}
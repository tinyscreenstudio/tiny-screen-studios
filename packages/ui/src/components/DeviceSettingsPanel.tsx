import React from 'react'
import { CogIcon, QuestionMarkCircleIcon, CpuChipIcon } from '@heroicons/react/24/outline'
import { useAppStore } from '../store/appStore'
import { DEVICE_PRESETS } from '@tiny-screen-studios/core'
import { Tooltip } from './Tooltip'
import { processFiles } from '../utils/fileProcessor'

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
        <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center">
          <CogIcon className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Device Settings
          </h2>
          <p className="text-gray-600 text-sm">Configure your display</p>
        </div>
      </div>

      {/* Device Preset Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <div className="flex items-center gap-2">
            <CpuChipIcon className="w-4 h-4 text-indigo-600" />
            <span>Display Type</span>
            <Tooltip content="Choose your display type. SSD1306 is most common, SH1106 has slightly different dimensions.">
              <QuestionMarkCircleIcon className="w-4 h-4 text-gray-400 hover:text-indigo-600 transition-colors cursor-help" />
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
            {Object.entries(DEVICE_PRESETS).map(([key, preset]) => (
              <option key={key} value={key}>
                {key} ({preset.width}×{preset.height})
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Threshold Slider */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>Brightness Threshold</span>
              <Tooltip content="Brightness cutoff for black/white conversion. Lower values = more black pixels.">
                <QuestionMarkCircleIcon className="w-4 h-4 text-gray-400 hover:text-indigo-600 transition-colors cursor-help" />
              </Tooltip>
            </div>
            <span className="font-mono text-indigo-600 bg-indigo-50 px-2 py-1 rounded text-sm">
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
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
            More Black
          </span>
          <span className="flex items-center gap-1">
            More White
            <div className="w-2 h-2 bg-gray-100 rounded-full border border-gray-300"></div>
          </span>
        </div>
      </div>

      {/* Processing Options */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <div className="w-1 h-4 bg-gradient-to-b from-emerald-500 to-indigo-500 rounded-full"></div>
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
              <span className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                Invert Output
              </span>
              <Tooltip content="Swap black and white pixels. Useful for different display polarities.">
                <QuestionMarkCircleIcon className="w-4 h-4 text-gray-400 hover:text-indigo-600 transition-colors cursor-help" />
              </Tooltip>
            </div>
            <p className="text-xs text-gray-500 mt-1">
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
              <span className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                Bayer Dithering
              </span>
              <Tooltip content="Use Bayer dithering to simulate grayscale with dot patterns. Better for photos.">
                <QuestionMarkCircleIcon className="w-4 h-4 text-gray-400 hover:text-indigo-600 transition-colors cursor-help" />
              </Tooltip>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              4×4 pattern for grayscale simulation
            </p>
          </div>
        </label>
      </div>
    </div>
  )
}
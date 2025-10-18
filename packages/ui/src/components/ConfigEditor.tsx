import React, { useState } from 'react'
import { CogIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { useAppConfig, useFeatureFlags } from '../hooks/useAppConfig'
import { configManager } from '../utils/configManager'
import { AppConfig } from '../config/appConfig'

interface ConfigEditorProps {
  isOpen: boolean
  onClose: () => void
}

export function ConfigEditor({ isOpen, onClose }: ConfigEditorProps) {
  const config = useAppConfig()
  const featureFlags = useFeatureFlags()
  const [activeTab, setActiveTab] = useState<'navigation' | 'features' | 'ui' | 'device'>('features')

  if (!isOpen) return null

  const handleFeatureToggle = (feature: keyof typeof featureFlags) => {
    configManager.toggleFeature(feature)
    // Force re-render by updating a dummy state or use a config store
    window.location.reload() // Simple approach for demo
  }

  const handleConfigUpdate = (section: keyof AppConfig, updates: any) => {
    configManager.updateConfig({ [section]: { ...config[section], ...updates } })
    window.location.reload() // Simple approach for demo
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl flex items-center justify-center">
              <CogIcon className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">App Configuration</h2>
              <p className="text-gray-600 text-sm">Manage application settings and features</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            ×
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200 p-4">
            <nav className="space-y-2">
              {[
                { id: 'features', label: 'Feature Flags', icon: '🚀' },
                { id: 'navigation', label: 'Navigation', icon: '🧭' },
                { id: 'ui', label: 'UI Settings', icon: '🎨' },
                { id: 'device', label: 'Device Defaults', icon: '📱' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-3 ${
                    activeTab === tab.id
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'features' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Feature Flags</h3>
                  <p className="text-gray-600 mb-6">Toggle application features on or off</p>
                </div>

                <div className="grid gap-4">
                  {Object.entries(featureFlags).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {getFeatureDescription(key as keyof typeof featureFlags)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleFeatureToggle(key as keyof typeof featureFlags)}
                        className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors ${
                          value
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {value ? <EyeIcon className="w-4 h-4" /> : <EyeSlashIcon className="w-4 h-4" />}
                        <span className="text-sm font-medium">{value ? 'Enabled' : 'Disabled'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'navigation' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Navigation Items</h3>
                  <p className="text-gray-600 mb-6">Configure navigation menu items</p>
                </div>

                <div className="space-y-4">
                  {config.navigation.map((item, index) => (
                    <div key={item.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">{item.label}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">Order: {item.order}</span>
                          <button
                            onClick={() => {
                              const updatedNav = [...config.navigation]
                              updatedNav[index] = { ...item, enabled: !item.enabled }
                              handleConfigUpdate('navigation', updatedNav)
                            }}
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              item.enabled
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {item.enabled ? 'Enabled' : 'Disabled'}
                          </button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Path: {item.path}</p>
                        <p>Icon: {item.icon}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'ui' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">UI Settings</h3>
                  <p className="text-gray-600 mb-6">Customize the user interface</p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Animations</h4>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={config.ui.animations.enabled}
                        onChange={(e) => handleConfigUpdate('ui', {
                          ...config.ui,
                          animations: { ...config.ui.animations, enabled: e.target.checked }
                        })}
                        className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
                      />
                      <span className="text-sm text-gray-700">Enable animations</span>
                    </label>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Theme Colors</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Primary Color</label>
                        <input
                          type="text"
                          value={config.ui.theme.primaryColor}
                          onChange={(e) => handleConfigUpdate('ui', {
                            ...config.ui,
                            theme: { ...config.ui.theme, primaryColor: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Accent Color</label>
                        <input
                          type="text"
                          value={config.ui.theme.accentColor}
                          onChange={(e) => handleConfigUpdate('ui', {
                            ...config.ui,
                            theme: { ...config.ui.theme, accentColor: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'device' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Defaults</h3>
                  <p className="text-gray-600 mb-6">Set default device settings</p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Default Settings</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Default Threshold</label>
                        <input
                          type="range"
                          min="0"
                          max="255"
                          value={config.device.defaultSettings.threshold}
                          onChange={(e) => handleConfigUpdate('device', {
                            ...config.device,
                            defaultSettings: {
                              ...config.device.defaultSettings,
                              threshold: parseInt(e.target.value)
                            }
                          })}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>0</span>
                          <span>{config.device.defaultSettings.threshold}</span>
                          <span>255</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={config.device.defaultSettings.invert}
                            onChange={(e) => handleConfigUpdate('device', {
                              ...config.device,
                              defaultSettings: {
                                ...config.device.defaultSettings,
                                invert: e.target.checked
                              }
                            })}
                            className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
                          />
                          <span className="text-sm text-gray-700">Default Invert</span>
                        </label>
                        
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={config.device.defaultSettings.dithering}
                            onChange={(e) => handleConfigUpdate('device', {
                              ...config.device,
                              defaultSettings: {
                                ...config.device.defaultSettings,
                                dithering: e.target.checked
                              }
                            })}
                            className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
                          />
                          <span className="text-sm text-gray-700">Default Dithering</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function getFeatureDescription(feature: string): string {
  const descriptions: Record<string, string> = {
    showProcessingOverlay: 'Show overlay during file processing',
    enableFileValidation: 'Validate uploaded files',
    enableExportControls: 'Show export control panel',
    enableDevicePreview: 'Show device preview canvas',
    enableProgressIndicator: 'Show progress indicators',
    enableTooltips: 'Show helpful tooltips',
    enableRecoveryActions: 'Show recovery actions on errors'
  }
  return descriptions[feature] || 'Feature configuration option'
}
import React, { useState } from 'react'
import { SparklesIcon, CogIcon } from '@heroicons/react/24/outline'
import { useHeaderConfig } from '../hooks/useAppConfig'
import { ConfigEditor } from './ConfigEditor'

export function Header() {
  const headerConfig = useHeaderConfig()
  const [showConfigEditor, setShowConfigEditor] = useState(false)

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Logo and title */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <img 
              src={headerConfig.logo.src}
              alt={headerConfig.logo.alt}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl shadow-lg flex-shrink-0"
            />
            
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gradient truncate">
                {headerConfig.title}
              </h1>
              <p className="text-gray-600 font-medium flex items-center gap-2 text-sm sm:text-base">
                <SparklesIcon className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-500 flex-shrink-0" />
                <span className="truncate">{headerConfig.subtitle}</span>
              </p>
            </div>
          </div>

          {/* Status indicators and config */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {headerConfig.showStatusIndicators && (
              <div className="hidden lg:flex items-center gap-4">
                <div className="flex items-center gap-2 card px-3 py-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-sm text-gray-700 font-medium">Ready</span>
                </div>
                
                {headerConfig.showSupportedDevices && (
                  <div className="flex gap-2">
                    {headerConfig.supportedDevices.map((device) => (
                      <div key={device} className="badge-primary text-xs">
                        {device}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Config button */}
            <button
              onClick={() => setShowConfigEditor(true)}
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors group"
              title="App Configuration"
            >
              <CogIcon className="w-5 h-5 text-gray-600 group-hover:text-indigo-600 transition-colors" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Config Editor Modal */}
      <ConfigEditor 
        isOpen={showConfigEditor} 
        onClose={() => setShowConfigEditor(false)} 
      />
    </header>
  )
}
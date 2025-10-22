import React from 'react'
import { Link } from 'react-router-dom'
import { SparklesIcon } from '@heroicons/react/24/outline'
import { useHeaderConfig } from '../hooks/useAppConfig'

export function Header() {
  const headerConfig = useHeaderConfig()

  return (
    <header style={{ backgroundColor: 'var(--color-bg)', borderBottom: `1px solid var(--color-border)` }}>
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Logo and title */}
          <Link to="/" className="flex items-center gap-3 sm:gap-4 min-w-0 hover:opacity-80 transition-opacity duration-200">
            <img 
              src={headerConfig.logo.src}
              alt={headerConfig.logo.alt}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl shadow-lg flex-shrink-0"
            />
            
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gradient truncate">
                {headerConfig.title}
              </h1>
              <p className="font-medium flex items-center gap-2 text-sm sm:text-base" style={{ color: 'var(--color-muted)' }}>
                <SparklesIcon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                <span className="truncate">{headerConfig.subtitle}</span>
              </p>
            </div>
          </Link>

          {/* Status indicators and config */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {headerConfig.showStatusIndicators && (
              <div className="hidden lg:flex items-center gap-4">
                <div className="flex items-center gap-2 card px-3 py-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-success)' }}></div>
                  <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Ready</span>
                </div>
                
                {headerConfig.showSupportedDevices && (
                  <div className="flex gap-2">
                    {headerConfig.supportedDevices.map((device) => (
                      <div key={device} className="device-tag text-xs">
                        {device}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
          </div>
        </div>
      </div>
    </header>
  )
}
import React from 'react'
import { SparklesIcon } from '@heroicons/react/24/outline'

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Logo and title */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <img 
              src="/logo.png" 
              alt="TinyScreen.Studios Logo" 
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl shadow-lg flex-shrink-0"
            />
            
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gradient truncate">
                TinyScreen.Studios
              </h1>
              <p className="text-gray-600 font-medium flex items-center gap-2 text-sm sm:text-base">
                <SparklesIcon className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-500 flex-shrink-0" />
                <span className="truncate">Creative Lab for Embedded Displays</span>
              </p>
            </div>
          </div>

          {/* Status indicators */}
          <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
            <div className="flex items-center gap-2 card px-3 py-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-sm text-gray-700 font-medium">Ready</span>
            </div>
            
            <div className="flex gap-2">
              <div className="badge-primary text-xs">SSD1306</div>
              <div className="badge-primary text-xs">SH1106</div>
              <div className="badge-primary text-xs">OLED</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
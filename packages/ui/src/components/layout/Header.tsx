import React from 'react'
import { Link } from 'react-router-dom'
import { MoonIcon, GlobeAltIcon } from '@heroicons/react/24/outline'
import { useHeaderConfig } from '../../hooks/useAppConfig'
import { Navigation } from './Navigation'

export function Header() {
  const headerConfig = useHeaderConfig()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-bg/80 backdrop-blur-md border-b border-border h-[50px]">
      <div className="container mx-auto px-6 h-full max-w-7xl">
        <div className="flex items-center justify-between h-full">
          {/* Left: Logo & Title */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity duration-200">
            <img 
              src={headerConfig.logo.src}
              alt={headerConfig.logo.alt}
              className="w-8 h-8 rounded-lg flex-shrink-0"
            />
            
            <div className="flex flex-col justify-center">
              <h1 className="text-lg font-bold text-text leading-none">
                {headerConfig.title.toLowerCase()}
              </h1>
            </div>
          </Link>

          {/* Center/Right: Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Navigation />
          </div>

          {/* Far Right: Actions */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Theme Toggle (Placeholder) */}
            <button className="text-text-secondary hover:text-primary transition-colors p-2">
              <MoonIcon className="w-5 h-5" />
            </button>
            
            {/* Language (Placeholder) */}
            <button className="text-text-secondary hover:text-primary transition-colors p-2 hidden sm:block">
              <GlobeAltIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
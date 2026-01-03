import React from 'react'
import { Link } from 'react-router-dom'
import { MagnifyingGlassIcon, SunIcon, GlobeAltIcon } from '@heroicons/react/24/outline'
import { useHeaderConfig } from '../../hooks/useAppConfig'
import { Navigation } from './Navigation'

export function Header() {
  const headerConfig = useHeaderConfig()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 h-[50px]">
      <div className="container mx-auto px-6 h-full max-w-7xl">
        <div className="flex items-center justify-between h-full relative">
          {/* Left: Logo & Title */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img 
              src={headerConfig.logo.src}
              alt={headerConfig.logo.alt}
              className="w-5 h-5 flex-shrink-0"
            />
            <span className="text-[15px] font-medium text-gray-900 leading-none">
              {headerConfig.title.toLowerCase()}
            </span>
          </Link>

          {/* Center: Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
            <Navigation />
          </nav>

          {/* Right: Utility Icons & Login */}
          <div className="flex items-center gap-5 flex-shrink-0">
            {/* Search Icon */}
            <button 
              className="text-gray-600 hover:text-gray-900 transition-colors p-1"
              aria-label="Search"
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
            </button>
            
            {/* Theme Toggle */}
            <button 
              className="text-gray-600 hover:text-gray-900 transition-colors p-1"
              aria-label="Toggle theme"
            >
              <SunIcon className="w-5 h-5" />
            </button>
            
            {/* Language Selector */}
            <button 
              className="text-gray-600 hover:text-gray-900 transition-colors p-1 hidden sm:block"
              aria-label="Select language"
            >
              <GlobeAltIcon className="w-5 h-5" />
            </button>
            
            {/* Login Button */}
            <button className="text-sm font-normal text-gray-600 hover:text-gray-900 transition-colors">
              Login
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
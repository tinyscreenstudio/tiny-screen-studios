import React from 'react'
import { HomeIcon, EyeIcon } from '@heroicons/react/24/outline'

interface NavigationProps {
  currentPage: 'home' | 'preview'
  onPageChange: (page: 'home' | 'preview') => void
}

export function Navigation({ currentPage, onPageChange }: NavigationProps) {
  return (
    <nav className="nav-container">
      <div className="flex items-center gap-1 p-1">
        <button
          onClick={() => onPageChange('home')}
          className={`nav-item flex items-center gap-2 ${
            currentPage === 'home' ? 'active' : ''
          }`}
        >
          <HomeIcon className="w-4 h-4" />
          <span>Home</span>
        </button>
        
        <button
          onClick={() => onPageChange('preview')}
          className={`nav-item flex items-center gap-2 ${
            currentPage === 'preview' ? 'active' : ''
          }`}
        >
          <EyeIcon className="w-4 h-4" />
          <span>OLED Studio</span>
        </button>
      </div>
    </nav>
  )
}
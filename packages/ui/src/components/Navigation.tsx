import React from 'react'
import { Link } from 'react-router-dom'
import { HomeIcon, EyeIcon } from '@heroicons/react/24/outline'

interface NavigationProps {
  currentPage: 'home' | 'preview'
}

export function Navigation({ currentPage }: NavigationProps) {
  return (
    <nav className="nav-container">
      <div className="flex items-center gap-1 p-1">
        <Link
          to="/"
          className={`nav-item flex items-center gap-2 ${
            currentPage === 'home' ? 'active' : ''
          }`}
        >
          <HomeIcon className="w-4 h-4" />
          <span>Home</span>
        </Link>
        
        <Link
          to="/oled-studio"
          className={`nav-item flex items-center gap-2 ${
            currentPage === 'preview' ? 'active' : ''
          }`}
        >
          <EyeIcon className="w-4 h-4" />
          <span>OLED Studio</span>
        </Link>
      </div>
    </nav>
  )
}
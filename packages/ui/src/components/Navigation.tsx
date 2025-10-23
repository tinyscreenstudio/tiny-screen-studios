import React from 'react'
import { useNavigate } from 'react-router-dom'
import { HomeIcon, EyeIcon, DocumentIcon } from '@heroicons/react/24/outline'
import { useNavigationConfig } from '../hooks/useAppConfig'

interface NavigationProps {
  currentPage: 'home' | 'preview' | 'docs'
}

// Icon mapping for dynamic icon rendering
const iconMap = {
  HomeIcon,
  EyeIcon,
  DocumentIcon,
}

export function Navigation({ currentPage }: NavigationProps) {
  const navigationItems = useNavigationConfig()
  const navigate = useNavigate()

  const handleNavigation = (item: any) => {
    navigate(item.path)
  }

  return (
    <nav className="nav-container">
      <div className="flex items-center gap-1 p-1">
        {navigationItems.map((item) => {
          const IconComponent = iconMap[item.icon as keyof typeof iconMap]
          const isActive = (currentPage === 'home' && item.path === '/') || 
                          (currentPage === 'preview' && item.path === '/oled-studio') ||
                          (currentPage === 'docs' && item.path === '/docs')
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item)}
              className={`nav-item flex items-center gap-2 ${
                isActive ? 'active' : ''
              }`}
            >
              {IconComponent && <IconComponent className="w-4 h-4" />}
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
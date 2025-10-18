import React from 'react'
import { Link } from 'react-router-dom'
import { HomeIcon, EyeIcon } from '@heroicons/react/24/outline'
import { useNavigationConfig } from '../hooks/useAppConfig'

interface NavigationProps {
  currentPage: 'home' | 'preview'
}

// Icon mapping for dynamic icon rendering
const iconMap = {
  HomeIcon,
  EyeIcon,
}

export function Navigation({ currentPage }: NavigationProps) {
  const navigationItems = useNavigationConfig()

  return (
    <nav className="nav-container">
      <div className="flex items-center gap-1 p-1">
        {navigationItems.map((item) => {
          const IconComponent = iconMap[item.icon as keyof typeof iconMap]
          const isActive = (currentPage === 'home' && item.path === '/') || 
                          (currentPage === 'preview' && item.path === '/oled-studio')
          
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`nav-item flex items-center gap-2 ${
                isActive ? 'active' : ''
              }`}
            >
              {IconComponent && <IconComponent className="w-4 h-4" />}
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
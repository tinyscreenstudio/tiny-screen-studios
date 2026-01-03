import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useNavigationConfig } from '../../hooks/useAppConfig'

export function Navigation() {
  const navigationItems = useNavigationConfig()
  const location = useLocation()

  // Helper to check if a path is active
  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true
    if (path !== '/' && location.pathname.startsWith(path)) return true
    return false
  }

  return (
    <div className="flex items-center gap-8">
      {navigationItems.map((item) => (
        <Link
          key={item.id}
          to={item.path}
          className={`text-sm font-normal text-gray-600 hover:text-gray-900 transition-colors ${
            isActive(item.path) ? 'text-gray-900' : ''
          }`}
        >
          {item.label}
        </Link>
      ))}
    </div>
  )
}
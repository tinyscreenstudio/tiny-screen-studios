import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useNavigationConfig } from '../../hooks/useAppConfig'

export function Navigation() {
  const navigationItems = useNavigationConfig()
  const navigate = useNavigate()
  const location = useLocation()

  const handleNavigation = (path: string) => {
    navigate(path)
  }

  // Helper to check if a path is active
  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true
    if (path !== '/' && location.pathname.startsWith(path)) return true
    return false
  }

  return (
    <nav className="flex items-center gap-6">
      {navigationItems.map((item) => (
        <button
          key={item.id}
          onClick={() => handleNavigation(item.path)}
          className={`text-sm font-medium transition-colors ${
            isActive(item.path)
              ? 'text-primary'
              : 'text-text-secondary hover:text-primary'
          }`}
        >
          {item.label}
        </button>
      ))}
    </nav>
  )
}
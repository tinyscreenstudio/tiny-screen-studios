import React from 'react'
import { Link } from 'react-router-dom'
import { HeartIcon } from '@heroicons/react/24/outline'

interface FooterProps {
  compact?: boolean
}

export function Footer({ compact = false }: FooterProps) {
  const currentYear = new Date().getFullYear()

  // Common footer content
  const FooterContent = () => (
    <div className="container mx-auto px-6 py-6 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-text-muted">
        {/* Left: Copyright */}
        <div className="flex items-center gap-4">
          <span>© {currentYear} TinyScreen.Studios</span>
          <span className="hidden md:inline text-border">|</span>
          <span className="flex items-center gap-1">
            Made with <HeartIcon className="w-3 h-3 text-danger" /> for embedded developers
          </span>
        </div>

        {/* Right: Links */}
        <div className="flex items-center gap-6">
          <Link to="/docs" className="hover:text-primary transition-colors">Documentation</Link>
          <Link to="/privacy-policy" className="hover:text-primary transition-colors">Privacy</Link>
          <Link to="/terms-of-service" className="hover:text-primary transition-colors">Terms</Link>
          <a href="https://github.com/amarpandey/tiny-screen-studio" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
            GitHub
          </a>
        </div>
      </div>
    </div>
  )

  if (compact) {
    return (
      <footer className="mt-auto border-t border-border bg-bg">
        <FooterContent />
      </footer>
    )
  }

  return (
    <footer className="mt-16 border-t border-border bg-bg">
      <FooterContent />
    </footer>
  )
}
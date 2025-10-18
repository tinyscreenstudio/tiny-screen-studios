import React from 'react'
import { 
  HeartIcon, 
  CodeBracketIcon, 
  GlobeAltIcon,
  EnvelopeIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

interface FooterProps {
  compact?: boolean
}

export function Footer({ compact = false }: FooterProps) {
  const currentYear = new Date().getFullYear()

  if (compact) {
    return (
      <footer style={{ backgroundColor: 'var(--color-bg)', borderTop: `1px solid var(--color-border)` }} className="mt-8">
        <div className="container mx-auto px-6 py-6 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt="TinyScreen.Studios Logo" 
                className="w-8 h-8 rounded-lg"
              />
              <span className="font-semibold" style={{ color: 'var(--color-text)' }}>TinyScreen.Studios</span>
            </div>
            
            <div className="text-sm" style={{ color: 'var(--color-muted)' }}>
              © {currentYear} TinyScreen.Studios. All rights reserved.
            </div>
            
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-muted)' }}>
              <span>Made with</span>
              <HeartIcon className="w-4 h-4" style={{ color: 'var(--color-danger)' }} />
              <span>for embedded developers</span>
            </div>
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer style={{ backgroundColor: 'var(--color-bg)', borderTop: `1px solid var(--color-border)` }} className="mt-16">
      <div className="container mx-auto px-6 py-12 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img 
                src="/logo.png" 
                alt="TinyScreen.Studios Logo" 
                className="w-10 h-10 rounded-xl"
              />
              <h3 className="text-xl font-bold text-gradient">TinyScreen.Studios</h3>
            </div>
            <p className="mb-6 max-w-md" style={{ color: 'var(--color-muted)' }}>
              Professional tools for converting pixel art and animations to embedded OLED display formats. 
              Built for developers, makers, and embedded systems enthusiasts.
            </p>
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-muted)' }}>
              <span>Made with</span>
              <HeartIcon className="w-4 h-4" style={{ color: 'var(--color-danger)' }} />
              <span>for the embedded community</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="transition-colors flex items-center gap-2" style={{ color: 'var(--color-muted)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-muted)'}>
                  <DocumentTextIcon className="w-4 h-4" />
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors flex items-center gap-2" style={{ color: 'var(--color-muted)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-muted)'}>
                  <CodeBracketIcon className="w-4 h-4" />
                  API Reference
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors flex items-center gap-2" style={{ color: 'var(--color-muted)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-muted)'}>
                  <GlobeAltIcon className="w-4 h-4" />
                  Examples
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors flex items-center gap-2" style={{ color: 'var(--color-muted)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-muted)'}>
                  <EnvelopeIcon className="w-4 h-4" />
                  Support
                </a>
              </li>
            </ul>
          </div>

          {/* Supported Devices */}
          <div>
            <h4 className="font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Supported Displays</h4>
            <div className="space-y-2">
              <div className="badge">SSD1306 (128×64)</div>
              <div className="badge">SH1106 (132×64)</div>
              <div className="badge">SSD1309 (128×64)</div>
              <div className="badge">Custom Sizes</div>
            </div>
            
            <div className="mt-6">
              <h5 className="font-medium mb-2 text-sm" style={{ color: 'var(--color-text)' }}>Export Formats</h5>
              <div className="text-xs space-y-1" style={{ color: 'var(--color-muted)' }}>
                <div>• C Arrays (.h files)</div>
                <div>• Binary Data (.bin)</div>
                <div>• Arduino Libraries</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 flex flex-col md:flex-row justify-between items-center" style={{ borderTop: `1px solid var(--color-border)` }}>
          <div className="text-sm mb-4 md:mb-0" style={{ color: 'var(--color-muted)' }}>
            © {currentYear} TinyScreen.Studios. All rights reserved.
          </div>
          
          <div className="flex items-center gap-6 text-sm">
            <a href="#" className="transition-colors" style={{ color: 'var(--color-muted)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-muted)'}>
              Privacy Policy
            </a>
            <a href="#" className="transition-colors" style={{ color: 'var(--color-muted)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-muted)'}>
              Terms of Service
            </a>
            <a href="#" className="transition-colors" style={{ color: 'var(--color-muted)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-muted)'}>
              Open Source
            </a>
          </div>
        </div>

        {/* Tech Stack & Version */}
        <div className="mt-6 flex flex-col md:flex-row items-center justify-center gap-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-muted)' }}>
            <CodeBracketIcon className="w-4 h-4" />
            <span>Built with React, TypeScript & TailwindCSS</span>
          </div>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-primary)' }}>
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-primary)' }}></div>
            <span>v1.0.0 Beta</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
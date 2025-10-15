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
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="container mx-auto px-6 py-6 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt="TinyScreen.Studios Logo" 
                className="w-8 h-8 rounded-lg"
              />
              <span className="font-semibold text-gray-900">TinyScreen.Studios</span>
            </div>
            
            <div className="text-sm text-gray-500">
              © {currentYear} TinyScreen.Studios. All rights reserved.
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Made with</span>
              <HeartIcon className="w-4 h-4 text-red-500" />
              <span>for embedded developers</span>
            </div>
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
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
            <p className="text-gray-600 mb-6 max-w-md">
              Professional tools for converting pixel art and animations to embedded OLED display formats. 
              Built for developers, makers, and embedded systems enthusiasts.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Made with</span>
              <HeartIcon className="w-4 h-4 text-red-500" />
              <span>for the embedded community</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors flex items-center gap-2">
                  <DocumentTextIcon className="w-4 h-4" />
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors flex items-center gap-2">
                  <CodeBracketIcon className="w-4 h-4" />
                  API Reference
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors flex items-center gap-2">
                  <GlobeAltIcon className="w-4 h-4" />
                  Examples
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors flex items-center gap-2">
                  <EnvelopeIcon className="w-4 h-4" />
                  Support
                </a>
              </li>
            </ul>
          </div>

          {/* Supported Devices */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Supported Displays</h4>
            <div className="space-y-2">
              <div className="badge">SSD1306 (128×64)</div>
              <div className="badge">SH1106 (132×64)</div>
              <div className="badge">SSD1309 (128×64)</div>
              <div className="badge">Custom Sizes</div>
            </div>
            
            <div className="mt-6">
              <h5 className="font-medium text-gray-700 mb-2 text-sm">Export Formats</h5>
              <div className="text-xs text-gray-500 space-y-1">
                <div>• C Arrays (.h files)</div>
                <div>• Binary Data (.bin)</div>
                <div>• Arduino Libraries</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-500 mb-4 md:mb-0">
            © {currentYear} TinyScreen.Studios. All rights reserved.
          </div>
          
          <div className="flex items-center gap-6 text-sm">
            <a href="#" className="text-gray-500 hover:text-indigo-600 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-500 hover:text-indigo-600 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-gray-500 hover:text-indigo-600 transition-colors">
              Open Source
            </a>
          </div>
        </div>

        {/* Tech Stack & Version */}
        <div className="mt-6 flex flex-col md:flex-row items-center justify-center gap-4">
          <div className="inline-flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full text-sm text-gray-600">
            <CodeBracketIcon className="w-4 h-4" />
            <span>Built with React, TypeScript & TailwindCSS</span>
          </div>
          
          <div className="inline-flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-full text-sm text-indigo-700">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
            <span>v1.0.0 Beta</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
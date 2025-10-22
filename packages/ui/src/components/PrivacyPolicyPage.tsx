import React from 'react'
import { EyeIcon, ServerIcon, UserIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { Header } from './Header'
import { Footer } from './Footer'
import { Navigation } from './Navigation'

export function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header />

      {/* Main content */}
      <main className="flex-1">
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          {/* Navigation */}
          <div className="mb-8">
            <Navigation currentPage="home" />
          </div>

          {/* Hero Section */}
          <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl mb-8">
            {/* Light pixel-art inspired background */}
            <div className="absolute inset-0">
              {/* Subtle pixel grid pattern */}
              <div className="absolute inset-0 opacity-30" style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, var(--color-primary) 1px, transparent 0)`,
                backgroundSize: '20px 20px'
              }}></div>

              {/* Floating pixel blocks - light theme */}
              <div className="absolute top-20 left-10 w-6 h-6 opacity-60 animate-float pixelated" style={{ backgroundColor: 'rgba(99, 102, 241, 0.3)' }}></div>
              <div className="absolute top-32 right-20 w-4 h-4 opacity-70 animate-float-delayed pixelated" style={{ backgroundColor: 'rgba(139, 92, 246, 0.3)' }}></div>
              <div className="absolute bottom-40 left-1/4 w-8 h-8 opacity-50 animate-float-slow pixelated" style={{ backgroundColor: 'rgba(59, 130, 246, 0.3)' }}></div>
              <div className="absolute bottom-20 right-1/3 w-5 h-5 opacity-65 animate-pulse pixelated" style={{ backgroundColor: 'rgba(6, 182, 212, 0.3)' }}></div>

              {/* Light geometric shapes */}
              <div className="absolute top-1/4 right-1/4 w-32 h-32 rounded-full opacity-40 blur-xl animate-float" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)' }}></div>
              <div className="absolute bottom-1/3 left-1/5 w-24 h-24 rounded-full opacity-50 blur-xl animate-float-delayed" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)' }}></div>
            </div>

            <div className="relative w-full px-4 sm:px-6 lg:px-8">
              <div className="text-center py-20 lg:py-32">
                <div className="animate-fade-in">
                  {/* Clean badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 backdrop-blur-sm rounded-full text-sm font-medium mb-8 shadow-sm" style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    border: `1px solid rgba(99, 102, 241, 0.3)`,
                    color: 'var(--color-primary)'
                  }}>
                    <SparklesIcon className="w-4 h-4" />
                    Professional OLED Tools
                  </div>

                  <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight" style={{ color: 'var(--color-text)' }}>
                    Privacy Policy
                  </h1>

                  <p className="text-lg sm:text-xl lg:text-2xl max-w-4xl mx-auto mb-12 leading-relaxed font-light" style={{ color: 'var(--color-muted)' }}>
                    Your privacy is important to us with <span style={{ color: 'var(--color-primary)', fontWeight: '600' }}>TinyScreen.Studios</span>. <span style={{ color: '#8b5cf6', fontWeight: '600' }}>Transparent policies</span> for how we handle your data with care and professional tools for embedded developers.
                  </p>

                  {/* Feature highlights - clean light style */}
                  <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm" style={{ color: 'var(--color-muted)' }}>
                    <div className="flex items-center gap-2 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', border: `1px solid rgba(16, 185, 129, 0.3)` }}>
                      <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-success)' }}></div>
                      Data Protection
                    </div>
                    <div className="flex items-center gap-2 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', border: `1px solid rgba(59, 130, 246, 0.3)` }}>
                      <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-info)' }}></div>
                      Transparency
                    </div>
                    <div className="flex items-center gap-2 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', border: `1px solid rgba(139, 92, 246, 0.3)` }}>
                      <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#8b5cf6' }}></div>
                      User Control
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Content */}
          <div>
            {/* Content */}
            <div className="prose prose-lg max-w-none">
              <div className="grid gap-8">

                {/* Data Collection */}
                <section className="card p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <EyeIcon className="w-6 h-6 text-indigo-600" />
                    <h2 className="text-2xl font-semibold text-gray-900">What We Collect</h2>
                  </div>
                  <div className="space-y-4 text-gray-700">
                    <p>
                      TinyScreen.Studios is designed with privacy in mind. We collect minimal data to provide our services:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li><strong>Files you upload:</strong> Images and pixel art files are processed locally in your browser</li>
                      <li><strong>Usage analytics:</strong> Basic, anonymized usage statistics to improve our service</li>
                      <li><strong>Technical data:</strong> Browser type, device information for compatibility purposes</li>
                    </ul>
                  </div>
                </section>

                {/* Data Processing */}
                <section className="card p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <ServerIcon className="w-6 h-6 text-purple-600" />
                    <h2 className="text-2xl font-semibold text-gray-900">How We Process Your Data</h2>
                  </div>
                  <div className="space-y-4 text-gray-700">
                    <p>
                      Your privacy is our priority. Here's how we handle your data:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li><strong>Local processing:</strong> All image processing happens in your browser - files never leave your device</li>
                      <li><strong>No file storage:</strong> We don't store your uploaded images on our servers</li>
                      <li><strong>Temporary data:</strong> Any temporary data is automatically cleared when you close the browser</li>
                      <li><strong>Analytics:</strong> We use privacy-focused analytics that don't track individual users</li>
                    </ul>
                  </div>
                </section>

                {/* Your Rights */}
                <section className="card p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <UserIcon className="w-6 h-6 text-emerald-600" />
                    <h2 className="text-2xl font-semibold text-gray-900">Your Rights</h2>
                  </div>
                  <div className="space-y-4 text-gray-700">
                    <p>
                      You have full control over your data:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li><strong>Data portability:</strong> Export your processed images at any time</li>
                      <li><strong>Data deletion:</strong> Clear your browser data to remove any local storage</li>
                      <li><strong>Opt-out:</strong> Disable analytics in your browser settings</li>
                      <li><strong>Transparency:</strong> This tool is open source - you can review our code</li>
                    </ul>
                  </div>
                </section>

                {/* Contact */}
                <section className="card p-8 bg-gradient-to-r from-indigo-50 to-purple-50">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Questions?</h2>
                  <p className="text-gray-700 mb-4">
                    If you have any questions about this privacy policy or how we handle your data, please reach out to us.
                  </p>
                  <p className="text-gray-600">
                    This policy may be updated from time to time. We'll notify users of any significant changes.
                  </p>
                </section>

              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
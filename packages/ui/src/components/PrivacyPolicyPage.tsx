import React from 'react'
import { EyeIcon, ServerIcon, UserIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { Header } from './Header'
import { Footer } from './Footer'
import { Navigation } from './Navigation'

export function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header />

      {/* Main content */}
      <main className="flex-1">
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          {/* Navigation */}
          <div className="mb-8">
            <Navigation currentPage="home" />
          </div>

          {/* Hero Section - OLED Dark Theme */}
          <section className="relative overflow-hidden rounded-3xl mb-8" style={{
            background: 'linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #000000 100%)',
            border: '2px solid var(--color-primary)'
          }}>
            {/* OLED pixel grid */}
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: `
                linear-gradient(0deg, transparent 24%, rgba(255, 107, 53, 0.05) 25%, rgba(255, 107, 53, 0.05) 26%, transparent 27%, transparent 74%, rgba(255, 107, 53, 0.05) 75%, rgba(255, 107, 53, 0.05) 76%, transparent 77%, transparent),
                linear-gradient(90deg, transparent 24%, rgba(255, 107, 53, 0.05) 25%, rgba(255, 107, 53, 0.05) 26%, transparent 27%, transparent 74%, rgba(255, 107, 53, 0.05) 75%, rgba(255, 107, 53, 0.05) 76%, transparent 77%, transparent)
              `,
              backgroundSize: '4px 4px'
            }}></div>

            {/* Glowing OLED pixels */}
            <div className="absolute inset-0">
              <div className="absolute top-20 left-10 w-2 h-2 glow-primary" style={{ backgroundColor: 'var(--color-primary)' }}></div>
              <div className="absolute top-32 right-20 w-2 h-2 glow-accent" style={{ backgroundColor: 'var(--color-accent)' }}></div>
              <div className="absolute bottom-40 left-1/4 w-2 h-2 glow-primary" style={{ backgroundColor: 'var(--color-primary)' }}></div>
              <div className="absolute bottom-20 right-1/3 w-2 h-2 glow-accent" style={{ backgroundColor: 'var(--color-accent)' }}></div>
            </div>

            {/* Gradient glow effects */}
            <div className="absolute top-0 left-1/4 w-96 h-96 opacity-30 blur-3xl" style={{ background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)' }}></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 opacity-30 blur-3xl" style={{ background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)' }}></div>

            <div className="relative w-full px-4 sm:px-6 lg:px-8">
              <div className="text-center py-16 lg:py-24">
                {/* OLED badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8" style={{
                  backgroundColor: 'rgba(255, 107, 53, 0.1)',
                  border: '1px solid var(--color-primary)',
                  color: 'var(--color-primary)',
                  boxShadow: '0 0 20px rgba(255, 107, 53, 0.3)'
                }}>
                  <SparklesIcon className="w-4 h-4" />
                  Professional OLED Tools
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white">
                  Privacy Policy
                </h1>

                <p className="text-lg sm:text-xl lg:text-2xl max-w-4xl mx-auto mb-12 leading-relaxed" style={{ color: '#888888' }}>
                  Your privacy is important to us with <span className="brand-orange font-semibold">TinyScreen.Studios</span>. <span className="brand-cyan font-semibold">Transparent policies</span> for how we handle your data with care and professional tools for embedded developers.
                </p>

                {/* Feature highlights - OLED style */}
                <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm text-white">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-success)' }}></div>
                    Data Protection
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-accent)' }}></div>
                    Transparency
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }}></div>
                    User Control
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
                    <EyeIcon className="w-6 h-6 brand-orange" />
                    <h2 className="text-2xl font-semibold" style={{ color: 'var(--color-text)' }}>What We Collect</h2>
                  </div>
                  <div className="space-y-4" style={{ color: 'var(--color-muted)' }}>
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
                    <ServerIcon className="w-6 h-6 brand-cyan" />
                    <h2 className="text-2xl font-semibold" style={{ color: 'var(--color-text)' }}>How We Process Your Data</h2>
                  </div>
                  <div className="space-y-4" style={{ color: 'var(--color-muted)' }}>
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
                    <UserIcon className="w-6 h-6" style={{ color: 'var(--color-success)' }} />
                    <h2 className="text-2xl font-semibold" style={{ color: 'var(--color-text)' }}>Your Rights</h2>
                  </div>
                  <div className="space-y-4" style={{ color: 'var(--color-muted)' }}>
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
                <section className="card p-8" style={{
                  background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.05) 0%, rgba(0, 217, 255, 0.05) 100%)'
                }}>
                  <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Questions?</h2>
                  <p className="mb-4" style={{ color: 'var(--color-muted)' }}>
                    If you have any questions about this privacy policy or how we handle your data, please reach out to us.
                  </p>
                  <p style={{ color: 'var(--color-muted)' }}>
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
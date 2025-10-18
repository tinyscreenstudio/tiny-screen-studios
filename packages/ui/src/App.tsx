import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Header } from './components/Header'
import { Navigation } from './components/Navigation'
import { HomePage } from './components/HomePage'
import { PreviewPage } from './components/PreviewPage'
import { Footer } from './components/Footer'
import { useAppStore } from './store/appStore'

function App() {
  const location = useLocation()
  const { isProcessing } = useAppStore()

  // Determine current page based on URL
  const currentPage = location.pathname === '/oled-studio' ? 'preview' : 'home'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header />

      {/* Main content */}
      <main className="flex-1">
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          {/* Navigation */}
          <div className="mb-8">
            <Navigation currentPage={currentPage} />
          </div>

          {/* Page Content */}
          <div className="animate-fade-in">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/oled-studio" element={<PreviewPage />} />
            </Routes>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer compact={currentPage === 'preview'} />

      {/* Processing overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="card p-8 text-center max-w-md mx-4">
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Processing</h3>
            <p className="text-gray-600">Converting your pixel art for tiny screens...</p>
            <div className="mt-4 progress-bar">
              <div className="progress-fill w-3/4"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
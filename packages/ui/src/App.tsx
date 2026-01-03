import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Header, Footer } from './components/layout'
import { HomePage, PrivacyPolicyPage, TermsOfServicePage } from './components/pages'
import { PreviewPage } from './components/preview'
import { DocumentationPage } from './components/documentation'
import { ScrollToTop } from './components/ui'
import { useAppStore } from './store/appStore'
import { useFeatureFlags, useProcessingConfig, useUIConfig } from './hooks/useAppConfig'
import { useDocumentationPreloader } from './hooks/useDocumentationPreloader'

function App() {

  const { isProcessing } = useAppStore()
  const featureFlags = useFeatureFlags()
  const processingConfig = useProcessingConfig()
  const uiConfig = useUIConfig()

  // Initialize documentation preloading
  useDocumentationPreloader()

  // Check if we're on a legal page (privacy/terms) to hide navigation
  // const isLegalPage = location.pathname === '/privacy-policy' || location.pathname === '/terms-of-service'

  // Legal pages handle their own layout completely
  /*
  if (isLegalPage) {
    return (
      <>
        <ScrollToTop />
        <div className={uiConfig.animations.enabled ? "animate-fade-in" : ""}>
          <Routes>
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms-of-service" element={<TermsOfServicePage />} />
          </Routes>
        </div>
      </>
    )
  }
  */

  return (
    <div className="min-h-screen bg-bg flex flex-col pt-[64px]">
      {/* Scroll to top on route change */}
      <ScrollToTop />

      {/* Header */}
      <Header />

      {/* Main content */}
      <main className="flex-1">
        <div className={`container mx-auto px-6 py-8 max-w-7xl`}>
          {/* Page Content */}
          <div className={uiConfig.animations.enabled ? "animate-fade-in" : ""}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/oled-studio" element={<PreviewPage />} />
              <Route path="/docs" element={<Navigate to="/docs/getting-started" replace />} />
              <Route path="/docs/:section" element={<DocumentationPage />} />
              <Route path="/docs/:section/:topic" element={<DocumentationPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms-of-service" element={<TermsOfServicePage />} />
            </Routes>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Processing overlay */}
      {isProcessing && featureFlags.showProcessingOverlay && processingConfig.showOverlay && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="card p-8 text-center max-w-md mx-4">
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {processingConfig.overlayMessages.title}
            </h3>
            <p className="text-gray-600">
              {processingConfig.overlayMessages.description}
            </p>
            {processingConfig.progressBar.enabled && (
              <div className="mt-4 progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${processingConfig.progressBar.defaultProgress}%` }}
                ></div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
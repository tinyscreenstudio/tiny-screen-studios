import React from 'react'
import { ScaleIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

export function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4 text-text-primary">Terms of Service</h1>
        <p className="text-lg text-text-muted">
          Clear, simple terms for using TinyScreen Studio.
        </p>
      </div>

      {/* Main Content */}
      <div className="prose prose-invert max-w-none">
        <div className="grid gap-8">
          {/* Usage Terms */}
          <section className="bg-bg-secondary/30 p-6 rounded-xl border border-border">
            <div className="flex items-center gap-3 mb-4">
              <ScaleIcon className="w-6 h-6" />
              <h2 className="text-xl font-semibold m-0">Usage Terms</h2>
            </div>
            <div className="space-y-4 text-text-muted">
              <p>
                By using TinyScreen Studio, you agree to comply with all applicable laws and regulations.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Do not use the service for illegal purposes</li>
                <li>Respect intellectual property rights</li>
                <li>Do not attempt to disrupt or compromise the service</li>
              </ul>
            </div>
          </section>

          {/* License */}
          <section className="bg-bg-secondary/30 p-6 rounded-xl border border-border">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircleIcon className="w-6 h-6" />
              <h2 className="text-xl font-semibold m-0">License</h2>
            </div>
            <div className="space-y-4 text-text-muted">
              <p>
                TinyScreen Studio is provided "as is" without warranties of any kind. You may use the tool to create and export assets for your own projects.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Open source components are used under their respective licenses</li>
                <li>Exported assets are yours to use and distribute</li>
                <li>We reserve the right to update these terms at any time</li>
              </ul>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-bg-secondary/30 p-6 rounded-xl border border-border">
            <h2 className="text-xl font-semibold mb-2">Questions?</h2>
            <p className="text-text-muted mb-2">
              If you have any questions about these terms, please reach out to us.
            </p>
            <p className="text-text-muted">
              These terms may be updated occasionally. Significant changes will be communicated.
            </p>
          </section>

          <div className="mt-12 pt-8 border-t border-border text-center text-sm text-text-muted">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

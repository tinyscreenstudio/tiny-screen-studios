import React from 'react'
import { EyeIcon, ServerIcon, UserIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'

export function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4 text-text-primary">Privacy Policy</h1>
        <p className="text-lg text-text-muted">
          Transparency and trust are core to our mission.
        </p>
      </div>

      {/* Main Content */}
      <div className="prose prose-invert max-w-none">
        <div className="grid gap-8">
          <section className="bg-bg-secondary/30 p-6 rounded-xl border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <EyeIcon className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-xl font-semibold m-0">Information Collection</h2>
            </div>
            <p className="text-text-muted">
              We collect minimal information necessary to provide our services. This includes:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-text-muted">
              <li>Account information (if you create an account)</li>
              <li>Usage data to improve our tools</li>
              <li>Uploaded assets (stored temporarily for processing)</li>
            </ul>
          </section>

          <section className="bg-bg-secondary/30 p-6 rounded-xl border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ServerIcon className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-xl font-semibold m-0">Data Usage</h2>
            </div>
            <p className="text-text-muted">
              Your data is used solely for:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-text-muted">
              <li>Providing and maintaining the TinyScreen Studio service</li>
              <li>Notifying you about changes to our service</li>
              <li>Providing customer support</li>
              <li>Detecting, preventing and addressing technical issues</li>
            </ul>
          </section>

          <section className="bg-bg-secondary/30 p-6 rounded-xl border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ShieldCheckIcon className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-xl font-semibold m-0">Data Security</h2>
            </div>
            <p className="text-text-muted">
              The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
            </p>
          </section>

          <section className="bg-bg-secondary/30 p-6 rounded-xl border border-border">
             <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <UserIcon className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-xl font-semibold m-0">Your Rights</h2>
            </div>
            <p className="text-text-muted">
              You have the right to access, update or delete the information we have on you. Whenever made possible, you can access, update or request deletion of your Personal Data directly within your account settings section. If you are unable to perform these actions yourself, please contact us to assist you.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-text-muted">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <p className="mt-2">
            If you have any questions about this Privacy Policy, please contact us at support@tinyscreen.studio
          </p>
        </div>
      </div>
    </div>
  )
}
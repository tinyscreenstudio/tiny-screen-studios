import React, { useState } from 'react'
import {
  CurrencyDollarIcon,
  UserGroupIcon,
  ChartBarIcon,
  SparklesIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  PaintBrushIcon,
  CpuChipIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

const CREATOR_BENEFITS = [
  {
    icon: CurrencyDollarIcon,
    title: '70% Revenue Share',
    description: 'Keep the majority of your earnings. We only take 30% to maintain the platform.'
  },
  {
    icon: UserGroupIcon,
    title: 'Global Audience',
    description: 'Reach 50,000+ developers worldwide looking for quality 1-bit art.'
  },
  {
    icon: ChartBarIcon,
    title: 'Analytics Dashboard',
    description: 'Track your sales, views, and earnings with detailed analytics.'
  },
  {
    icon: SparklesIcon,
    title: 'Marketing Support',
    description: 'Get featured in our newsletter and social media channels.'
  }
]

const UPLOAD_STEPS = [
  {
    step: 1,
    title: 'Create Your Art',
    description: 'Design your 1-bit pixel art using any graphics software. Focus on 128x32, 128x64, or 132x64 resolutions.'
  },
  {
    step: 2,
    title: 'Upload & Convert',
    description: 'Use our conversion tools to optimize your art for different display formats (SSD1306, SH1106, etc.).'
  },
  {
    step: 3,
    title: 'Set Your Price',
    description: 'Choose a fair price for your work. Most successful pieces range from $1.99 to $9.99.'
  },
  {
    step: 4,
    title: 'Publish & Earn',
    description: 'Once approved, your art goes live and you start earning from every download.'
  }
]

export function SellPage() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)
    // Here you would typically send the email to your backend
  }

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 to-purple-500/5 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Turn Your 1-bit Art Into <span className="text-primary">Passive Income</span>
            </h1>
            <p className="text-xl text-text-muted mb-8 max-w-2xl mx-auto">
              Join 2,500+ artists earning from their pixel art. Our marketplace connects you with developers 
              building the next generation of embedded devices.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-hover transition-colors flex items-center gap-2">
                <PaintBrushIcon className="w-5 h-5" />
                Start Selling Today
              </button>
              <button className="border border-border bg-white text-text px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                View Creator Guidelines
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-y border-border">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">$180k+</div>
              <div className="text-text-muted">Paid to Artists</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">2,500+</div>
              <div className="text-text-muted">Active Creators</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">15k+</div>
              <div className="text-text-muted">Art Pieces Sold</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">50k+</div>
              <div className="text-text-muted">Monthly Buyers</div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Creators Choose Us</h2>
            <p className="text-text-muted text-lg">
              We're built by artists, for artists. Everything we do is designed to help you succeed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {CREATOR_BENEFITS.map((benefit, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-border hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg text-primary">
                    <benefit.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                    <p className="text-text-muted">{benefit.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-bg-secondary/30">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-text-muted text-lg">
              From creation to cash - here's how to start earning from your 1-bit art.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {UPLOAD_STEPS.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                    {step.step}
                  </div>
                  <h3 className="font-semibold text-lg mb-3">{step.title}</h3>
                  <p className="text-text-muted text-sm">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Art Requirements</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl p-6 border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <CpuChipIcon className="w-6 h-6 text-primary" />
                  <h3 className="font-semibold text-lg">Technical Specs</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                    <span className="text-sm">1-bit monochrome (black & white only)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Supported resolutions: 128x64, 128x32, 132x64</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                    <span className="text-sm">PNG format, no compression artifacts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Clean pixel art (no anti-aliasing)</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl p-6 border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <DocumentTextIcon className="w-6 h-6 text-primary" />
                  <h3 className="font-semibold text-lg">Content Guidelines</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Original artwork only (no copyrighted content)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Clear, descriptive titles and tags</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Professional quality and attention to detail</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Appropriate for all audiences</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Earning?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join our community of creators and start monetizing your 1-bit art today. 
            It takes less than 5 minutes to get started.
          </p>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex gap-3">
                <input
                  type="email"
                  placeholder="Enter your email to get started"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-lg text-text border-0 focus:ring-2 focus:ring-white/50 outline-none"
                  required
                />
                <button
                  type="submit"
                  className="bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  Get Started <ArrowRightIcon className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm opacity-75 mt-3">
                We'll send you creator guidelines and setup instructions.
              </p>
            </form>
          ) : (
            <div className="max-w-md mx-auto bg-white/10 rounded-lg p-6">
              <CheckCircleIcon className="w-12 h-12 mx-auto mb-4 text-green-300" />
              <h3 className="text-xl font-semibold mb-2">Thanks for your interest!</h3>
              <p className="opacity-90">
                We've sent creator guidelines to <strong>{email}</strong>. 
                Check your inbox and let's get you started!
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
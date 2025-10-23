import React from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  BookOpenIcon,
  PlayIcon,
  CpuChipIcon,
  CodeBracketIcon,
  PhotoIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline'
import { DocumentationContent } from './DocumentationContent'

// Documentation structure
const docSections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: PlayIcon,
    description: 'Quick start guide and basic concepts',
    items: [
      { id: 'overview', title: 'Overview', path: '/docs/getting-started' },
      { id: 'first-image', title: 'Your First Image', path: '/docs/getting-started/first-image' },
      { id: 'arduino-setup', title: 'Arduino Setup', path: '/docs/getting-started/arduino' }
    ]
  },
  {
    id: 'displays',
    title: 'Display Types',
    icon: CpuChipIcon,
    description: 'Supported OLED controllers and configurations',
    items: [
      { id: 'ssd1306', title: 'SSD1306 Displays', path: '/docs/displays/ssd1306' },
      { id: 'sh1106', title: 'SH1106 Displays', path: '/docs/displays/sh1106' },
      { id: 'ssd1309', title: 'SSD1309 Displays', path: '/docs/displays/ssd1309' }
    ]
  },
  {
    id: 'image-processing',
    title: 'Image Processing',
    icon: PhotoIcon,
    description: 'Converting and optimizing images for OLED',
    items: [
      { id: 'formats', title: 'Supported Formats', path: '/docs/image-processing/formats' },
      { id: 'optimization', title: 'Image Optimization', path: '/docs/image-processing/optimization' },
      { id: 'animations', title: 'Creating Animations', path: '/docs/image-processing/animations' }
    ]
  },
  {
    id: 'export',
    title: 'Export & Code',
    icon: CodeBracketIcon,
    description: 'Export formats and code integration',
    items: [
      { id: 'c-arrays', title: 'C Arrays', path: '/docs/export/c-arrays' },
      { id: 'binary-files', title: 'Binary Files', path: '/docs/export/binary' },
      { id: 'arduino-code', title: 'Arduino Examples', path: '/docs/export/arduino' }
    ]
  },
  {
    id: 'advanced',
    title: 'Advanced Settings',
    icon: Cog6ToothIcon,
    description: 'Fine-tuning and advanced configurations',
    items: [
      { id: 'dithering', title: 'Dithering Options', path: '/docs/advanced/dithering' },
      { id: 'bit-order', title: 'Bit Order & Packing', path: '/docs/advanced/bit-order' },
      { id: 'custom-presets', title: 'Custom Presets', path: '/docs/advanced/presets' }
    ]
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    icon: QuestionMarkCircleIcon,
    description: 'Common issues and solutions',
    items: [
      { id: 'display-issues', title: 'Display Problems', path: '/docs/troubleshooting/display' },
      { id: 'arduino-errors', title: 'Arduino Errors', path: '/docs/troubleshooting/arduino' },
      { id: 'image-quality', title: 'Image Quality', path: '/docs/troubleshooting/quality' }
    ]
  }
]

export function DocumentationPage() {
  const { section, topic } = useParams<{ section?: string; topic?: string }>()

  // Default to getting-started if no section specified
  const currentSection = section || 'getting-started'
  const currentTopic = topic || ''



  return (
    <div className="space-y-8">
      {/* Hero Section - OLED Aesthetic */}
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
          <div className="absolute top-20 left-10 w-2 h-2 animate-pulse" style={{ backgroundColor: 'var(--color-primary)' }}></div>
          <div className="absolute top-32 right-20 w-2 h-2 animate-pulse" style={{ backgroundColor: 'var(--color-accent)', animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-40 left-1/4 w-2 h-2 animate-pulse" style={{ backgroundColor: 'var(--color-primary)', animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 right-1/3 w-2 h-2 animate-pulse" style={{ backgroundColor: 'var(--color-accent)', animationDelay: '1.5s' }}></div>
        </div>

        {/* Gradient glow effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 opacity-30 blur-3xl" style={{ background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)' }}></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 opacity-30 blur-3xl" style={{ background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)' }}></div>

        <div className="relative w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16 lg:py-24">
            {/* Documentation badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8" style={{
              backgroundColor: 'rgba(255, 107, 53, 0.1)',
              border: '1px solid var(--color-primary)',
              color: 'var(--color-primary)',
              boxShadow: '0 0 20px rgba(255, 107, 53, 0.3)'
            }}>
              <BookOpenIcon className="w-4 h-4" />
              Developer Resources
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white">
              Documentation
            </h1>

            <p className="text-lg sm:text-xl lg:text-2xl max-w-4xl mx-auto mb-12 leading-relaxed" style={{ color: '#888888' }}>
              Learn how to convert <span className="brand-orange font-semibold">pixel art and animations</span> for embedded OLED displays. <span className="brand-cyan font-semibold">Hardware guides</span> and code examples included.
            </p>

            {/* Feature highlights - OLED style */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm text-white">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-success)' }}></div>
                Step-by-Step Guides
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-accent)' }}></div>
                Code Examples
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }}></div>
                Hardware Setup
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Documentation Content with Consistent Sidebar Layout */}
      <div className="flex gap-8">
        {/* Sidebar Navigation */}
        <div className="w-80 flex-shrink-0">
          <div className="card p-6 sticky top-8">
            <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
              Documentation
            </h3>

            <nav className="space-y-1">
              {docSections.map((section) => (
                <div key={section.id}>
                  <Link
                    to={`/docs/${section.id}`}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentSection === section.id
                      ? 'bg-orange-50 text-orange-700 border border-orange-200'
                      : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    <section.icon className="w-4 h-4" />
                    {section.title}
                  </Link>

                  {currentSection === section.id && (
                    <div className="ml-7 mt-1 space-y-1">
                      {section.items.map((item) => (
                        <Link
                          key={item.id}
                          to={item.path}
                          className={`block px-3 py-1.5 rounded text-sm transition-colors ${item.path === `/docs/${currentSection}${currentTopic ? `/${currentTopic}` : ''}`
                            ? 'bg-orange-100 text-orange-700 font-medium'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                          {item.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>


          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="card p-8">
            <DocumentationContent section={currentSection} topic={currentTopic} />
          </div>
        </div>
      </div>

    </div>
  )
}
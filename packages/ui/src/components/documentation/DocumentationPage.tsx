import React from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import {

  PlayIcon,
  CpuChipIcon,
  CodeBracketIcon,
  PhotoIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  ChevronRightIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { DocumentationContent } from './DocumentationContent'

// Documentation structure
const docSections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: PlayIcon,
    items: [
      { id: 'first-image', title: 'Your First Image', path: '/docs/getting-started/first-image' },
      { id: 'arduino-setup', title: 'Arduino Setup', path: '/docs/getting-started/arduino' }
    ]
  },
  {
    id: 'displays',
    title: 'Display Types',
    icon: CpuChipIcon,
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
    items: [
      { id: 'display-issues', title: 'Display Problems', path: '/docs/troubleshooting/display' },
      { id: 'arduino-errors', title: 'Arduino Errors', path: '/docs/troubleshooting/arduino' },
      { id: 'image-quality', title: 'Image Quality', path: '/docs/troubleshooting/quality' }
    ]
  }
]

export function DocumentationPage() {
  const { section, topic } = useParams<{ section?: string; topic?: string }>()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  // Default to getting-started if no section specified
  const currentSectionId = section || 'getting-started'

  // Find current section and item for breadcrumbs
  const currentSectionData = docSections.find(s => s.id === currentSectionId)
  const currentItemData = currentSectionData?.items.find(i => location.pathname.includes(i.path))

  return (
    <div className="min-h-screen bg-bg pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-text-primary">Documentation</h1>
        </div>
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Mobile Menu Button */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg bg-bg-secondary text-text-primary"
            >
              {isMobileMenuOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
              <span>Menu</span>
            </button>
          </div>

          {/* Sidebar Navigation */}
          <aside className={`
            lg:w-64 flex-shrink-0 lg:block
            ${isMobileMenuOpen ? 'block' : 'hidden'}
          `}>
            <nav className="sticky top-24 space-y-8 pb-10">
              <h2 className="font-semibold text-text-primary">Documentation</h2>
              {docSections.map((section) => (
                <div key={section.id}>
                  <h3 className="flex items-center gap-2 font-semibold text-text-primary mb-3">
                    <section.icon className="w-5 h-5 text-primary" />
                    {section.title}
                  </h3>
                  <ul className="space-y-1 border-l border-border ml-2 pl-4">
                    {section.items.map((item) => {
                      const isActive = location.pathname.includes(item.path)
                      return (
                        <li key={item.id}>
                          <Link
                            to={item.path}
                            className={`block py-1 text-sm transition-colors ${isActive
                                ? 'text-primary font-medium -ml-[17px] border-l-2 border-primary pl-[15px]'
                                : 'text-text-muted hover:text-text-primary'
                              }`}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {item.title}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0 pb-16">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-text-muted mb-8">
              <Link to="/docs" className="hover:text-primary">Docs</Link>
              <ChevronRightIcon className="w-4 h-4" />
              <span className="text-text-primary">{currentSectionData?.title}</span>
              {currentItemData && (
                <>
                  <ChevronRightIcon className="w-4 h-4" />
                  <span className="font-medium text-primary">{currentItemData.title}</span>
                </>
              )}
            </div>

            <div className="prose prose-invert max-w-none">
              <DocumentationContent section={section || 'getting-started'} topic={topic || ''} />
            </div>

            {/* Navigation Footer */}
            <div className="mt-16 pt-8 border-t border-border flex justify-between">
              {/* Previous Link Logic could go here */}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

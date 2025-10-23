import React, { useState, useEffect } from 'react'
import { documentationLoader } from '../utils/documentationLoader'
import { MarkdownRenderer } from './MarkdownRenderer'
import { DocumentationSystemError } from '../types/documentation'

interface DocumentationContentProps {
  section?: string
  topic?: string
}

export function DocumentationContent({ section = 'getting-started', topic = '' }: DocumentationContentProps) {
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [retryAttempts, setRetryAttempts] = useState<number>(0)

  // Load content when section or topic changes
  useEffect(() => {
    setRetryAttempts(0) // Reset retry count for new content
    loadContent()

    // Preload related and next content in background
    documentationLoader.preloadRelatedContent(section, topic || undefined)
    documentationLoader.preloadNextContent(section, topic || undefined)
  }, [section, topic])

  const loadContent = async () => {
    setLoading(true)
    setError(null)

    try {
      const markdownContent = await documentationLoader.loadContent(section, topic || undefined)
      setContent(markdownContent)
      setRetryAttempts(0) // Reset on successful load
    } catch (err) {
      if (err instanceof DocumentationSystemError) {
        setError(err.message)

        // Automatic retry for network errors (but not for content not found)
        if (err.type !== 'CONTENT_NOT_FOUND' && retryAttempts < 2) {
          setTimeout(() => {
            setRetryAttempts(prev => prev + 1)
            loadContent()
          }, 1000 * (retryAttempts + 1)) // Exponential backoff: 1s, 2s, 3s
          return
        }
      } else {
        setError('An unexpected error occurred while loading documentation.')
      }
      console.error('Documentation loading error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    setRetryAttempts(0) // Reset retry count for manual retry
    loadContent()
  }

  // Simplified fallback content for missing documentation
  const renderFallbackContent = (section: string, topic?: string) => {
    const currentPath = `${section}${topic ? `/${topic}` : ''}`

    return (
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="text-blue-900 font-semibold mb-2">📖 Documentation Coming Soon</h4>
          <p className="text-blue-800 mb-0">
            The documentation for "{currentPath}" is being prepared. Please check back soon or try the OLED Studio tool.
          </p>
        </div>
        <div className="prose prose-lg max-w-none">
          <h2>Quick Links</h2>
          <ul>
            <li><a href="/oled-studio" className="text-indigo-600 hover:text-indigo-800">Try OLED Studio</a></li>
            <li><a href="/docs/getting-started" className="text-indigo-600 hover:text-indigo-800">Getting Started Guide</a></li>
            <li><a href="/docs/displays" className="text-indigo-600 hover:text-indigo-800">Display Types</a></li>
          </ul>
        </div>
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="prose prose-lg max-w-none">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">
            Loading documentation...
            {retryAttempts > 0 && ` (Retry ${retryAttempts}/2)`}
          </span>
        </div>
      </div>
    )
  }

  // Error state with fallback content
  if (error) {
    const isContentNotFound = error.includes('not found')
    const currentPath = `${section}${topic ? `/${topic}` : ''}`

    return (
      <div className="prose prose-lg max-w-none">
        <div className={`border rounded-lg p-6 ${isContentNotFound ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
          <h3 className={`font-semibold mb-2 ${isContentNotFound ? 'text-yellow-900' : 'text-red-900'}`}>
            {isContentNotFound ? 'Content Coming Soon' : 'Documentation Not Available'}
          </h3>
          <p className={`mb-4 ${isContentNotFound ? 'text-yellow-800' : 'text-red-800'}`}>
            {isContentNotFound
              ? `The documentation for "${currentPath}" is being prepared and will be available soon.`
              : error
            }
          </p>

          {/* Suggested alternatives */}
          <div className="mb-4">
            <h4 className={`font-medium mb-2 ${isContentNotFound ? 'text-yellow-900' : 'text-red-900'}`}>
              Try these alternatives:
            </h4>
            <ul className={`list-disc list-inside space-y-1 ${isContentNotFound ? 'text-yellow-800' : 'text-red-800'}`}>
              <li><a href="/docs/getting-started" className="underline hover:no-underline">Getting Started Guide</a></li>
              <li><a href="/docs/displays" className="underline hover:no-underline">Display Types Overview</a></li>
              <li><a href="/docs/export" className="underline hover:no-underline">Export Formats</a></li>
              <li><a href="/docs/troubleshooting" className="underline hover:no-underline">Troubleshooting Guide</a></li>
            </ul>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleRetry}
              className={`px-4 py-2 rounded transition-colors ${isContentNotFound
                ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                : 'bg-red-600 text-white hover:bg-red-700'
                }`}
            >
              Try Again
            </button>
            <a
              href="/docs/getting-started"
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors no-underline"
            >
              Go to Getting Started
            </a>
            <a
              href="/oled-studio"
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors no-underline"
            >
              Try OLED Studio
            </a>
          </div>
        </div>

        {/* Simplified fallback content */}
        {isContentNotFound && renderFallbackContent(section, topic)}
      </div>
    )
  }

  // Render markdown content
  return <MarkdownRenderer content={content} />

}
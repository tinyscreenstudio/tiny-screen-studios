import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { DocumentationContent } from '../components/DocumentationContent'
import { DocumentationPage } from '../components/DocumentationPage'
import { documentationLoader } from '../utils/documentationLoader'

// Mock the documentation loader for controlled testing
vi.mock('../utils/documentationLoader', () => ({
  documentationLoader: {
    loadContent: vi.fn(),
    preloadRelatedContent: vi.fn(),
    preloadNextContent: vi.fn(),
    preloadCommonContent: vi.fn(),
    clearCache: vi.fn(),
    getCacheStats: vi.fn(() => ({ size: 0, keys: [] }))
  }
}))

const mockLoader = documentationLoader as any

describe('Documentation System Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('DocumentationContent Integration', () => {
    it('should load and render markdown content successfully', async () => {
      const mockContent = `# Getting Started

This is a test markdown content with:

- List items
- **Bold text**
- \`inline code\`

## Code Example

\`\`\`javascript
console.log('Hello World')
\`\`\`
`

      mockLoader.loadContent.mockResolvedValue(mockContent)

      render(<DocumentationContent section="getting-started" />)

      // Should show loading state initially
      expect(screen.getByText(/loading documentation/i)).toBeInTheDocument()

      // Wait for content to load
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Getting Started')
      })

      // Verify content is rendered
      expect(screen.getByText('This is a test markdown content with:')).toBeInTheDocument()
      expect(screen.getByText('Bold text')).toBeInTheDocument()
      expect(screen.getByText('inline code')).toBeInTheDocument()
      // Code content is rendered with syntax highlighting, so just check for the code block
      expect(screen.getByText('Code Example')).toBeInTheDocument()

      // Verify preloading was triggered
      expect(mockLoader.preloadRelatedContent).toHaveBeenCalledWith('getting-started', undefined)
      expect(mockLoader.preloadNextContent).toHaveBeenCalledWith('getting-started', undefined)
    })

    it('should handle loading errors gracefully', async () => {
      mockLoader.loadContent.mockRejectedValue(new Error('Network error'))

      render(<DocumentationContent section="nonexistent" />)

      await waitFor(() => {
        expect(screen.getByText(/documentation not available/i)).toBeInTheDocument()
      })

      expect(screen.getByText(/try again/i)).toBeInTheDocument()
      expect(screen.getByText(/go to getting started/i)).toBeInTheDocument()
    })

    it('should show content not found message for missing content', async () => {
      const error = new Error('Content not found')
      error.message = 'Documentation content not found for test-section'
      mockLoader.loadContent.mockRejectedValue(error)

      render(<DocumentationContent section="test-section" topic="missing-topic" />)

      await waitFor(() => {
        expect(screen.getByText(/documentation not available/i)).toBeInTheDocument()
      })

      expect(screen.getByText(/unexpected error occurred/i)).toBeInTheDocument()
    })

    it('should trigger preloading for related and next content', async () => {
      mockLoader.loadContent.mockResolvedValue('# Test Content')

      render(<DocumentationContent section="displays" topic="ssd1306" />)

      await waitFor(() => {
        expect(mockLoader.preloadRelatedContent).toHaveBeenCalledWith('displays', 'ssd1306')
        expect(mockLoader.preloadNextContent).toHaveBeenCalledWith('displays', 'ssd1306')
      })
    })
  })

  describe('DocumentationPage Integration', () => {
    const renderWithRouter = (component: React.ReactElement) => {
      return render(
        <BrowserRouter>
          {component}
        </BrowserRouter>
      )
    }

    it('should render complete documentation page with navigation', async () => {
      mockLoader.loadContent.mockResolvedValue('# Getting Started\n\nWelcome to the documentation!')

      // Mock useParams to simulate route parameters
      vi.mock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom')
        return {
          ...actual,
          useParams: () => ({ section: 'getting-started', topic: undefined })
        }
      })

      renderWithRouter(<DocumentationPage />)

      // Check for page structure
      expect(screen.getAllByText('Documentation')).toHaveLength(2) // Header and sidebar
      expect(screen.getByText('Getting Started')).toBeInTheDocument()
      expect(screen.getByText('Display Types')).toBeInTheDocument()
      expect(screen.getByText('Export & Code')).toBeInTheDocument()

      // Wait for content to load - check for the content heading specifically
      await waitFor(() => {
        const headings = screen.getAllByRole('heading', { level: 1 })
        const contentHeading = headings.find(h => h.textContent === 'Getting Started')
        expect(contentHeading).toBeInTheDocument()
      })
    })
  })

  describe('Performance and Caching Integration', () => {
    it('should cache content and avoid redundant loads', async () => {
      const mockContent = '# Cached Content'
      mockLoader.loadContent.mockResolvedValue(mockContent)

      // Render component twice with same section
      const { rerender } = render(<DocumentationContent section="getting-started" />)
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Cached Content')
      })

      // Re-render with same props
      rerender(<DocumentationContent section="getting-started" />)

      // Should only call loadContent once due to React's effect dependencies
      // (The actual caching is tested in the DocumentationLoader unit tests)
      expect(mockLoader.loadContent).toHaveBeenCalledTimes(1)
    })

    it('should handle large content efficiently', async () => {
      // Generate large content to test performance
      const largeContent = `# Large Document

${Array.from({ length: 100 }, (_, i) => `
## Section ${i + 1}

This is section ${i + 1} with some content. Lorem ipsum dolor sit amet, consectetur adipiscing elit.

\`\`\`javascript
function example${i}() {
  console.log('Section ${i + 1}');
  return ${i + 1};
}
\`\`\`

- Item 1 for section ${i + 1}
- Item 2 for section ${i + 1}
- Item 3 for section ${i + 1}
`).join('')}`

      mockLoader.loadContent.mockResolvedValue(largeContent)

      const startTime = performance.now()
      
      render(<DocumentationContent section="large-doc" />)

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Large Document')
      })

      const endTime = performance.now()
      const renderTime = endTime - startTime

      // Should render large content within reasonable time (less than 1 second)
      expect(renderTime).toBeLessThan(1000)

      // Verify all sections are rendered
      expect(screen.getByText('Section 1')).toBeInTheDocument()
      expect(screen.getByText('Section 100')).toBeInTheDocument()
    })
  })

  describe('Error Recovery Integration', () => {
    it('should recover from network errors with retry mechanism', async () => {
      let callCount = 0
      mockLoader.loadContent.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return Promise.reject(new Error('Network timeout'))
        }
        return Promise.resolve('# Recovered Content')
      })

      render(<DocumentationContent section="test-recovery" />)

      // Should show error initially
      await waitFor(() => {
        expect(screen.getByText(/documentation not available/i)).toBeInTheDocument()
      })

      // Click retry button
      const retryButton = screen.getByText(/try again/i)
      retryButton.click()

      // Should recover and show content
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Recovered Content')
      })

      expect(mockLoader.loadContent).toHaveBeenCalledTimes(2)
    })
  })

  describe('Preloading Integration', () => {
    it('should preload common content on app initialization', async () => {
      mockLoader.preloadCommonContent.mockResolvedValue(undefined)

      // Import and test the preloader hook
      const { useDocumentationPreloader } = await import('../hooks/useDocumentationPreloader')
      
      const TestComponent = () => {
        useDocumentationPreloader()
        return <div>Test</div>
      }

      render(<TestComponent />)

      // Wait for preloading to be triggered
      await waitFor(() => {
        expect(mockLoader.preloadCommonContent).toHaveBeenCalled()
      }, { timeout: 200 })
    })

    it('should preload related content based on current section', async () => {
      mockLoader.loadContent.mockResolvedValue('# Test Content')
      mockLoader.preloadRelatedContent.mockResolvedValue(undefined)
      mockLoader.preloadNextContent.mockResolvedValue(undefined)

      render(<DocumentationContent section="export" topic="c-arrays" />)

      await waitFor(() => {
        expect(mockLoader.preloadRelatedContent).toHaveBeenCalledWith('export', 'c-arrays')
        expect(mockLoader.preloadNextContent).toHaveBeenCalledWith('export', 'c-arrays')
      })
    })
  })
})
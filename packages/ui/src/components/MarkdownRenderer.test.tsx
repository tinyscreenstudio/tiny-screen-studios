import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MarkdownRenderer } from './MarkdownRenderer'

describe('MarkdownRenderer', () => {
  it('renders basic markdown content', () => {
    const content = '# Hello World\n\nThis is a test paragraph.'
    render(<MarkdownRenderer content={content} />)
    
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Hello World')
    expect(screen.getByText('This is a test paragraph.')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const content = '# Test'
    const { container } = render(<MarkdownRenderer content={content} className="custom-class" />)
    
    expect(container.firstChild).toHaveClass('prose', 'prose-lg', 'max-w-none', 'custom-class')
  })

  it('renders headings with correct styling', () => {
    const content = `
# Heading 1
## Heading 2  
### Heading 3
#### Heading 4
`
    render(<MarkdownRenderer content={content} />)
    
    const h1 = screen.getByRole('heading', { level: 1 })
    const h2 = screen.getByRole('heading', { level: 2 })
    const h3 = screen.getByRole('heading', { level: 3 })
    const h4 = screen.getByRole('heading', { level: 4 })
    
    expect(h1).toHaveClass('text-3xl', 'font-bold', 'text-gray-900', 'mb-6')
    expect(h2).toHaveClass('text-2xl', 'font-semibold', 'text-gray-900', 'mt-8', 'mb-4')
    expect(h3).toHaveClass('text-xl', 'font-semibold', 'text-gray-900', 'mt-6', 'mb-3')
    expect(h4).toHaveClass('text-lg', 'font-semibold', 'text-gray-900', 'mt-4', 'mb-2')
  })

  it('renders lists with correct styling', () => {
    const content = `
- Item 1
- Item 2

1. Numbered item 1
2. Numbered item 2
`
    render(<MarkdownRenderer content={content} />)
    
    const lists = screen.getAllByRole('list')
    const unorderedList = lists[0]
    const orderedList = lists[1]
    
    expect(unorderedList).toHaveClass('list-disc', 'list-inside', 'mb-4', 'space-y-2', 'text-gray-700')
    expect(orderedList).toHaveClass('list-decimal', 'list-inside', 'mb-4', 'space-y-2', 'text-gray-700')
  })

  it('renders inline code with correct styling', () => {
    const content = 'This is `inline code` in a sentence.'
    render(<MarkdownRenderer content={content} />)
    
    const inlineCode = screen.getByText('inline code')
    expect(inlineCode).toHaveClass('font-mono', 'text-sm')
  })

  it('renders code blocks with syntax highlighting', () => {
    const content = `
\`\`\`javascript
function hello() {
  console.log("Hello World");
}
\`\`\`
`
    render(<MarkdownRenderer content={content} />)
    
    const codeBlock = screen.getByText('function')
    expect(codeBlock.closest('pre')).toHaveClass('bg-gray-100', 'rounded-lg', 'p-4', 'overflow-x-auto', 'my-4', 'font-mono', 'text-sm')
    expect(codeBlock).toHaveClass('hljs-keyword')
  })

  it('renders links with correct styling and attributes', () => {
    const content = `
[Internal link](/docs/test)
[External link](https://example.com)
`
    render(<MarkdownRenderer content={content} />)
    
    const internalLink = screen.getByText('Internal link')
    const externalLink = screen.getByText('External link')
    
    expect(internalLink).toHaveClass('text-indigo-600', 'hover:text-indigo-800', 'underline')
    expect(internalLink).not.toHaveAttribute('target')
    
    expect(externalLink).toHaveClass('text-indigo-600', 'hover:text-indigo-800', 'underline')
    expect(externalLink).toHaveAttribute('target', '_blank')
    expect(externalLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('renders blockquotes with correct styling', () => {
    const content = '> This is a blockquote'
    render(<MarkdownRenderer content={content} />)
    
    const blockquote = screen.getByText('This is a blockquote').closest('blockquote')
    expect(blockquote).toHaveClass('border-l-4', 'border-blue-500', 'pl-4', 'py-2', 'my-4', 'bg-blue-50', 'text-blue-900', 'italic')
  })

  it('renders tables with correct styling', () => {
    const content = `
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
`
    render(<MarkdownRenderer content={content} />)
    
    const table = screen.getByRole('table')
    const tableContainer = table.closest('div')
    
    expect(tableContainer).toHaveClass('overflow-x-auto', 'my-6')
    expect(table).toHaveClass('min-w-full', 'border', 'border-gray-200', 'rounded-lg')
  })

  it('renders strong and emphasis text with correct styling', () => {
    const content = 'This is **bold** and *italic* text.'
    render(<MarkdownRenderer content={content} />)
    
    const boldText = screen.getByText('bold')
    const italicText = screen.getByText('italic')
    
    expect(boldText).toHaveClass('font-semibold', 'text-gray-900')
    expect(italicText).toHaveClass('italic', 'text-gray-700')
  })

  it('handles empty content gracefully', () => {
    const { container } = render(<MarkdownRenderer content="" />)
    expect(container.firstChild).toHaveClass('prose', 'prose-lg', 'max-w-none')
  })

  it('handles malformed markdown gracefully', () => {
    const content = '# Incomplete heading\n\n[Broken link]('
    render(<MarkdownRenderer content={content} />)
    
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Incomplete heading')
    expect(screen.getByText('[Broken link](')).toBeInTheDocument()
  })
})
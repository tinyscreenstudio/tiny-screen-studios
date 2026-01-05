import React, { useState } from 'react'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  HandThumbUpIcon,
  ArrowDownTrayIcon,
  TagIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline'

// Extended mock data for marketplace
const MARKETPLACE_ITEMS = [
  {
    id: 1,
    title: 'Cyberpunk Cityscape',
    description: 'Detailed 1-bit cityscape with neon signs and flying cars. Perfect for retro gaming displays.',
    author: 'pixel_prophet',
    price: '$3.99',
    likes: 342,
    downloads: 89,
    resolution: '128x64',
    tags: ['cyberpunk', 'cityscape', 'detailed'],
    preview: `████████████████████████████████
██  ██    ██  ████    ██  ████
██  ██    ██  ████    ██  ████
████████████████████████████████`,
    format: 'SSD1306',
    category: 'Landscapes'
  },
  {
    id: 2,
    title: 'Minimalist Weather Icons',
    description: 'Clean 1-bit weather icon set. Sun, rain, clouds, snow - all optimized for tiny displays.',
    author: 'mono_designer',
    price: '$1.99',
    likes: 156,
    downloads: 234,
    resolution: '32x32',
    tags: ['icons', 'weather', 'minimal'],
    preview: `    ████████    
  ██        ██  
██            ██
██     ██     ██
██            ██
  ██        ██  
    ████████    `,
    format: 'Universal',
    category: 'Icons'
  },
  {
    id: 3,
    title: 'Retro Space Invaders',
    description: 'Classic arcade sprites in perfect 1-bit format. Includes ships, aliens, and explosions.',
    author: 'arcade_master',
    price: '$2.49',
    likes: 445,
    downloads: 167,
    resolution: '128x32',
    tags: ['gaming', 'sprites', 'arcade'],
    preview: `  ██    ██    ██    ██  
    ████████████████    
  ██████████████████  
██████████████████████`,
    format: 'SH1106',
    category: 'Gaming'
  },
  {
    id: 4,
    title: 'Dithered Portrait Pack',
    description: 'Professional portrait dithering techniques. 12 different faces with various expressions.',
    author: 'dither_artist',
    price: '$4.99',
    likes: 278,
    downloads: 45,
    resolution: '132x64',
    tags: ['portraits', 'dithering', 'faces'],
    preview: `  ████████████████  
██  ██      ██  ██
██    ██████    ██
██              ██
██    ██████    ██
██  ██      ██  ██
  ████████████████  `,
    format: 'SH1107',
    category: 'Portraits'
  },
  {
    id: 5,
    title: 'Geometric Patterns',
    description: 'Abstract 1-bit geometric designs. Perfect for backgrounds and decorative elements.',
    author: 'pattern_lab',
    price: '$1.49',
    likes: 89,
    downloads: 312,
    resolution: '128x64',
    tags: ['abstract', 'patterns', 'geometric'],
    preview: `██  ██  ██  ██  ██  ██
  ██  ██  ██  ██  ██  
██  ██  ██  ██  ██  ██
  ██  ██  ██  ██  ██  
██  ██  ██  ██  ██  ██`,
    format: 'SSD1306',
    category: 'Patterns'
  },
  {
    id: 6,
    title: 'Pixel Art Animals',
    description: 'Cute 1-bit animal collection. Cats, dogs, birds, and more in perfect monochrome style.',
    author: 'creature_pixels',
    price: '$2.99',
    likes: 523,
    downloads: 198,
    resolution: '64x64',
    tags: ['animals', 'cute', 'characters'],
    preview: `    ████████    
  ██        ██  
██  ██    ██  ██
██            ██
██  ████████  ██
  ██        ██  
    ████████    `,
    format: 'Universal',
    category: 'Characters'
  }
]

const CATEGORIES = ['All', 'Icons', 'Gaming', 'Portraits', 'Patterns', 'Characters', 'Landscapes']
const RESOLUTIONS = ['All', '128x64', '128x32', '132x64', '64x64', '32x32']
const FORMATS = ['All', 'SSD1306', 'SH1106', 'SH1107', 'Universal']

export function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedResolution, setSelectedResolution] = useState('All')
  const [selectedFormat, setSelectedFormat] = useState('All')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('popular')

  const filteredItems = MARKETPLACE_ITEMS.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory
    const matchesResolution = selectedResolution === 'All' || item.resolution === selectedResolution
    const matchesFormat = selectedFormat === 'All' || item.format === selectedFormat

    return matchesSearch && matchesCategory && matchesResolution && matchesFormat
  })

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/5 via-purple-500/5 to-blue-500/5 border-b border-border">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <CpuChipIcon className="w-8 h-8 text-primary" />
              <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                15,000+ Art Pieces Available
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-primary to-purple-600 bg-clip-text text-transparent">
              1-bit Art Marketplace
            </h1>
            <p className="text-xl text-text-muted mb-8 max-w-2xl mx-auto leading-relaxed">
              Discover premium monochrome pixel art designed for 128x32, 128x64, and 132x64 displays. 
              Perfect for SSD1306, SH1106, and embedded projects.
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">2.5k+</div>
                <div className="text-sm text-text-muted">Artists</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">15k+</div>
                <div className="text-sm text-text-muted">Artworks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">50k+</div>
                <div className="text-sm text-text-muted">Downloads</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">$180k+</div>
                <div className="text-sm text-text-muted">Paid Out</div>
              </div>
            </div>

            {/* Popular Display Formats */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="text-sm text-text-muted">Popular formats:</span>
              {['SSD1306', 'SH1106', 'SH1107', '128x64', '128x32', '132x64'].map((format) => (
                <span
                  key={format}
                  className="px-3 py-1.5 bg-white border border-border rounded-full text-sm font-medium text-text hover:border-primary/50 transition-colors"
                >
                  {format}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-xl border border-border p-6 mb-8">
          {/* Search Bar */}
          <div className="relative mb-6">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              placeholder="Search artwork, artists, tags..."
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary-light outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-text mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary-light outline-none"
              >
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">Resolution</label>
              <select
                value={selectedResolution}
                onChange={(e) => setSelectedResolution(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary-light outline-none"
              >
                {RESOLUTIONS.map(resolution => (
                  <option key={resolution} value={resolution}>{resolution}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">Display Format</label>
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary-light outline-none"
              >
                {FORMATS.map(format => (
                  <option key={format} value={format}>{format}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary-light outline-none"
              >
                <option value="popular">Most Popular</option>
                <option value="recent">Recently Added</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="downloads">Most Downloaded</option>
              </select>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FunnelIcon className="w-4 h-4 text-text-muted" />
              <span className="text-sm text-text-muted">
                {filteredItems.length} results
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-primary text-white' : 'bg-gray-100 text-text-muted hover:bg-gray-200'
                }`}
              >
                <Squares2X2Icon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-primary text-white' : 'bg-gray-100 text-text-muted hover:bg-gray-200'
                }`}
              >
                <ListBulletIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`group bg-white border border-border rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 hover:border-primary/50 cursor-pointer ${
                viewMode === 'list' ? 'flex' : ''
              }`}
            >
              {/* Art Preview */}
              <div className={`bg-black flex items-center justify-center relative group-hover:bg-gray-900 transition-colors ${
                viewMode === 'list' ? 'w-48 h-32' : 'h-32'
              }`}>
                <pre className="text-xs font-mono text-green-400 leading-none opacity-90 text-center p-4">
                  {item.preview}
                </pre>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="bg-white text-black text-xs font-bold px-2 py-1 rounded shadow-lg hover:bg-gray-100">
                    Preview
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className={`p-5 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors mb-1">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-text-muted mb-2">
                      <CpuChipIcon className="w-3 h-3" />
                      <span>{item.resolution}</span>
                      <span>•</span>
                      <span>{item.format}</span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-lg font-bold text-primary">{item.price}</p>
                  </div>
                </div>

                <p className="text-text-muted text-sm mb-4 line-clamp-2">
                  {item.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {item.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-xs px-2 py-1 bg-bg-secondary rounded text-text-muted flex items-center gap-1">
                      <TagIcon className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-text-muted pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-bold text-[8px]">
                      {item.author[0].toUpperCase()}
                    </div>
                    <span className="font-medium text-text-primary">{item.author}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <HandThumbUpIcon className="w-3 h-3" /> {item.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <ArrowDownTrayIcon className="w-3 h-3" /> {item.downloads}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <MagnifyingGlassIcon className="w-8 h-8 text-text-muted" />
            </div>
            <h3 className="text-lg font-semibold text-text mb-2">No results found</h3>
            <p className="text-text-muted">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
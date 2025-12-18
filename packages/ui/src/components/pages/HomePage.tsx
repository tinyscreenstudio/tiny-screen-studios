import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MagnifyingGlassIcon,
  ArrowRightIcon,
  SparklesIcon,
  CommandLineIcon,
  CpuChipIcon,
  ClockIcon,
  HandThumbUpIcon,
  ChatBubbleLeftIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

// Mock data for featured items
const FEATURED_ITEMS = [
  {
    id: 1,
    title: 'SSD1306 Boot Animation',
    description: 'Smooth startup sequence for 128x64 OLED displays. Includes fade-in effect and logo reveal.',
    author: 'embedded_pro',
    likes: 128,
    comments: 12,
    views: '1.2k',
    tags: ['animation', 'boot', 'ssd1306'],
    code: `const unsigned char boot_anim[] PROGMEM = {
  0x00, 0x00, 0x00, 0x00, 0x00...
};`
  },
  {
    id: 2,
    title: 'Weather Icons 16x16',
    description: 'Minimalist weather icon set optimized for small screens. Sun, rain, cloud, and snow.',
    author: 'pixel_artist',
    likes: 85,
    comments: 8,
    views: '850',
    tags: ['icons', 'weather', '16x16'],
    code: `// Sun Icon 16x16
0x00, 0x18, 0x24, 0x42, 0x81...`
  },
  {
    id: 3,
    title: 'Retro Gaming UI Kit',
    description: 'Complete UI kit for handheld gaming projects. Health bars, inventory slots, and text boxes.',
    author: 'game_dev',
    likes: 256,
    comments: 34,
    views: '2.5k',
    tags: ['ui', 'gaming', 'retro'],
    code: `void drawHealthBar(int hp) {
  display.drawRect(0, 0, 64, 8...
}`
  },
  {
    id: 4,
    title: 'I2C Scanner Utility',
    description: 'Quickly identify connected I2C devices on your microcontroller. Essential for debugging.',
    author: 'hardware_hacker',
    likes: 190,
    comments: 21,
    views: '3.1k',
    tags: ['utility', 'i2c', 'debug'],
    code: `void scanI2C() {
  byte error, address;
  int nDevices = 0;
  ...`
  },
  {
    id: 5,
    title: 'Glitch Effect Font',
    description: 'Cyberpunk style bitmap font with built-in glitch artifacts. Perfect for sci-fi themes.',
    author: 'cyber_junkie',
    likes: 112,
    comments: 15,
    views: '900',
    tags: ['font', 'glitch', 'cyberpunk'],
    code: `const uint8_t font_glitch[] = {
  // 'A'
  0x1F, 0x24, 0x44, 0x24, 0x1F...`
  },
  {
    id: 6,
    title: 'Battery Status Indicator',
    description: '5-level battery indicator with charging animation frames.',
    author: 'power_user',
    likes: 76,
    comments: 5,
    views: '600',
    tags: ['ui', 'battery', 'system'],
    code: `// Charging Frame 1
0xFF, 0x81, 0x81, 0x81, 0xFF...`
  }
]

export function HomePage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')



  return (
    <div className="min-h-screen bg-bg text-text-primary font-sans">
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6 border-b border-border bg-bg-secondary/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
            The Design Platform for <br />
            <span className="text-primary">Embedded Displays</span>
          </h1>
          <p className="text-lg md:text-xl text-text-muted mb-10 max-w-2xl mx-auto leading-relaxed">
            Share, discover, and collect pixel art and code snippets for your embedded projects.
            Free and open source — built for makers and developers.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button
              onClick={() => navigate('/oled-studio')}
              className="btn btn-primary px-8 py-3 text-lg rounded-lg font-medium flex items-center gap-2"
            >
              Start Creating <ArrowRightIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/docs')}
              className="btn btn-secondary px-8 py-3 text-lg rounded-lg font-medium bg-white border border-border hover:bg-gray-50 text-text-primary"
            >
              Documentation
            </button>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="w-5 h-5 text-text-muted" />
            </div>
            <input
              type="text"
              placeholder="Search for icons, fonts, animations..."
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Quick Tags */}
          <div className="mt-6 flex flex-wrap justify-center gap-2 text-sm text-text-muted">
            <span>Popular:</span>
            {['SSD1306', 'Fonts', 'Icons', 'Animations', 'Gaming', 'UI Kits'].map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-bg-secondary rounded-md cursor-pointer hover:text-primary hover:bg-primary/10 transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <SparklesIcon className="w-6 h-6 text-yellow-500" />
                Featured Resources
              </h2>
              <p className="text-text-muted mt-1">Hand-picked high quality assets for your next project</p>
            </div>
            <button className="text-primary font-medium hover:underline flex items-center gap-1">
              Browse all <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURED_ITEMS.map((item) => (
              <div
                key={item.id}
                className="group bg-white border border-border rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 hover:border-primary/50"
              >
                {/* Code Preview Header */}
                <div className="bg-gray-50 border-b border-border p-4 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-xs text-text-muted font-mono">
                    <CommandLineIcon className="w-4 h-4" />
                    cpp
                  </div>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-400"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  </div>
                </div>

                {/* Code Snippet */}
                <div className="bg-gray-900 p-4 overflow-hidden h-32 relative group-hover:bg-gray-800 transition-colors">
                  <pre className="text-xs font-mono text-gray-300 leading-relaxed opacity-80">
                    {item.code}
                  </pre>
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-60"></div>
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="bg-white text-black text-xs font-bold px-3 py-1.5 rounded shadow-lg hover:bg-gray-100">
                      Copy
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                  </div>

                  <p className="text-text-muted text-sm line-clamp-2 mb-4 h-10">
                    {item.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.tags.map(tag => (
                      <span key={tag} className="text-xs px-2 py-1 bg-bg-secondary rounded text-text-muted">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-text-muted pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-bold text-[10px]">
                        {(item.author && item.author[0]) ? item.author[0].toUpperCase() : '?'}
                      </div>
                      <span className="font-medium text-text-primary">{item.author}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 hover:text-text-primary transition-colors cursor-pointer">
                        <HandThumbUpIcon className="w-3.5 h-3.5" /> {item.likes}
                      </span>
                      <span className="flex items-center gap-1 hover:text-text-primary transition-colors cursor-pointer">
                        <ChatBubbleLeftIcon className="w-3.5 h-3.5" /> {item.comments}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recently Updated Section */}
      <section className="py-16 px-6 bg-bg-secondary/30 border-t border-border">
        <div className="container mx-auto max-w-7xl">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <ClockIcon className="w-6 h-6 text-primary" />
                Recently Updated
              </h2>
              <p className="text-text-muted mt-1">Fresh content from the community</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Reusing featured items for demo purposes, reversed */}
            {[...FEATURED_ITEMS].reverse().slice(0, 3).map((item) => (
              <div
                key={`recent-${item.id}`}
                className="bg-white border border-border rounded-xl p-5 hover:border-primary/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <CpuChipIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-xs text-text-muted">Updated 2 hours ago</p>
                  </div>
                </div>
                <p className="text-sm text-text-muted mb-4 line-clamp-2">
                  {item.description}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="bg-bg-secondary px-2 py-1 rounded text-text-muted">
                    v1.2.0
                  </span>
                  <div className="flex items-center gap-4 text-text-muted">
                    <span className="flex items-center gap-1">
                      <EyeIcon className="w-3.5 h-3.5" /> {item.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <HandThumbUpIcon className="w-3.5 h-3.5" /> {item.likes}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
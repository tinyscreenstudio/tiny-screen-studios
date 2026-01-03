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
  EyeIcon,
  TrophyIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  HeartIcon,
  StarIcon,
  UserGroupIcon,
  CodeBracketIcon
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
      <section className="pt-32 pb-24 bg-bg" style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)', marginRight: 'calc(-50vw + 50%)' }}>
        <div className="mx-auto w-full px-6" style={{ width: '100%', maxWidth: '1400px' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left Column: Heading and Description */}
            <div className="text-left">
              <h1 className="text-4xl md:text-4xl lg:text-6xl font-bold mb-5 tracking-tight text-text leading-[1.1]">
                Design assets for <br />
                <span className="text-primary">tiny displays.</span>
              </h1>
              <p className="text-base md:text-lg text-text max-w-xl leading-relaxed font-normal">
                Create, preview, and export pixel art, fonts, icons, and animations for SSD1306, SH1106, and more. Grab the code snippet and ship it.
              </p>
            </div>

            {/* Right Column: Buttons, Search, and Tags */}
            <div className="flex flex-col items-start w-full lg:pt-1">
              <div className="flex flex-col sm:flex-row gap-3 mb-8 w-full">
                <button
                  onClick={() => navigate('/oled-studio')}
                  className="bg-primary text-white px-6 py-3 text-base rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-primary-hover transition-colors shadow-sm whitespace-nowrap h-11"
                >
                  Start creating <ArrowRightIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate('/docs')}
                  className="bg-white text-text px-6 py-3 text-base rounded-lg font-medium border border-border hover:bg-gray-50 transition-colors shadow-sm whitespace-nowrap h-11"
                >
                  Browse library
                </button>
              </div>

              {/* Search Bar */}
              <div className="w-full relative mb-6">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="w-4 h-4 text-text-muted" />
                </div>
                <input
                  type="text"
                  placeholder="Search icons, fonts, animations, templates…"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary-light outline-none transition-all shadow-sm text-sm bg-white h-11"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Popular Tags */}
              <div className="flex flex-wrap items-center gap-2.5 text-sm">
                <span className="font-normal text-text mr-1">Popular:</span>
                {['SSD1306', 'SH1106', 'Icons', 'Animations', 'UI Kits'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearchQuery(tag)}
                    className="px-3 py-1.5 rounded-full border border-border bg-white hover:text-primary hover:border-primary/50 transition-colors cursor-pointer text-text text-sm font-normal"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements/Statistics Section */}
      <section className="py-16 bg-white border-t border-border" style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)', marginRight: 'calc(-50vw + 50%)' }}>
        <div className="mx-auto w-full px-6" style={{ width: '100%', maxWidth: '1400px' }}>
          {/* Row 1: Achievements and References */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-6">
            <div className="flex items-center gap-2 text-text">
              <TrophyIcon className="w-5 h-5 text-yellow-500" />
              <span className="text-sm">Featured in <strong>Forbes</strong></span>
            </div>
            <div className="flex items-center gap-2 text-text">
              <AcademicCapIcon className="w-5 h-5 text-red-500" />
              <span className="text-sm">Referenced by <strong>Harvard University</strong></span>
            </div>
            <div className="flex items-center gap-2 text-text">
              <AcademicCapIcon className="w-5 h-5 text-blue-400" />
              <span className="text-sm">Referenced by <strong>Columbia University</strong></span>
            </div>
            <div className="flex items-center gap-2 text-text">
              <AcademicCapIcon className="w-5 h-5 text-blue-600" />
              <span className="text-sm">Referenced by <strong>Olympic College</strong></span>
            </div>
            <div className="flex items-center gap-2 text-text">
              <DocumentTextIcon className="w-5 h-5 text-red-500" />
              <span className="text-sm">Cited in <strong>arXiv Paper</strong></span>
            </div>
          </div>

          {/* Row 2: Statistics and Platform Recognition */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-6">
            <div className="flex items-center gap-2 text-text">
              <HeartIcon className="w-5 h-5 text-red-500" />
              <span className="text-sm">#1 Most Liked Dataset on <strong>Hugging Face</strong></span>
            </div>
            <div className="flex items-center gap-2 text-text">
              <StarIcon className="w-5 h-5 text-yellow-500" />
              <span className="text-sm"><strong>141k GitHub Stars</strong></span>
            </div>
            <div className="flex items-center gap-2 text-text">
              <TrophyIcon className="w-5 h-5 text-purple-500" />
              <span className="text-sm">#33 Most Starred Repo in the World</span>
            </div>
            <div className="flex items-center gap-2 text-text">
              <UserGroupIcon className="w-5 h-5 text-green-500" />
              <span className="text-sm">Used by Thousands Daily</span>
            </div>
            <div className="flex items-center gap-2 text-text">
              <SparklesIcon className="w-5 h-5 text-purple-500" />
              <span className="text-sm"><strong>GitHub Staff Pick</strong></span>
            </div>
          </div>

          {/* Row 3: Product Information */}
          <div className="flex flex-wrap items-center justify-center gap-6">
            <div className="flex items-center gap-2 text-text">
              <CodeBracketIcon className="w-5 h-5 text-blue-400" />
              <span className="text-sm">&lt;&gt; The Only 100% <strong>Free & Open Source Prompt Library</strong></span>
            </div>
            <div className="flex items-center gap-2 text-text">
              <SparklesIcon className="w-5 h-5 text-orange-500" />
              <span className="text-sm"><strong>The First-Ever Prompts Library</strong> · Released on Dec 5, 2022</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-24 px-6">
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
      <section className="py-24 px-6 bg-bg-secondary/30 border-t border-border">
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
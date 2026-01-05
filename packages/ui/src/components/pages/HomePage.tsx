import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MagnifyingGlassIcon,
  ArrowRightIcon,
  SparklesIcon,
  CpuChipIcon,
  ClockIcon,
  HandThumbUpIcon,
  EyeIcon,
  TrophyIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  HeartIcon,
  StarIcon,
  UserGroupIcon,
  CodeBracketIcon,
  CurrencyDollarIcon,
  ArrowDownTrayIcon,
  TagIcon
} from '@heroicons/react/24/outline'

import { ARTWORKS } from '../../data/artworks'

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
                1-bit art marketplace for <br />
                <span className="text-primary">tiny displays.</span>
              </h1>
              <p className="text-base md:text-lg text-text max-w-xl leading-relaxed font-normal">
                Discover, buy, and sell monochrome pixel art designed for 128x32, 128x64, and 132x64 displays. Perfect for SSD1306, SH1106, and embedded projects.
              </p>
            </div>

            {/* Right Column: Buttons, Search, and Tags */}
            <div className="flex flex-col items-start w-full lg:pt-1">
              <div className="flex flex-col sm:flex-row gap-3 mb-8 w-full">
                <button
                  onClick={() => navigate('/marketplace')}
                  className="bg-primary text-white px-6 py-3 text-base rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-primary-hover transition-colors shadow-sm whitespace-nowrap h-11"
                >
                  Browse marketplace <ArrowRightIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate('/sell')}
                  className="bg-white text-text px-6 py-3 text-base rounded-lg font-medium border border-border hover:bg-gray-50 transition-colors shadow-sm whitespace-nowrap h-11"
                >
                  Sell your art
                </button>
              </div>

              {/* Search Bar */}
              <div className="w-full relative mb-6">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="w-4 h-4 text-text-muted" />
                </div>
                <input
                  type="text"
                  placeholder="Search 1-bit art, icons, patterns, sprites…"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary-light outline-none transition-all shadow-sm text-sm bg-white h-11"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Popular Tags */}
              <div className="flex flex-wrap items-center gap-2.5 text-sm">
                <span className="font-normal text-text mr-1">Popular:</span>
                {['128x64', '128x32', '132x64', 'Portraits', 'Gaming', 'Icons'].map((tag) => (
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
              <span className="text-sm">Featured in <strong>Maker Magazine</strong></span>
            </div>
            <div className="flex items-center gap-2 text-text">
              <AcademicCapIcon className="w-5 h-5 text-red-500" />
              <span className="text-sm">Used by <strong>MIT Embedded Systems Course</strong></span>
            </div>
            <div className="flex items-center gap-2 text-text">
              <AcademicCapIcon className="w-5 h-5 text-blue-400" />
              <span className="text-sm">Recommended by <strong>Arduino Community</strong></span>
            </div>
            <div className="flex items-center gap-2 text-text">
              <DocumentTextIcon className="w-5 h-5 text-red-500" />
              <span className="text-sm">Cited in <strong>Embedded Design Papers</strong></span>
            </div>
          </div>

          {/* Row 2: Statistics and Platform Recognition */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-6">
            <div className="flex items-center gap-2 text-text">
              <HeartIcon className="w-5 h-5 text-red-500" />
              <span className="text-sm"><strong>2,500+</strong> Artists Selling</span>
            </div>
            <div className="flex items-center gap-2 text-text">
              <StarIcon className="w-5 h-5 text-yellow-500" />
              <span className="text-sm"><strong>15k+</strong> Art Pieces Available</span>
            </div>
            <div className="flex items-center gap-2 text-text">
              <UserGroupIcon className="w-5 h-5 text-green-500" />
              <span className="text-sm"><strong>50k+</strong> Developers Using Daily</span>
            </div>
            <div className="flex items-center gap-2 text-text">
              <CurrencyDollarIcon className="w-5 h-5 text-purple-500" />
              <span className="text-sm"><strong>$180k+</strong> Paid to Artists</span>
            </div>
          </div>

          {/* Row 3: Product Information */}
          <div className="flex flex-wrap items-center justify-center gap-6">
            <div className="flex items-center gap-2 text-text">
              <CodeBracketIcon className="w-5 h-5 text-blue-400" />
              <span className="text-sm">Ready-to-use <strong>C/C++ Arrays & Code</strong></span>
            </div>
            <div className="flex items-center gap-2 text-text">
              <CpuChipIcon className="w-5 h-5 text-orange-500" />
              <span className="text-sm">Optimized for <strong>SSD1306, SH1106, SH1107</strong> displays</span>
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
                Featured Artwork
              </h2>
              <p className="text-text-muted mt-1">Hand-picked 1-bit art from our top creators</p>
            </div>
            <button className="text-primary font-medium hover:underline flex items-center gap-1">
              Browse all <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ARTWORKS.map((item) => (
              <div
                key={item.id}
                className="group bg-white border border-border rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 hover:border-primary/50 cursor-pointer"
              >
                {/* Art Preview Header */}
                <div className="bg-gray-50 border-b border-border p-4 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <CpuChipIcon className="w-4 h-4" />
                    <span className="font-mono">{item.resolution}</span>
                    <span className="text-text-muted">•</span>
                    <span>{item.format}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-primary">{item.price}</span>
                  </div>
                </div>

                {/* 1-bit Art Preview */}
                <div className="bg-black p-6 flex items-center justify-center h-32 relative group-hover:bg-gray-900 transition-colors">
                  <pre className="text-xs font-mono text-green-400 leading-none opacity-90 text-center">
                    {item.preview}
                  </pre>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="bg-white text-black text-xs font-bold px-3 py-1.5 rounded shadow-lg hover:bg-gray-100 flex items-center gap-1">
                      <EyeIcon className="w-3 h-3" />
                      Preview
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
                    {item.tags.map((tag: string) => (
                      <span key={tag} className="text-xs px-2 py-1 bg-bg-secondary rounded text-text-muted flex items-center gap-1">
                        <TagIcon className="w-3 h-3" />
                        {tag}
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
                        <ArrowDownTrayIcon className="w-3.5 h-3.5" /> {item.downloads}
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
                New Releases
              </h2>
              <p className="text-text-muted mt-1">Latest 1-bit art from our community</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...ARTWORKS].reverse().slice(0, 3).map((item) => (
              <div
                key={`recent-${item.id}`}
                className="bg-white border border-border rounded-xl p-5 hover:border-primary/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <CpuChipIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-xs text-text-muted">Released 2 hours ago</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary">{item.price}</p>
                    <p className="text-xs text-text-muted">{item.resolution}</p>
                  </div>
                </div>
                <p className="text-sm text-text-muted mb-4 line-clamp-2">
                  {item.description}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="bg-bg-secondary px-2 py-1 rounded text-text-muted">
                      {item.format}
                    </span>
                    <span className="text-text-muted">by {item.author}</span>
                  </div>
                  <div className="flex items-center gap-4 text-text-muted">
                    <span className="flex items-center gap-1">
                      <HandThumbUpIcon className="w-3.5 h-3.5" /> {item.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <ArrowDownTrayIcon className="w-3.5 h-3.5" /> {item.downloads}
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
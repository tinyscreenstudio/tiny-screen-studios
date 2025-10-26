import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CpuChipIcon,
  PhotoIcon,
  CodeBracketIcon,
  ArrowRightIcon,
  BoltIcon,
  CubeIcon
} from '@heroicons/react/24/outline'

export function HomePage() {
  const navigate = useNavigate()

  const handleNavigateToPreview = () => {
    navigate('/oled-studio')
  }
  return (
    <div className="min-h-screen">
      {/* Hero Section - OLED Aesthetic */}
      <section className="relative overflow-hidden rounded-3xl mb-8 bg-circuit" style={{
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

        {/* Simple glowing pixels */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-2 h-2 animate-pulse" style={{ backgroundColor: 'var(--color-primary)' }}></div>
          <div className="absolute top-32 right-20 w-2 h-2 animate-pulse" style={{ backgroundColor: 'var(--color-accent)', animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-40 left-1/4 w-2 h-2 animate-pulse" style={{ backgroundColor: 'var(--color-primary)', animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 right-1/3 w-2 h-2 animate-pulse" style={{ backgroundColor: 'var(--color-accent)', animationDelay: '1.5s' }}></div>
          <div className="absolute top-1/2 left-1/5 w-2 h-2 animate-pulse" style={{ backgroundColor: 'var(--color-primary)', animationDelay: '2s' }}></div>
          <div className="absolute top-1/3 right-1/4 w-2 h-2 animate-pulse" style={{ backgroundColor: 'var(--color-accent)', animationDelay: '2.5s' }}></div>
        </div>

        {/* Gradient glow effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 opacity-30 blur-3xl" style={{ background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)' }}></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 opacity-30 blur-3xl" style={{ background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)' }}></div>

        <div className="relative w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20 lg:py-32">
            {/* Maker badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8 animate-pulse-slow" style={{
              backgroundColor: 'rgba(255, 107, 53, 0.1)',
              border: '1px solid var(--color-primary)',
              color: 'var(--color-primary)',
              boxShadow: '0 0 20px rgba(255, 107, 53, 0.3)'
            }}>
              <BoltIcon className="w-4 h-4 animate-pulse" />
              Made for Makers & Hackers
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight text-white">
              Figma for
              <span className="block text-gradient" style={{
                background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                1-bit OLEDs
              </span>
            </h1>

            <p className="text-lg sm:text-xl lg:text-2xl max-w-4xl mx-auto mb-12 leading-relaxed" style={{ color: '#888888' }}>
              Turn your pixel art into <span className="brand-orange font-semibold">hardware-ready code</span> for tiny displays.
              Built for custom keyboards, IoT dashboards, and embedded projects that <span className="brand-cyan font-semibold">glow in the dark</span>.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
              <button
                onClick={handleNavigateToPreview}
                className="btn btn-primary group px-8 py-4 text-lg flex items-center gap-3"
              >
                <CubeIcon className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                <span>Launch Studio</span>
                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </button>

              <button className="btn btn-outline group px-8 py-4 text-lg" style={{
                backgroundColor: 'rgba(0, 217, 255, 0.05)',
                borderColor: 'var(--color-accent)',
                color: 'var(--color-accent)'
              }}>
                <span className="group-hover:opacity-80 transition-opacity duration-300">Browse Gallery</span>
              </button>
            </div>

            {/* Status indicators - OLED style */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-16 text-sm text-white">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div className="status-dot status-online"></div>
                Zero Install
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div className="status-dot status-online"></div>
                Pixel Perfect
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div className="status-dot status-online"></div>
                Export Ready
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid - Tiny Screen Aesthetic */}
      <section className="py-16 lg:py-24 rounded-3xl mb-8" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-gradient">Built for Tinkerers</h2>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: 'var(--color-muted)' }}>
              Everything you need to go from pixels to production-ready embedded code
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group card card-glow p-8 text-center slide-up interactive-hover">
              <div className="screen-frame mx-auto mb-6 w-20 h-20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <PhotoIcon className="w-10 h-10 brand-orange" />
              </div>
              <h3 className="text-xl font-semibold mb-4 brand-orange">Drag & Drop Magic</h3>
              <p className="leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                Upload any image and watch it transform into <span className="brand-orange font-semibold">pixel-perfect monochrome</span> with smart dithering
              </p>
            </div>

            <div className="group card card-glow p-8 text-center slide-up interactive-hover" style={{ animationDelay: '0.1s' }}>
              <div className="terminal mx-auto mb-6 w-20 h-20 flex items-center justify-center relative group-hover:scale-110 transition-transform duration-300">
                <CodeBracketIcon className="w-10 h-10 brand-cyan" />
              </div>
              <h3 className="text-xl font-semibold mb-4 brand-cyan">Code Export</h3>
              <p className="leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                Get <span className="brand-cyan font-semibold">Arduino & QMK-ready C arrays</span>, binary files, or custom formats. Copy-paste into your project and compile
              </p>
            </div>

            <div className="group card card-glow p-8 text-center slide-up interactive-hover" style={{ animationDelay: '0.2s' }}>
              <div className="mx-auto mb-6 w-20 h-20 flex items-center justify-center rounded-2xl group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: 'var(--color-primary)' }}>
                <BoltIcon className="w-10 h-10 text-white group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Live OLED Preview</h3>
              <p className="leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                See <span className="brand-orange font-semibold">exactly</span> how it'll look on your hardware. No surprises, no flashing broken code
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Devices - Hardware Focus */}
      <section className="py-16 lg:py-24 relative overflow-hidden rounded-3xl mb-8" style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 107, 53, 0.1) 2px, rgba(255, 107, 53, 0.1) 4px)`
        }}></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Works with Your Hardware</h2>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: '#888888' }}>
              Tested on real displays. Optimized for the chips you're actually using.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                name: 'SSD1306',
                desc: '128×64 OLED',
                status: 'Most Popular',
                color: '#FF6B35',
                bgColor: 'rgba(255, 107, 53, 0.1)',
                borderColor: 'rgba(255, 107, 53, 0.4)',
                glowColor: 'rgba(255, 107, 53, 0.3)'
              },
              {
                name: 'SH1106',
                desc: '132×64 OLED',
                status: 'Fully Tested',
                color: '#00D9FF',
                bgColor: 'rgba(0, 217, 255, 0.1)',
                borderColor: 'rgba(0, 217, 255, 0.4)',
                glowColor: 'rgba(0, 217, 255, 0.3)'
              },
              {
                name: 'SSD1309',
                desc: '128×64 OLED',
                status: 'Supported',
                color: '#9D4EDD',
                bgColor: 'rgba(157, 78, 221, 0.1)',
                borderColor: 'rgba(157, 78, 221, 0.4)',
                glowColor: 'rgba(157, 78, 221, 0.3)'
              }
            ].map((device, index) => (
              <div key={device.name} className="group p-8 text-center bounce-in interactive-hover rounded-2xl relative" style={{
                animationDelay: `${index * 0.1}s`,
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: `1px solid ${device.borderColor}`,
                transition: 'all 0.3s ease'
              }}>
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center relative group-hover:scale-110 transition-transform duration-300 animate-pulse-slow" style={{
                  backgroundColor: device.bgColor,
                  border: `2px solid ${device.borderColor}`,
                  boxShadow: `0 0 20px ${device.glowColor}`
                }}>
                  <CpuChipIcon className="w-10 h-10 group-hover:rotate-12 transition-transform duration-300" style={{ color: device.color }} />
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" style={{
                    background: `radial-gradient(circle at center, ${device.glowColor}, transparent)`
                  }}></div>
                </div>
                <h4 className="font-bold text-white mb-2 font-mono text-xl">{device.name}</h4>
                <p className="text-base mb-4" style={{ color: '#AAAAAA' }}>{device.desc}</p>
                <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold" style={{
                  backgroundColor: device.bgColor,
                  color: device.color,
                  border: `1px solid ${device.borderColor}`
                }}>
                  {device.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works - Maker Workflow */}
      <section className="py-16 lg:py-24 rounded-3xl mb-8" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
              From Pixels to Production in <span className="brand-orange">3 Steps</span>
            </h2>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: 'var(--color-muted)' }}>
              No complex toolchains. No firmware headaches. Just upload, tweak, and ship.
            </p>
          </div>

          <div className="relative max-w-5xl mx-auto">
            {/* Dotted connection line */}
            <div className="hidden lg:block absolute top-8 left-1/6 right-1/6 h-0.5" style={{
              backgroundImage: 'repeating-linear-gradient(90deg, var(--color-primary) 0px, var(--color-primary) 4px, transparent 4px, transparent 8px)'
            }}></div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8">
              <div className="group text-center slide-up">
                <div className="relative inline-block mb-6">
                  <div className="w-16 h-16 text-white rounded-2xl flex items-center justify-center text-2xl font-bold font-mono relative z-10 glow-primary" style={{
                    backgroundColor: 'var(--color-primary)'
                  }}>
                    01
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-4 brand-orange">Drop Your Image</h3>
                <p className="leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                  PNG, JPG, GIF, whatever. We'll handle the conversion magic
                </p>
              </div>

              <div className="group text-center slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="relative inline-block mb-6">
                  <div className="w-16 h-16 text-black rounded-2xl flex items-center justify-center text-2xl font-bold font-mono relative z-10 glow-accent" style={{
                    backgroundColor: 'var(--color-accent)'
                  }}>
                    02
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-4 brand-cyan">Preview Live</h3>
                <p className="leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                  See it glow on a simulated OLED. Adjust until it's perfect
                </p>
              </div>

              <div className="group text-center slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="relative inline-block mb-6">
                  <div className="w-16 h-16 text-white rounded-2xl flex items-center justify-center text-2xl font-bold font-mono relative z-10 glow-primary" style={{
                    backgroundColor: 'var(--color-primary)'
                  }}>
                    03
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-4 brand-orange">Copy Code</h3>
                <p className="leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                  One click to get Arduino & QMK-ready arrays. Paste and compile
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Community Vibe */}
      <section id="oled-studio-section" className="py-16 lg:py-24 relative overflow-hidden rounded-3xl" style={{
        background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
        border: '2px solid var(--color-primary)'
      }}>
        {/* Animated circuit background */}
        <div className="absolute inset-0 bg-circuit opacity-30"></div>

        {/* Glowing corners */}
        <div className="absolute top-0 left-0 w-64 h-64 opacity-40 blur-3xl" style={{ background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)' }}></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 opacity-40 blur-3xl" style={{ background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)' }}></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bounce-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8" style={{
                backgroundColor: 'rgba(255, 107, 53, 0.1)',
                border: '1px solid var(--color-primary)',
                color: 'var(--color-primary)'
              }}>
                <BoltIcon className="w-4 h-4" />
                Join the Community
              </div>

              <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-white leading-tight">
                Start Building <span className="text-gradient">Glowing Things</span>
              </h2>

              <p className="text-xl lg:text-2xl mb-12 leading-relaxed max-w-3xl mx-auto" style={{ color: '#888888' }}>
                Whether you're building a custom keyboard, IoT dashboard, or wearable gadget —
                TinyScreen.Studios gets your pixels onto hardware <span className="brand-orange font-semibold">fast</span>.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
                <button
                  onClick={handleNavigateToPreview}
                  className="btn btn-primary group px-10 py-5 text-xl flex items-center gap-3"
                >
                  <CubeIcon className="w-6 h-6" />
                  <span>Launch Studio</span>
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </button>

                <button className="btn group px-10 py-5 text-xl" style={{
                  backgroundColor: 'rgba(0, 217, 255, 0.1)',
                  borderColor: 'var(--color-accent)',
                  color: 'var(--color-accent)'
                }}>
                  <span className="group-hover:opacity-80 transition-opacity duration-300">View Gallery</span>
                </button>
              </div>

              {/* Community stats */}
              <div className="flex flex-wrap justify-center gap-8 mt-16">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">128×64</div>
                  <div className="text-sm" style={{ color: '#666666' }}>Most Popular Size</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold brand-orange mb-2">Zero</div>
                  <div className="text-sm" style={{ color: '#666666' }}>Install Required</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold brand-cyan mb-2">100%</div>
                  <div className="text-sm" style={{ color: '#666666' }}>Open Source</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
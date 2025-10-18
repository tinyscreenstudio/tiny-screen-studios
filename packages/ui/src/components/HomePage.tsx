import React from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  CpuChipIcon, 
  PhotoIcon, 
  CodeBracketIcon, 
  EyeIcon,
  ArrowRightIcon,
  SparklesIcon,
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
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Light pixel-art inspired background */}
        <div className="absolute inset-0">
          {/* Subtle pixel grid pattern */}
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, var(--color-primary) 1px, transparent 0)`,
            backgroundSize: '20px 20px'
          }}></div>
          
          {/* Floating pixel blocks - light theme */}
          <div className="absolute top-20 left-10 w-6 h-6 opacity-60 animate-float pixelated" style={{ backgroundColor: 'rgba(99, 102, 241, 0.3)' }}></div>
          <div className="absolute top-32 right-20 w-4 h-4 opacity-70 animate-float-delayed pixelated" style={{ backgroundColor: 'rgba(139, 92, 246, 0.3)' }}></div>
          <div className="absolute bottom-40 left-1/4 w-8 h-8 opacity-50 animate-float-slow pixelated" style={{ backgroundColor: 'rgba(59, 130, 246, 0.3)' }}></div>
          <div className="absolute bottom-20 right-1/3 w-5 h-5 opacity-65 animate-pulse pixelated" style={{ backgroundColor: 'rgba(6, 182, 212, 0.3)' }}></div>
          
          {/* Light geometric shapes */}
          <div className="absolute top-1/4 right-1/4 w-32 h-32 rounded-full opacity-40 blur-xl animate-float" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)' }}></div>
          <div className="absolute bottom-1/3 left-1/5 w-24 h-24 rounded-full opacity-50 blur-xl animate-float-delayed" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)' }}></div>
        </div>

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20 lg:py-32">
            <div className="animate-fade-in">
              {/* Clean badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 backdrop-blur-sm rounded-full text-sm font-medium mb-8 shadow-sm" style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                border: `1px solid rgba(99, 102, 241, 0.3)`,
                color: 'var(--color-primary)'
              }}>
                <SparklesIcon className="w-4 h-4" />
                Professional OLED Tools
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight" style={{ color: 'var(--color-text)' }}>
                Transform Pixel Art for
                <span className="block text-transparent bg-clip-text" style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, #8b5cf6 50%, var(--color-info) 100%)', WebkitBackgroundClip: 'text' }}>
                  Tiny Displays
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl lg:text-2xl max-w-4xl mx-auto mb-12 leading-relaxed font-light" style={{ color: 'var(--color-muted)' }}>
                Convert your pixel art and animations into optimized formats for <span style={{ color: 'var(--color-primary)', fontWeight: '600' }}>SSD1306</span>, <span style={{ color: '#8b5cf6', fontWeight: '600' }}>SH1106</span>, 
                and other embedded OLED displays. Professional tools for embedded developers.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
                <button 
                  onClick={handleNavigateToPreview}
                  className="group relative overflow-hidden px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-3"
                  style={{ 
                    background: `linear-gradient(135deg, var(--color-primary) 0%, #8b5cf6 100%)`,
                    color: 'var(--color-primary-contrast)'
                  }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.9) 0%, rgba(139, 92, 246, 0.9) 100%)' }}></div>
                  <EyeIcon className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">Start Creating</span>
                  <ArrowRightIcon className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
                
                <button className="group px-8 py-4 rounded-2xl font-semibold text-lg backdrop-blur-sm transition-all duration-300 shadow-sm hover:shadow-md" style={{
                  color: 'var(--color-text)',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  border: `1px solid var(--color-border)`
                }}>
                  <span className="group-hover:opacity-80 transition-opacity duration-300" style={{ color: 'var(--color-text)' }}>View Examples</span>
                </button>
              </div>
              
              {/* Feature highlights - clean light style */}
              <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-16 text-sm" style={{ color: 'var(--color-muted)' }}>
                <div className="flex items-center gap-2 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', border: `1px solid rgba(16, 185, 129, 0.3)` }}>
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-success)' }}></div>
                  Real-time Preview
                </div>
                <div className="flex items-center gap-2 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', border: `1px solid rgba(59, 130, 246, 0.3)` }}>
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-info)' }}></div>
                  Multiple Formats
                </div>
                <div className="flex items-center gap-2 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', border: `1px solid rgba(139, 92, 246, 0.3)` }}>
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#8b5cf6' }}></div>
                  Smart Processing
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>Powerful Features</h2>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: 'var(--color-muted)' }}>
              Everything you need to convert and optimize your pixel art for embedded displays
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group card p-8 text-center animate-slide-up hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="relative w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                <PhotoIcon className="w-8 h-8 text-white" />
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-2xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-indigo-600 transition-colors duration-300">Smart Image Processing</h3>
              <p className="text-gray-600 leading-relaxed">
                Advanced algorithms for optimal <span className="text-indigo-600 font-semibold">monochrome conversion</span> with intelligent dithering and contrast enhancement
              </p>
            </div>

            <div className="group card p-8 text-center animate-slide-up hover:shadow-xl hover:-translate-y-2 transition-all duration-300" style={{ animationDelay: '0.1s' }}>
              <div className="relative w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                <CodeBracketIcon className="w-8 h-8 text-white" />
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors duration-300">Multiple Export Formats</h3>
              <p className="text-gray-600 leading-relaxed">
                Export as <span className="text-purple-600 font-semibold">C arrays</span>, binary files, or header files ready for your embedded project with customizable options
              </p>
            </div>

            <div className="group card p-8 text-center animate-slide-up hover:shadow-xl hover:-translate-y-2 transition-all duration-300" style={{ animationDelay: '0.2s' }}>
              <div className="relative w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                <BoltIcon className="w-8 h-8 text-white" />
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-2xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-emerald-600 transition-colors duration-300">Real-time Preview</h3>
              <p className="text-gray-600 leading-relaxed">
                See exactly how your pixel art will look on the target <span className="text-emerald-600 font-semibold">OLED display</span> with accurate pixel simulation
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Devices */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-gray-50 via-blue-50 to-gray-50 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full blur-2xl opacity-60"></div>
          <div className="absolute bottom-0 right-1/4 w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-200 rounded-full blur-2xl opacity-60"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Supported Display Controllers</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Optimized for the most popular OLED display controllers used in embedded systems and IoT devices
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'SSD1306', desc: '128x64 OLED', color: 'indigo' },
              { name: 'SH1106', desc: '132x64 OLED', color: 'purple' },
              { name: 'SSD1309', desc: '128x64 OLED', color: 'blue' },
              { name: 'Custom', desc: 'Any Resolution', color: 'emerald' }
            ].map((device, index) => (
              <div key={device.name} className="group card p-6 text-center animate-scale-in hover:shadow-xl hover:-translate-y-2 transition-all duration-300" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className={`w-12 h-12 bg-gradient-to-br ${
                  device.color === 'indigo' ? 'from-indigo-500 to-indigo-600' :
                  device.color === 'purple' ? 'from-purple-500 to-purple-600' :
                  device.color === 'blue' ? 'from-blue-500 to-blue-600' :
                  'from-emerald-500 to-emerald-600'
                } rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300`}>
                  <CpuChipIcon className="w-6 h-6 text-white" />
                </div>
                <h4 className={`font-semibold text-gray-900 mb-2 ${
                  device.color === 'indigo' ? 'group-hover:text-indigo-600' :
                  device.color === 'purple' ? 'group-hover:text-purple-600' :
                  device.color === 'blue' ? 'group-hover:text-blue-600' :
                  'group-hover:text-emerald-600'
                } transition-colors duration-300`}>{device.name}</h4>
                <p className="text-sm text-gray-600">{device.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started with your OLED display project in just three simple steps
            </p>
          </div>
          
          <div className="relative max-w-5xl mx-auto">
            {/* Connection lines for desktop */}
            <div className="hidden lg:block absolute top-8 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-indigo-200 via-purple-200 to-emerald-200"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8">
              <div className="group text-center animate-slide-up">
                <div className="relative inline-block mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 relative z-10">
                    1
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-2xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-indigo-600 transition-colors duration-300">Upload Your Art</h3>
                <p className="text-gray-600 leading-relaxed">
                  Drag and drop your pixel art, images, or animations into the workspace
                </p>
              </div>
              
              <div className="group text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="relative inline-block mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 relative z-10">
                    2
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors duration-300">Configure Settings</h3>
                <p className="text-gray-600 leading-relaxed">
                  Choose your target display, adjust processing options, and preview results
                </p>
              </div>
              
              <div className="group text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="relative inline-block mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 relative z-10">
                    3
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-2xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-emerald-600 transition-colors duration-300">Export & Use</h3>
                <p className="text-gray-600 leading-relaxed">
                  Download optimized code ready to integrate into your embedded project
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-20 h-20 bg-gradient-to-br from-indigo-200 to-purple-300 rounded-full blur-xl animate-float opacity-40"></div>
          <div className="absolute bottom-10 left-10 w-16 h-16 bg-gradient-to-br from-purple-200 to-pink-300 rounded-full blur-xl animate-float-delayed opacity-40"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto">
            <div className="card-elevated p-8 lg:p-12 text-center bg-white/80 backdrop-blur-sm border border-gray-200">
              <div className="animate-fade-in">
                <div className="relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mx-auto mb-6 shadow-lg">
                  <SparklesIcon className="w-8 h-8 text-white" />
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl blur opacity-30 animate-pulse"></div>
                </div>
                
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto font-light">
                  Transform your creative vision into embedded reality. Start converting your pixel art today.
                </p>
                
                <button 
                  onClick={handleNavigateToPreview}
                  className="group relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-3 mx-auto"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CubeIcon className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">Open OLED Studio</span>
                  <ArrowRightIcon className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
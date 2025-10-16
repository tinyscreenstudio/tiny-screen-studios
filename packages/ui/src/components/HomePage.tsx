import React from 'react'
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

interface HomePageProps {
  onNavigateToPreview: () => void
}

export function HomePage({ onNavigateToPreview }: HomePageProps) {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="text-center py-16">
        <div className="animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Transform Pixel Art for
            <span className="text-gradient block">Tiny Displays</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            Convert your pixel art and animations into optimized formats for SSD1306, SH1106, 
            and other embedded OLED displays. Professional tools for embedded developers.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={onNavigateToPreview}
              className="btn-primary flex items-center gap-2 text-lg px-8 py-4"
            >
              <EyeIcon className="w-5 h-5" />
              Start Creating
              <ArrowRightIcon className="w-4 h-4" />
            </button>
            <button className="btn-ghost text-lg px-8 py-4">
              View Examples
            </button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="card-hover p-8 text-center animate-slide-up">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <PhotoIcon className="w-8 h-8 text-indigo-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart Image Processing</h3>
          <p className="text-gray-600 leading-relaxed">
            Advanced algorithms for optimal monochrome conversion with intelligent dithering and contrast enhancement
          </p>
        </div>

        <div className="card-hover p-8 text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CodeBracketIcon className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Multiple Export Formats</h3>
          <p className="text-gray-600 leading-relaxed">
            Export as C arrays, binary files, or header files ready for your embedded project with customizable options
          </p>
        </div>

        <div className="card-hover p-8 text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BoltIcon className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Real-time Preview</h3>
          <p className="text-gray-600 leading-relaxed">
            See exactly how your pixel art will look on the target OLED display with accurate pixel simulation
          </p>
        </div>
      </div>

      {/* Supported Devices */}
      <div className="card p-8 md:p-12 text-center">
        <div className="animate-fade-in">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Supported Display Controllers</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Optimized for the most popular OLED display controllers used in embedded systems and IoT devices
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'SSD1306', desc: '128x64 OLED' },
              { name: 'SH1106', desc: '132x64 OLED' },
              { name: 'SSD1309', desc: '128x64 OLED' },
              { name: 'Custom', desc: 'Any Resolution' }
            ].map((device, index) => (
              <div key={device.name} className="card p-4 animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CpuChipIcon className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900">{device.name}</h4>
                <p className="text-sm text-gray-600">{device.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How it Works */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-12">How It Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="animate-slide-up">
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
              1
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Your Art</h3>
            <p className="text-gray-600">
              Drag and drop your pixel art, images, or animations into the workspace
            </p>
          </div>
          
          <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
              2
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Configure Settings</h3>
            <p className="text-gray-600">
              Choose your target display, adjust processing options, and preview results
            </p>
          </div>
          
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
              3
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Export & Use</h3>
            <p className="text-gray-600">
              Download optimized code ready to integrate into your embedded project
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="card-elevated p-8 md:p-12 text-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="animate-fade-in">
          <SparklesIcon className="w-12 h-12 text-indigo-600 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Transform your creative vision into embedded reality. Start converting your pixel art today.
          </p>
          
          <button 
            onClick={onNavigateToPreview}
            className="btn-primary text-lg px-8 py-4 flex items-center gap-2 mx-auto"
          >
            <CubeIcon className="w-5 h-5" />
            Open OLED Studio
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
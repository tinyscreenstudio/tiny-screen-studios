import React, { useRef, useEffect } from 'react'
import { EyeIcon, PlayIcon, PauseIcon, FilmIcon } from '@heroicons/react/24/outline'
import { QuestionMarkCircleIcon } from '@heroicons/react/16/solid'
import { useAppStore } from '../store/appStore'
import { Tooltip } from './Tooltip'

export function OLEDPreviewCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const {
    currentPackedFrames,
    fps,
    isAnimationPlaying,
    currentFrame,
    devicePreset,
    isProcessing,
    setFps,
    setIsAnimationPlaying,
    setCurrentFrame,
  } = useAppStore()

  const hasFrames = currentPackedFrames.length > 0
  const isMultiFrame = currentPackedFrames.length > 1

  // Canvas rendering effect
  useEffect(() => {
    if (!hasFrames || !canvasRef.current) return

    const renderFrame = async () => {
      try {
        const { createCanvasEmulator, DEVICE_PRESETS } = await import('@tiny-screen-studios/core')
        const emulator = createCanvasEmulator()
        const ctx = canvasRef.current?.getContext('2d')
        const preset = DEVICE_PRESETS[devicePreset as keyof typeof DEVICE_PRESETS]

        if (ctx && preset) {
          // Set canvas size
          canvasRef.current!.width = preset.width
          canvasRef.current!.height = preset.height

          const renderOptions = {
            scale: 1,
            showGrid: false,
          }

          const frameToRender = currentPackedFrames[currentFrame] || currentPackedFrames[0]
          if (frameToRender) {
            emulator.renderFrameToCanvas(ctx, frameToRender, renderOptions)
          }
        }
      } catch (error) {
        console.error('Error rendering frame:', error)
      }
    }

    renderFrame()
  }, [currentPackedFrames, currentFrame, devicePreset, hasFrames])

  // Animation effect
  useEffect(() => {
    if (!isAnimationPlaying || !isMultiFrame) return

    const interval = setInterval(() => {
      setCurrentFrame((currentFrame + 1) % currentPackedFrames.length)
    }, 1000 / fps)

    return () => clearInterval(interval)
  }, [isAnimationPlaying, fps, currentFrame, currentPackedFrames.length, isMultiFrame, setCurrentFrame])

  const handlePlayPause = () => {
    if (!isMultiFrame) return
    setIsAnimationPlaying(!isAnimationPlaying)
  }

  const handleFrameChange = (frame: number) => {
    setCurrentFrame(frame)
    if (isAnimationPlaying) {
      setIsAnimationPlaying(false)
    }
  }

  return (
    <div className="card p-6 animate-slide-up [animation-delay:100ms] flex-1 flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center">
          <EyeIcon className="w-5 h-5 text-warning-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">
          OLED Preview
        </h2>
        {hasFrames && (
          <div className="ml-auto flex items-center gap-2 text-xs">
            <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
            <span className="text-gray-600 font-mono">ACTIVE</span>
          </div>
        )}
      </div>

      {/* Realistic OLED Hardware Emulator */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          {/* OLED Module PCB Background */}
          <div className="bg-gradient-to-br from-green-800 to-green-900 p-6 rounded-xl shadow-2xl border-2 border-green-700">
            {/* PCB Circuit Traces */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-2 left-2 w-8 h-0.5 bg-yellow-400 rounded"></div>
              <div className="absolute top-2 right-2 w-6 h-0.5 bg-yellow-400 rounded"></div>
              <div className="absolute bottom-2 left-2 w-10 h-0.5 bg-yellow-400 rounded"></div>
              <div className="absolute bottom-2 right-2 w-4 h-0.5 bg-yellow-400 rounded"></div>
              <div className="absolute top-4 left-1 w-0.5 h-6 bg-yellow-400 rounded"></div>
              <div className="absolute top-4 right-1 w-0.5 h-8 bg-yellow-400 rounded"></div>
            </div>

            {/* Component Labels */}
            <div className="absolute top-1 left-1 text-xs text-white font-mono opacity-60">SSD1306</div>
            <div className="absolute bottom-1 right-1 text-xs text-white font-mono opacity-60">0.96"</div>

            {/* OLED Display Area */}
            <div className="bg-gray-700 p-4 rounded-lg shadow-inner">
              {/* Actual Display Area - Bigger responsive container */}
              <div className="relative bg-gray-600 rounded overflow-auto flex items-center justify-center p-4" style={{
                width: 'min(500px, 100%)',
                height: 'min(250px, 50vw)',
                aspectRatio: '2/1'
              }}>
                {hasFrames ? (
                  <div className="bg-black border-2 border-gray-400 rounded shadow-lg relative overflow-hidden" style={{
                    width: '384px', // 128 * 3 for 3x scale
                    height: '96px'  // 32 * 3 for 3x scale
                  }}>
                    {/* OLED Glow Effect */}
                    <div className="absolute inset-0 bg-blue-500/5 rounded animate-pulse"></div>

                    {/* Canvas Container */}
                    <div className="relative w-full h-full flex items-center justify-center">
                      <canvas
                        ref={canvasRef}
                        className="pixelated"
                        style={{
                          imageRendering: 'pixelated',
                          filter: 'contrast(1.1) brightness(1.1)',
                          transform: 'scale(3)',
                          transformOrigin: 'center',
                        }}
                      />
                    </div>

                    {/* Subtle scan lines for authenticity */}
                    <div className="absolute inset-0 pointer-events-none opacity-10">
                      <div className="w-full h-full" style={{
                        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(255,255,255,0.1) 1px, rgba(255,255,255,0.1) 2px)',
                      }}></div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-black border-2 border-gray-400 rounded shadow-lg relative overflow-hidden flex items-center justify-center" style={{
                    width: '384px', // 128 * 3 for 3x scale
                    height: '96px'  // 32 * 3 for 3x scale
                  }}>
                    <div className="text-center">
                      <div className="w-8 h-8 mx-auto mb-2 opacity-30">
                        <svg fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                      </div>
                      <div className="text-xs font-mono opacity-50 text-gray-400">NO SIGNAL</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Pin Headers */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-0.5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-1 h-3 bg-yellow-600 rounded-sm shadow"></div>
              ))}
            </div>
          </div>

          {/* Power LED */}
          {hasFrames && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></div>
          )}
        </div>
      </div>

      {/* Animation Controls */}
      {isMultiFrame && (
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
            <FilmIcon className="w-4 h-4 text-success-600" />
            Animation Controls
          </h3>

          <div className="space-y-4">
            {/* FPS Control */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>Frame Rate</span>
                    <Tooltip content="Animation speed in frames per second. Higher = faster animation.">
                      <QuestionMarkCircleIcon className="w-4 h-4 text-gray-400 hover:text-primary-600 transition-colors cursor-help" />
                    </Tooltip>
                  </div>
                  <span className="font-mono text-success-600 bg-success-50 px-2 py-1 rounded text-sm">
                    {fps} FPS
                  </span>
                </div>
              </label>

              <input
                type="range"
                min="1"
                max="30"
                value={fps}
                onChange={(e) => setFps(parseInt(e.target.value))}
                className="slider"
                disabled={isProcessing}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>1 FPS Slow</span>
                <span>30 FPS Fast</span>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="card p-4 bg-gray-50">
              <div className="flex items-center gap-4 mb-3">
                <button
                  onClick={handlePlayPause}
                  className={`btn-primary flex items-center gap-2 ${isAnimationPlaying ? 'bg-warning-600 hover:bg-warning-700' : ''}`}
                  disabled={isProcessing}
                >
                  {isAnimationPlaying ? (
                    <>
                      <PauseIcon className="w-4 h-4" />
                      Pause
                    </>
                  ) : (
                    <>
                      <PlayIcon className="w-4 h-4" />
                      Play
                    </>
                  )}
                </button>

                <div className="flex-1 text-center">
                  <div className="text-sm text-gray-600 font-mono mb-1">
                    Frame {currentFrame + 1} of {currentPackedFrames.length}
                  </div>
                </div>
              </div>

              <input
                type="range"
                min="0"
                max={currentPackedFrames.length - 1}
                value={currentFrame}
                onChange={(e) => handleFrameChange(parseInt(e.target.value))}
                className="slider w-full"
                disabled={isProcessing}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
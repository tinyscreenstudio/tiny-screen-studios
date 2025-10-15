import React, { useRef, useEffect } from 'react'
import { EyeIcon, PlayIcon, PauseIcon, MagnifyingGlassIcon, FilmIcon } from '@heroicons/react/24/outline'
import { useAppStore } from '../store/appStore'
import { Tooltip } from './Tooltip'
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline'

export function OLEDPreviewCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const {
    currentPackedFrames,
    scale,
    showGrid,
    fps,
    isAnimationPlaying,
    currentFrame,
    devicePreset,
    isProcessing,
    setScale,
    setShowGrid,
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
            scale,
            showGrid,
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
  }, [currentPackedFrames, scale, showGrid, currentFrame, devicePreset, hasFrames])

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

      {/* OLED Display Container */}
      <div className={`oled-display mb-6 ${hasFrames ? 'active' : ''}`}>
        <div className="relative">
          {hasFrames ? (
            <div className="flex justify-center">
              <canvas
                ref={canvasRef}
                className="pixelated rounded-lg shadow-lg"
                style={{
                  maxWidth: '100%',
                  maxHeight: '400px',
                  imageRendering: 'pixelated',
                }}
              />
            </div>
          ) : (
            <div className="text-center py-16">
              <EyeIcon className="w-20 h-20 mx-auto text-gray-300 mb-6" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                No Preview Available
              </h3>
              <p className="text-gray-500 text-sm">
                Upload PNG files to see your pixel art rendered on the OLED display
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Preview Controls */}
      <div className="space-y-6">
        {/* Display Controls */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
            <MagnifyingGlassIcon className="w-4 h-4 text-primary-600" />
            Display Controls
          </h3>
          
          <div className="space-y-4">
            {/* Scale Control */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>Zoom Level</span>
                    <Tooltip content="Zoom level for preview. Higher values show more pixel detail.">
                      <QuestionMarkCircleIcon className="w-4 h-4 text-gray-400 hover:text-primary-600 transition-colors cursor-help" />
                    </Tooltip>
                  </div>
                  <span className="font-mono text-primary-600 bg-primary-50 px-2 py-1 rounded text-sm">
                    {scale}×
                  </span>
                </div>
              </label>
              
              <input
                type="range"
                min="1"
                max="8"
                value={scale}
                onChange={(e) => setScale(parseInt(e.target.value))}
                className="slider"
                disabled={isProcessing}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>1× Small</span>
                <span>8× Large</span>
              </div>
            </div>

            {/* Grid Toggle */}
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                disabled={isProcessing}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                    Show Pixel Grid
                  </span>
                  <Tooltip content="Overlay pixel grid lines to see individual pixels clearly.">
                    <QuestionMarkCircleIcon className="w-4 h-4 text-gray-400 hover:text-primary-600 transition-colors cursor-help" />
                  </Tooltip>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Overlay grid lines for pixel precision
                </p>
              </div>
            </label>
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
    </div>
  )
}
import React, { useEffect, useRef } from 'react'

export function MatrixBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Enhanced matrix rain effect with multiple character sets
    const chars = '01ABCDEF'
    const pixelChars = '█▓▒░'
    const fontSize = 12
    const columns = Math.floor(canvas.width / fontSize)
    const drops: number[] = []
    const speeds: number[] = []
    const colors: string[] = []

    // Initialize drops with random properties
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * canvas.height
      speeds[i] = Math.random() * 3 + 1
      colors[i] = Math.random() > 0.7 ? 'rgba(139, 92, 246, 0.8)' : 
                  Math.random() > 0.5 ? 'rgba(236, 72, 153, 0.6)' : 
                  'rgba(6, 182, 212, 0.4)'
    }

    const draw = () => {
      // Create trailing effect
      ctx.fillStyle = 'rgba(15, 23, 42, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw matrix characters
      for (let i = 0; i < drops.length; i++) {
        const charSet = Math.random() > 0.8 ? pixelChars : chars
        const char = charSet[Math.floor(Math.random() * charSet.length)]
        const x = i * fontSize
        const y = drops[i]

        if (char && typeof y === 'number') {
          // Set character properties
          ctx.fillStyle = colors[i] || 'rgba(6, 182, 212, 0.4)'
          ctx.font = `${fontSize}px JetBrains Mono, monospace`
          ctx.fillText(char, x, y)

          // Add glow effect for some characters
          if (Math.random() > 0.95) {
            ctx.shadowColor = colors[i] || 'rgba(6, 182, 212, 0.4)'
            ctx.shadowBlur = 10
            ctx.fillText(char, x, y)
            ctx.shadowBlur = 0
          }

          // Reset drop to top randomly
          if (y > canvas.height && Math.random() > 0.975) {
            drops[i] = 0
            speeds[i] = Math.random() * 3 + 1
            colors[i] = Math.random() > 0.7 ? 'rgba(139, 92, 246, 0.8)' : 
                        Math.random() > 0.5 ? 'rgba(236, 72, 153, 0.6)' : 
                        'rgba(6, 182, 212, 0.4)'
          }

          // Move drop down at variable speed
          drops[i] = y + fontSize * (speeds[i] || 1)
        }
      }
    }

    const interval = setInterval(draw, 50)

    return () => {
      clearInterval(interval)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{ zIndex: 1 }}
      />
      {/* Additional background elements */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 2 }}>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse [animation-delay:1s]"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse [animation-delay:2s]"></div>
      </div>
    </>
  )
}
import type {
  PackedFrame,
  RenderOptions,
  AnimationOptions,
  AnimationController,
  DisplayEmulator,
  PresetConfig,
} from '../types/index.js';
import { getPresetConfig, getVisibleDimensions } from '../config/presets.js';

/**
 * Animation controller for managing frame playback on canvas
 * Handles FPS control, loop modes, and frame scrubbing
 */
class CanvasAnimationController implements AnimationController {
  private ctx: CanvasRenderingContext2D;
  private frames: PackedFrame[];
  private emulator: CanvasEmulator;

  // Animation state
  private currentFrame = 0;
  private isAnimationPlaying = false;
  private animationId: number | null = null;
  private lastFrameTime = 0;

  // Animation options
  private fps: number;
  private loop: boolean;
  private pingpong: boolean;
  private direction = 1; // 1 for forward, -1 for backward (pingpong mode)

  constructor(
    ctx: CanvasRenderingContext2D,
    frames: PackedFrame[],
    options: AnimationOptions,
    emulator: CanvasEmulator
  ) {
    this.ctx = ctx;
    this.frames = frames;
    this.emulator = emulator;

    // Set default options
    this.fps = options.fps ?? 10;
    this.loop = options.loop ?? true;
    this.pingpong = options.pingpong ?? false;

    // Start animation if we have frames
    if (frames.length > 0) {
      this.renderCurrentFrame();
      if (frames.length > 1) {
        this.start();
      }
    }
  }

  /**
   * Stop the animation
   */
  stop(): void {
    this.isAnimationPlaying = false;
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * Go to a specific frame index
   * @param frameIndex - Frame index to jump to (0-based)
   */
  goTo(frameIndex: number): void {
    if (frameIndex < 0 || frameIndex >= this.frames.length) {
      return; // Invalid frame index
    }

    this.currentFrame = frameIndex;
    this.renderCurrentFrame();
  }

  /**
   * Set the animation FPS
   * @param fps - Frames per second (must be positive)
   */
  setFPS(fps: number): void {
    if (fps > 0) {
      this.fps = fps;
    }
  }

  /**
   * Check if animation is currently playing
   * @returns True if animation is playing
   */
  isPlaying(): boolean {
    return this.isAnimationPlaying;
  }

  /**
   * Get the current frame index
   * @returns Current frame index (0-based)
   */
  getCurrentFrame(): number {
    return this.currentFrame;
  }

  /**
   * Start the animation loop
   * @private
   */
  private start(): void {
    if (this.frames.length <= 1) {
      return; // No animation needed for single frame
    }

    this.isAnimationPlaying = true;
    this.lastFrameTime = performance.now();
    this.animate();
  }

  /**
   * Animation loop using requestAnimationFrame
   * @private
   */
  private animate = (): void => {
    if (!this.isAnimationPlaying) {
      return;
    }

    const currentTime = performance.now();
    const frameInterval = 1000 / this.fps; // Convert FPS to milliseconds

    // Check if enough time has passed for the next frame
    if (currentTime - this.lastFrameTime >= frameInterval) {
      this.advanceFrame();
      this.renderCurrentFrame();
      this.lastFrameTime = currentTime;
    }

    // Schedule next animation frame
    this.animationId = requestAnimationFrame(this.animate);
  };

  /**
   * Advance to the next frame based on loop mode
   * @private
   */
  private advanceFrame(): void {
    if (this.frames.length <= 1) {
      return;
    }

    if (this.pingpong) {
      // Ping-pong mode: bounce back and forth
      this.currentFrame += this.direction;

      // Check boundaries and reverse direction
      if (this.currentFrame >= this.frames.length - 1) {
        this.currentFrame = this.frames.length - 1;
        this.direction = -1;
      } else if (this.currentFrame <= 0) {
        this.currentFrame = 0;
        this.direction = 1;
      }
    } else {
      // Normal forward playback
      this.currentFrame++;

      if (this.currentFrame >= this.frames.length) {
        if (this.loop) {
          this.currentFrame = 0; // Loop back to start
        } else {
          this.currentFrame = this.frames.length - 1; // Stay on last frame
          this.stop(); // Stop animation
        }
      }
    }
  }

  /**
   * Render the current frame to the canvas
   * @private
   */
  private renderCurrentFrame(): void {
    const frame = this.frames[this.currentFrame];
    if (frame) {
      this.emulator.renderFrameToCanvas(this.ctx, frame);
    }
  }
}

/**
 * Canvas-based display emulator for rendering packed frames
 * Provides pixel-exact rendering with scaling and overlay options
 */
export class CanvasEmulator implements DisplayEmulator {
  /**
   * Render a single packed frame to a canvas context with pixel-exact accuracy
   * @param ctx - Canvas 2D rendering context
   * @param frame - Packed frame data to render
   * @param options - Rendering options (scale, grid, invert)
   */
  renderFrameToCanvas(
    ctx: CanvasRenderingContext2D,
    frame: PackedFrame,
    options: RenderOptions = {}
  ): void {
    const { scale = 1, showGrid = false, invert = false } = options;

    // Disable image smoothing for pixel-perfect rendering
    ctx.imageSmoothingEnabled = false;

    // Get visible dimensions (handles SH1106 viewport)
    const visibleDims = getVisibleDimensions(frame.preset);
    const config = getPresetConfig(frame.preset);

    // Set canvas size to match scaled visible dimensions
    const canvasWidth = visibleDims.width * scale;
    const canvasHeight = visibleDims.height * scale;

    if (
      ctx.canvas.width !== canvasWidth ||
      ctx.canvas.height !== canvasHeight
    ) {
      ctx.canvas.width = canvasWidth;
      ctx.canvas.height = canvasHeight;
    }

    // Clear canvas with background color
    ctx.fillStyle = invert ? '#ffffff' : '#000000';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Render pixels by unpacking the device-specific byte format
    this.renderPixelsFromBytes(ctx, frame, config, visibleDims, scale, invert);

    // Draw grid overlay if requested
    if (showGrid && scale > 1) {
      this.drawPixelGrid(ctx, visibleDims, scale);
    }
  }

  /**
   * Create a new canvas element with the frame rendered to it
   * @param frame - Packed frame data to render
   * @param options - Rendering options
   * @returns New canvas element with rendered frame
   */
  createPreviewCanvas(
    frame: PackedFrame,
    options: RenderOptions = {}
  ): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D rendering context');
    }

    this.renderFrameToCanvas(ctx, frame, options);
    return canvas;
  }

  /**
   * Play an animation sequence on a canvas with full playback control
   * @param ctx - Canvas 2D rendering context
   * @param frames - Array of packed frames to animate
   * @param options - Animation options (fps, loop, pingpong)
   * @returns Animation controller for playback control
   */
  playFramesOnCanvas(
    ctx: CanvasRenderingContext2D,
    frames: PackedFrame[],
    options: AnimationOptions = {}
  ): AnimationController {
    return new CanvasAnimationController(ctx, frames, options, this);
  }

  /**
   * Render pixels by unpacking device-specific byte format
   * @private
   */
  private renderPixelsFromBytes(
    ctx: CanvasRenderingContext2D,
    frame: PackedFrame,
    config: PresetConfig,
    visibleDims: { width: number; height: number },
    scale: number,
    invert: boolean
  ): void {
    const { bytes } = frame;
    const { pageHeight, bitOrder } = config;
    const pages = config.height / pageHeight;

    // Set pixel color for lit pixels
    const onColor = invert ? '#000000' : '#ffffff';
    ctx.fillStyle = onColor;

    // Handle viewport offset for SH1106
    const startColumn = config.viewportOffset || 0;

    // Iterate through each page (8-pixel vertical strips)
    for (let page = 0; page < pages; page++) {
      // Iterate through each column in the visible area
      for (let col = 0; col < visibleDims.width; col++) {
        // Calculate byte index (accounting for viewport offset)
        const physicalCol = col + startColumn;
        const byteIndex = page * config.width + physicalCol;

        if (byteIndex >= bytes.length) continue;

        const byte = bytes[byteIndex];
        if (byte === undefined) continue;

        // Extract each bit from the byte (8 pixels vertically)
        for (let bit = 0; bit < pageHeight; bit++) {
          const pixelY = page * pageHeight + bit;

          // Check if pixel is set based on bit order
          let isPixelSet: boolean;
          if (bitOrder === 'lsb-top') {
            // LSB is top pixel (bit 0 = top, bit 7 = bottom)
            isPixelSet = (byte & (1 << bit)) !== 0;
          } else {
            // MSB is top pixel (bit 7 = top, bit 0 = bottom)
            isPixelSet = (byte & (1 << (7 - bit))) !== 0;
          }

          // Draw pixel if set
          if (isPixelSet) {
            const pixelX = col * scale;
            const pixelYScaled = pixelY * scale;
            ctx.fillRect(pixelX, pixelYScaled, scale, scale);
          }
        }
      }
    }
  }

  /**
   * Draw pixel grid overlay
   * @private
   */
  private drawPixelGrid(
    ctx: CanvasRenderingContext2D,
    visibleDims: { width: number; height: number },
    scale: number
  ): void {
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;

    // Draw vertical lines
    for (let x = 0; x <= visibleDims.width; x++) {
      const xPos = x * scale;
      ctx.beginPath();
      ctx.moveTo(xPos, 0);
      ctx.lineTo(xPos, visibleDims.height * scale);
      ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = 0; y <= visibleDims.height; y++) {
      const yPos = y * scale;
      ctx.beginPath();
      ctx.moveTo(0, yPos);
      ctx.lineTo(visibleDims.width * scale, yPos);
      ctx.stroke();
    }

    // Reset alpha after grid drawing
    ctx.globalAlpha = 1.0;
  }
}

/**
 * Create a new canvas emulator instance
 * @returns New CanvasEmulator instance
 */
export function createCanvasEmulator(): DisplayEmulator {
  return new CanvasEmulator();
}

/**
 * Convenience function to render a frame to a new canvas element
 * @param frame - Packed frame to render
 * @param options - Rendering options
 * @returns Canvas element with rendered frame
 */
export function renderFrameToNewCanvas(
  frame: PackedFrame,
  options: RenderOptions = {}
): HTMLCanvasElement {
  const emulator = createCanvasEmulator();
  return emulator.createPreviewCanvas(frame, options);
}

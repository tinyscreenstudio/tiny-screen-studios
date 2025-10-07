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
   * Play an animation sequence on a canvas (placeholder for task 10)
   * @param ctx - Canvas 2D rendering context
   * @param frames - Array of packed frames to animate
   * @param options - Animation options (unused in this placeholder)
   * @returns Animation controller for playback control
   */
  playFramesOnCanvas(
    ctx: CanvasRenderingContext2D,
    frames: PackedFrame[],
    options: AnimationOptions = {}
  ): AnimationController {
    // This is a placeholder implementation for task 10
    // For now, just render the first frame
    if (frames.length > 0 && frames[0]) {
      this.renderFrameToCanvas(ctx, frames[0]);
    }

    // Suppress unused parameter warning for placeholder implementation
    void options;

    return {
      stop: (): void => {},
      goTo: (): void => {},
      setFPS: (): void => {},
      isPlaying: (): boolean => false,
      getCurrentFrame: (): number => 0,
    };
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

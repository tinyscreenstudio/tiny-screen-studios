// Monochrome conversion module for Tiny Screen Studios
// Converts RGBA frames to 1-bit monochrome using various algorithms

import type {
  FrameRGBA,
  FrameMono,
  MonochromeOptions,
  MonochromeConverter,
  ValidationResult,
  ValidationError,
} from './types.js';

/**
 * Bayer 4x4 dithering matrix
 * Values are normalized to 0-15 range for threshold comparison
 */
const BAYER_4X4_MATRIX = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

/**
 * Default monochrome conversion options
 */
const DEFAULT_MONO_OPTIONS: Required<MonochromeOptions> = {
  threshold: 128,
  dithering: 'none',
  invert: false,
};

/**
 * Implementation of the MonochromeConverter interface
 */
export class MonochromeConverterImpl implements MonochromeConverter {
  /**
   * Convert RGBA frames to monochrome frames
   */
  toMonochrome(
    frames: FrameRGBA[],
    options: MonochromeOptions = {}
  ): FrameMono[] {
    const opts = { ...DEFAULT_MONO_OPTIONS, ...options };

    // Validate options
    const validation = this.validateOptions(opts);
    if (!validation.isValid) {
      throw new Error(
        `Invalid monochrome options: ${validation.errors[0]?.message}`
      );
    }

    return frames.map(frame => {
      if (opts.dithering === 'bayer4') {
        return this.applyBayerDithering(frame, opts.threshold);
      } else {
        return this.applyThresholdConversion(frame, opts);
      }
    });
  }

  /**
   * Calculate luminance using standard formula: 0.299*R + 0.587*G + 0.114*B
   */
  calculateLuminance(r: number, g: number, b: number): number {
    return Math.round(0.299 * r + 0.587 * g + 0.114 * b);
  }

  /**
   * Apply threshold to luminance value
   */
  applyThreshold(luminance: number, threshold: number): boolean {
    return luminance >= threshold;
  }

  /**
   * Apply Bayer 4x4 dithering to a frame
   */
  applyBayerDithering(frame: FrameRGBA, threshold: number): FrameMono {
    const { pixels, dims } = frame;
    const { width, height } = dims;
    const totalPixels = width * height;

    // Create output bit array (1 bit per pixel, packed into bytes)
    const bitsPerByte = 8;
    const byteCount = Math.ceil(totalPixels / bitsPerByte);
    const bits = new Uint8Array(byteCount);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixelIndex = (y * width + x) * 4; // RGBA = 4 bytes per pixel
        const r = pixels[pixelIndex] ?? 0;
        const g = pixels[pixelIndex + 1] ?? 0;
        const b = pixels[pixelIndex + 2] ?? 0;

        // Calculate luminance
        const luminance = this.calculateLuminance(r, g, b);

        // Get Bayer matrix value for this position
        const bayerX = x % 4;
        const bayerY = y % 4;
        const bayerRow = BAYER_4X4_MATRIX[bayerY];
        if (!bayerRow) {
          throw new Error(`Invalid Bayer matrix row: ${bayerY}`);
        }
        const bayerValue = bayerRow[bayerX];
        if (bayerValue === undefined) {
          throw new Error(
            `Invalid Bayer matrix value at [${bayerY}][${bayerX}]`
          );
        }

        // Apply dithering: adjust threshold based on Bayer matrix
        // Bayer values 0-15 map to threshold adjustments of -32 to +32
        const adjustedThreshold = threshold + (bayerValue - 7.5) * 4;

        // Determine if pixel should be lit
        const isLit = luminance >= adjustedThreshold;

        // Set bit in output array
        this.setBitInArray(bits, y * width + x, isLit);
      }
    }

    return {
      bits,
      dims,
    };
  }

  /**
   * Apply simple threshold conversion without dithering
   */
  private applyThresholdConversion(
    frame: FrameRGBA,
    options: Required<MonochromeOptions>
  ): FrameMono {
    const { pixels, dims } = frame;
    const { width, height } = dims;
    const { threshold, invert } = options;
    const totalPixels = width * height;

    // Create output bit array
    const bitsPerByte = 8;
    const byteCount = Math.ceil(totalPixels / bitsPerByte);
    const bits = new Uint8Array(byteCount);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixelIndex = (y * width + x) * 4; // RGBA = 4 bytes per pixel
        const r = pixels[pixelIndex] ?? 0;
        const g = pixels[pixelIndex + 1] ?? 0;
        const b = pixels[pixelIndex + 2] ?? 0;

        // Calculate luminance
        const luminance = this.calculateLuminance(r, g, b);

        // Apply threshold
        let isLit = this.applyThreshold(luminance, threshold);

        // Apply invert if requested
        if (invert) {
          isLit = !isLit;
        }

        // Set bit in output array
        this.setBitInArray(bits, y * width + x, isLit);
      }
    }

    return {
      bits,
      dims,
    };
  }

  /**
   * Set a specific bit in a Uint8Array
   */
  private setBitInArray(
    array: Uint8Array,
    bitIndex: number,
    value: boolean
  ): void {
    const byteIndex = Math.floor(bitIndex / 8);
    const bitPosition = bitIndex % 8;

    if (byteIndex >= array.length) {
      throw new Error(
        `Bit index ${bitIndex} out of bounds for array of length ${array.length}`
      );
    }

    if (value) {
      array[byteIndex]! |= 1 << bitPosition;
    } else {
      array[byteIndex]! &= ~(1 << bitPosition);
    }
  }

  /**
   * Validate monochrome conversion options
   */
  private validateOptions(
    options: Required<MonochromeOptions>
  ): ValidationResult {
    const errors: ValidationError[] = [];

    // Validate threshold range
    if (options.threshold < 0 || options.threshold > 255) {
      errors.push({
        type: 'invalid_parameters',
        message: `Threshold must be between 0 and 255, got ${options.threshold}`,
        context: { threshold: options.threshold },
      });
    }

    // Validate dithering option
    if (!['none', 'bayer4'].includes(options.dithering)) {
      errors.push({
        type: 'invalid_parameters',
        message: `Invalid dithering option: ${options.dithering}. Must be 'none' or 'bayer4'`,
        context: { dithering: options.dithering },
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: [],
    };
  }
}

/**
 * Default instance of the monochrome converter
 */
export const monochromeConverter = new MonochromeConverterImpl();

/**
 * Convenience function for converting frames to monochrome
 */
export function toMonochrome(
  frames: FrameRGBA[],
  options?: MonochromeOptions
): FrameMono[] {
  return monochromeConverter.toMonochrome(frames, options);
}

/**
 * Convenience function for calculating luminance
 */
export function calculateLuminance(r: number, g: number, b: number): number {
  return monochromeConverter.calculateLuminance(r, g, b);
}

/**
 * Utility function to get a bit from a Uint8Array
 */
export function getBitFromArray(array: Uint8Array, bitIndex: number): boolean {
  const byteIndex = Math.floor(bitIndex / 8);
  const bitPosition = bitIndex % 8;

  if (byteIndex >= array.length) {
    throw new Error(
      `Bit index ${bitIndex} out of bounds for array of length ${array.length}`
    );
  }

  return (array[byteIndex]! & (1 << bitPosition)) !== 0;
}

/**
 * Utility function to create a test frame with specific pixels set
 */
export function createTestFrameRGBA(
  width: number,
  height: number,
  setPixels: Array<{
    x: number;
    y: number;
    r: number;
    g: number;
    b: number;
    a?: number;
  }>
): FrameRGBA {
  const pixels = new Uint8ClampedArray(width * height * 4);

  // Initialize all pixels to transparent black
  pixels.fill(0);

  // Set specified pixels
  for (const pixel of setPixels) {
    const index = (pixel.y * width + pixel.x) * 4;
    pixels[index] = pixel.r;
    pixels[index + 1] = pixel.g;
    pixels[index + 2] = pixel.b;
    pixels[index + 3] = pixel.a ?? 255;
  }

  return {
    pixels,
    dims: { width, height },
  };
}

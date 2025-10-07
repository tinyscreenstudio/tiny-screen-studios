// Byte packer module for Tiny Screen Studios
// Converts monochrome frames to device-specific byte layouts

import type {
  FrameMono,
  PackedFrame,
  PackingOptions,
  BytePacker,
  DevicePreset,
  PresetConfig,
  ValidationResult,
  ValidationError,
} from '../types/index.js';
import { getPresetConfig, getExpectedByteCount } from '../config/presets.js';
import { getBitFromArray } from '../converters/mono.js';

/**
 * Default packing options
 */
const DEFAULT_PACKING_OPTIONS: Required<Omit<PackingOptions, 'preset'>> = {
  invert: false,
  bitOrder: 'lsb-top',
  pageOrder: 'top-down',
  columnOrder: 'left-right',
};

/**
 * Implementation of the BytePacker interface
 */
export class BytePackerImpl implements BytePacker {
  /**
   * Pack monochrome frames into device-specific byte layouts
   */
  packFrames(frames: FrameMono[], options: PackingOptions): PackedFrame[] {
    const config = this.getPresetConfig(options.preset);
    const packingOpts = { ...DEFAULT_PACKING_OPTIONS, ...options };

    return frames.map(frame => {
      // Validate frame dimensions
      const validation = this.validateFrameDimensions(frame, config);
      if (!validation.isValid) {
        throw new Error(
          `Frame validation failed: ${validation.errors[0]?.message}`
        );
      }

      let bytes: Uint8Array;

      if (options.preset.startsWith('SSD1306')) {
        bytes = this.packSSD1306(frame, { ...config, ...packingOpts });
      } else if (options.preset === 'SH1106_132x64') {
        bytes = this.packSH1106(frame, { ...config, ...packingOpts });
      } else {
        throw new Error(`Unsupported device preset: ${options.preset}`);
      }

      const packedFrame: PackedFrame = {
        bytes,
        dims: frame.dims,
        preset: options.preset,
      };

      // Validate packed frame
      const packedValidation = this.validatePackedFrame(packedFrame);
      if (!packedValidation.isValid) {
        throw new Error(
          `Packed frame validation failed: ${packedValidation.errors[0]?.message}`
        );
      }

      return packedFrame;
    });
  }

  /**
   * Get preset configuration
   */
  getPresetConfig(preset: DevicePreset): PresetConfig {
    return getPresetConfig(preset);
  }

  /**
   * Pack frame for SSD1306 displays (128x32 and 128x64)
   */
  packSSD1306(
    frame: FrameMono,
    config: PresetConfig & { invert?: boolean }
  ): Uint8Array {
    const { bits, dims } = frame;
    const { width, height } = dims;
    const { pageHeight, bitOrder, pageOrder, columnOrder, invert } = config;

    // Calculate number of pages (8-pixel vertical strips)
    const pageCount = height / pageHeight;
    const totalBytes = width * pageCount;
    const bytes = new Uint8Array(totalBytes);

    // Process each page
    for (let page = 0; page < pageCount; page++) {
      // Determine actual page index based on page order
      const actualPage = pageOrder === 'top-down' ? page : pageCount - 1 - page;

      // Process each column in the page
      for (let col = 0; col < width; col++) {
        // Determine actual column index based on column order
        const actualCol = columnOrder === 'left-right' ? col : width - 1 - col;

        let pageByte = 0;

        // Pack 8 pixels into one byte (vertical strip)
        for (let pixelInPage = 0; pixelInPage < pageHeight; pixelInPage++) {
          const y = actualPage * pageHeight + pixelInPage;
          const x = actualCol;

          // Get pixel from monochrome frame
          const pixelIndex = y * width + x;
          let isLit = getBitFromArray(bits, pixelIndex);

          // Apply invert if specified
          if (invert) {
            isLit = !isLit;
          }

          if (isLit) {
            if (bitOrder === 'lsb-top') {
              // LSB = top pixel (bit 0 = top, bit 7 = bottom)
              pageByte |= 1 << pixelInPage;
            } else {
              // MSB = top pixel (bit 7 = top, bit 0 = bottom)
              pageByte |= 1 << (pageHeight - 1 - pixelInPage);
            }
          }
        }

        // Store byte in output array
        const byteIndex = page * width + col;
        bytes[byteIndex] = pageByte;
      }
    }

    return bytes;
  }

  /**
   * Pack frame for SH1106 displays (132x64 with 128-pixel viewport)
   * SH1106 has 132 physical columns but only shows columns 2-129 (128 visible pixels)
   */
  packSH1106(
    frame: FrameMono,
    config: PresetConfig & { invert?: boolean }
  ): Uint8Array {
    const { bits, dims } = frame;
    const { width, height } = dims;
    const { pageHeight, bitOrder, pageOrder, columnOrder, invert } = config;

    // SH1106 physical width is 132, but input frame should be 132x64
    if (width !== 132 || height !== 64) {
      throw new Error(`SH1106 requires 132x64 frame, got ${width}x${height}`);
    }

    // Calculate number of pages (8-pixel vertical strips)
    const pageCount = height / pageHeight; // 8 pages for 64-pixel height
    const physicalWidth = 132; // SH1106 physical width
    const totalBytes = physicalWidth * pageCount;
    const bytes = new Uint8Array(totalBytes);

    // Process each page
    for (let page = 0; page < pageCount; page++) {
      // Determine actual page index based on page order
      const actualPage = pageOrder === 'top-down' ? page : pageCount - 1 - page;

      // Process each column in the page (all 132 physical columns)
      for (let col = 0; col < physicalWidth; col++) {
        // Determine actual column index based on column order
        const actualCol =
          columnOrder === 'left-right' ? col : physicalWidth - 1 - col;

        let pageByte = 0;

        // Pack 8 pixels into one byte (vertical strip)
        for (let pixelInPage = 0; pixelInPage < pageHeight; pixelInPage++) {
          const y = actualPage * pageHeight + pixelInPage;
          const x = actualCol;

          // Get pixel from monochrome frame
          const pixelIndex = y * width + x;
          let isLit = getBitFromArray(bits, pixelIndex);

          // Apply invert if specified
          if (invert) {
            isLit = !isLit;
          }

          if (isLit) {
            if (bitOrder === 'lsb-top') {
              // LSB = top pixel (bit 0 = top, bit 7 = bottom)
              pageByte |= 1 << pixelInPage;
            } else {
              // MSB = top pixel (bit 7 = top, bit 0 = bottom)
              pageByte |= 1 << (pageHeight - 1 - pixelInPage);
            }
          }
        }

        // Store byte in output array
        const byteIndex = page * physicalWidth + col;
        bytes[byteIndex] = pageByte;
      }
    }

    return bytes;
  }

  /**
   * Validate that a packed frame has the expected byte count
   */
  validatePackedFrame(frame: PackedFrame): ValidationResult {
    const errors: ValidationError[] = [];
    const expectedByteCount = getExpectedByteCount(frame.preset);

    if (frame.bytes.length !== expectedByteCount) {
      errors.push({
        type: 'byte_count_error',
        message: `Byte count mismatch for ${frame.preset}. Expected ${expectedByteCount}, got ${frame.bytes.length}`,
        context: {
          expected: expectedByteCount,
          actual: frame.bytes.length,
          preset: frame.preset,
        },
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: [],
    };
  }

  /**
   * Validate frame dimensions against preset configuration
   */
  private validateFrameDimensions(
    frame: FrameMono,
    config: PresetConfig
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const { width, height } = frame.dims;

    if (width !== config.width || height !== config.height) {
      errors.push({
        type: 'dimension_mismatch',
        message: `Frame dimensions ${width}×${height} don't match preset requirements ${config.width}×${config.height}`,
        context: {
          expected: { width: config.width, height: config.height },
          actual: frame.dims,
        },
      });
    }

    // Validate that height is divisible by page height
    if (height % config.pageHeight !== 0) {
      errors.push({
        type: 'invalid_parameters',
        message: `Frame height ${height} must be divisible by page height ${config.pageHeight}`,
        context: {
          height,
          pageHeight: config.pageHeight,
        },
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
 * Default instance of the byte packer
 */
export const bytePacker = new BytePackerImpl();

/**
 * Convenience function for packing frames
 */
export function packFrames(
  frames: FrameMono[],
  options: PackingOptions
): PackedFrame[] {
  return bytePacker.packFrames(frames, options);
}

// Integration tests for byte packer orchestration
// Tests complete workflows across all device presets

import { describe, it, expect } from 'vitest';
import { BytePackerImpl } from './ssd1306.js';
import { createTestFrameRGBA, toMonochrome } from '../converters/mono.js';
import type {
  FrameRGBA,
  PackingOptions,
  DevicePreset,
  PackedFrame,
} from '../types/index.js';

/**
 * Create a test RGBA frame with a specific pattern
 */
function createPatternFrameRGBA(
  width: number,
  height: number,
  pattern: 'solid' | 'checkerboard' | 'stripes' | 'border' | 'single-pixel'
): FrameRGBA {
  const setPixels: Array<{
    x: number;
    y: number;
    r: number;
    g: number;
    b: number;
  }> = [];

  switch (pattern) {
    case 'solid':
      // Fill entire frame with white pixels
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          setPixels.push({ x, y, r: 255, g: 255, b: 255 });
        }
      }
      break;

    case 'checkerboard':
      // Create checkerboard pattern (8x8 squares)
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const squareX = Math.floor(x / 8);
          const squareY = Math.floor(y / 8);
          if ((squareX + squareY) % 2 === 0) {
            setPixels.push({ x, y, r: 255, g: 255, b: 255 });
          }
        }
      }
      break;

    case 'stripes':
      // Create vertical stripes (8 pixels wide)
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (Math.floor(x / 8) % 2 === 0) {
            setPixels.push({ x, y, r: 255, g: 255, b: 255 });
          }
        }
      }
      break;

    case 'border':
      // Create border around the frame
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
            setPixels.push({ x, y, r: 255, g: 255, b: 255 });
          }
        }
      }
      break;

    case 'single-pixel':
      // Single pixel at center
      setPixels.push({
        x: Math.floor(width / 2),
        y: Math.floor(height / 2),
        r: 255,
        g: 255,
        b: 255,
      });
      break;
  }

  return createTestFrameRGBA(width, height, setPixels);
}

/**
 * Validate that packed frame has expected properties
 */
function validatePackedFrame(
  frame: unknown,
  preset: DevicePreset,
  expectedByteCount: number
): void {
  expect(frame).toBeDefined();
  const packedFrame = frame as PackedFrame;
  expect(packedFrame.bytes).toBeInstanceOf(Uint8Array);
  expect(packedFrame.bytes.length).toBe(expectedByteCount);
  expect(packedFrame.preset).toBe(preset);
  expect(packedFrame.dims).toBeDefined();
  expect(packedFrame.dims.width).toBeGreaterThan(0);
  expect(packedFrame.dims.height).toBeGreaterThan(0);
}

describe('Byte Packer Integration Tests', () => {
  const packer = new BytePackerImpl();

  describe('SSD1306_128x32 Integration', () => {
    const preset: DevicePreset = 'SSD1306_128x32';
    const width = 128;
    const height = 32;
    const expectedByteCount = 512; // 128 * 4 pages

    it('should handle complete workflow: RGBA → Mono → Packed (solid pattern)', () => {
      // Create RGBA frame
      const rgbaFrame = createPatternFrameRGBA(width, height, 'solid');
      expect(rgbaFrame.pixels.length).toBe(width * height * 4);

      // Convert to monochrome
      const monoFrames = toMonochrome([rgbaFrame], { threshold: 128 });
      expect(monoFrames).toHaveLength(1);
      expect(monoFrames[0].dims).toEqual({ width, height });

      // Pack for device
      const options: PackingOptions = { preset };
      const packedFrames = packer.packFrames(monoFrames, options);

      expect(packedFrames).toHaveLength(1);
      validatePackedFrame(packedFrames[0], preset, expectedByteCount);

      // All bytes should be 0xFF for solid white pattern
      for (let i = 0; i < packedFrames[0].bytes.length; i++) {
        expect(packedFrames[0].bytes[i]).toBe(0xff);
      }
    });

    it('should handle complete workflow: RGBA → Mono → Packed (checkerboard pattern)', () => {
      const rgbaFrame = createPatternFrameRGBA(width, height, 'checkerboard');
      const monoFrames = toMonochrome([rgbaFrame], { threshold: 128 });
      const options: PackingOptions = { preset };
      const packedFrames = packer.packFrames(monoFrames, options);

      expect(packedFrames).toHaveLength(1);
      validatePackedFrame(packedFrames[0], preset, expectedByteCount);

      // Verify checkerboard pattern is preserved
      // First 8x8 square should be all white (0xFF)
      for (let page = 0; page < 1; page++) {
        for (let col = 0; col < 8; col++) {
          const byteIndex = page * width + col;
          expect(packedFrames[0].bytes[byteIndex]).toBe(0xff);
        }
      }

      // Second 8x8 square should be all black (0x00)
      for (let page = 0; page < 1; page++) {
        for (let col = 8; col < 16; col++) {
          const byteIndex = page * width + col;
          expect(packedFrames[0].bytes[byteIndex]).toBe(0x00);
        }
      }
    });

    it('should handle complete workflow with packing options', () => {
      const rgbaFrame = createPatternFrameRGBA(width, height, 'single-pixel');
      const monoFrames = toMonochrome([rgbaFrame], { threshold: 128 });

      // Test with different packing options
      const options: PackingOptions = {
        preset,
        invert: true,
        bitOrder: 'msb-top',
        pageOrder: 'bottom-up',
        columnOrder: 'right-left',
      };

      const packedFrames = packer.packFrames(monoFrames, options);

      expect(packedFrames).toHaveLength(1);
      validatePackedFrame(packedFrames[0], preset, expectedByteCount);

      // With invert=true, most bytes should be 0xFF except where the pixel was
      let nonFFCount = 0;
      for (let i = 0; i < packedFrames[0].bytes.length; i++) {
        if (packedFrames[0].bytes[i] !== 0xff) {
          nonFFCount++;
        }
      }
      expect(nonFFCount).toBe(1); // Only one byte should be different due to the single pixel
    });

    it('should handle multiple frames in sequence', () => {
      const frame1 = createPatternFrameRGBA(width, height, 'single-pixel');
      const frame2 = createPatternFrameRGBA(width, height, 'border');
      const frame3 = createPatternFrameRGBA(width, height, 'stripes');

      const monoFrames = toMonochrome([frame1, frame2, frame3], {
        threshold: 128,
      });
      const options: PackingOptions = { preset };
      const packedFrames = packer.packFrames(monoFrames, options);

      expect(packedFrames).toHaveLength(3);

      // Validate each frame
      for (let i = 0; i < 3; i++) {
        validatePackedFrame(packedFrames[i], preset, expectedByteCount);
      }

      // Frame 1 (single pixel) should have mostly zeros
      const frame1NonZeroCount = Array.from(packedFrames[0].bytes).filter(
        b => b !== 0
      ).length;
      expect(frame1NonZeroCount).toBe(1);

      // Frame 2 (border) should have non-zero bytes at edges
      const frame2NonZeroCount = Array.from(packedFrames[1].bytes).filter(
        b => b !== 0
      ).length;
      expect(frame2NonZeroCount).toBeGreaterThan(10); // Border should have many pixels

      // Frame 3 (stripes) should have alternating pattern
      const frame3NonZeroCount = Array.from(packedFrames[2].bytes).filter(
        b => b !== 0
      ).length;
      expect(frame3NonZeroCount).toBeGreaterThan(50); // Stripes should have many pixels
    });

    it('should validate frame dimensions correctly', () => {
      const wrongFrame = createPatternFrameRGBA(64, 32, 'solid'); // Wrong width
      const monoFrames = toMonochrome([wrongFrame], { threshold: 128 });
      const options: PackingOptions = { preset };

      expect(() => {
        packer.packFrames(monoFrames, options);
      }).toThrow(
        "Frame dimensions 64×32 don't match preset requirements 128×32"
      );
    });

    it('should validate byte count after packing', () => {
      const rgbaFrame = createPatternFrameRGBA(width, height, 'solid');
      const monoFrames = toMonochrome([rgbaFrame], { threshold: 128 });
      const options: PackingOptions = { preset };
      const packedFrames = packer.packFrames(monoFrames, options);

      // Validate using the packer's own validation
      const validation = packer.validatePackedFrame(packedFrames[0]);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  describe('SSD1306_128x64 Integration', () => {
    const preset: DevicePreset = 'SSD1306_128x64';
    const width = 128;
    const height = 64;
    const expectedByteCount = 1024; // 128 * 8 pages

    it('should handle complete workflow: RGBA → Mono → Packed (solid pattern)', () => {
      const rgbaFrame = createPatternFrameRGBA(width, height, 'solid');
      const monoFrames = toMonochrome([rgbaFrame], { threshold: 128 });
      const options: PackingOptions = { preset };
      const packedFrames = packer.packFrames(monoFrames, options);

      expect(packedFrames).toHaveLength(1);
      validatePackedFrame(packedFrames[0], preset, expectedByteCount);

      // All bytes should be 0xFF for solid white pattern
      for (let i = 0; i < packedFrames[0].bytes.length; i++) {
        expect(packedFrames[0].bytes[i]).toBe(0xff);
      }
    });

    it('should handle complete workflow: RGBA → Mono → Packed (border pattern)', () => {
      const rgbaFrame = createPatternFrameRGBA(width, height, 'border');
      const monoFrames = toMonochrome([rgbaFrame], { threshold: 128 });
      const options: PackingOptions = { preset };
      const packedFrames = packer.packFrames(monoFrames, options);

      expect(packedFrames).toHaveLength(1);
      validatePackedFrame(packedFrames[0], preset, expectedByteCount);

      // Top border: first page should have top bit set for all columns
      for (let col = 0; col < width; col++) {
        expect(packedFrames[0].bytes[col] & 0x01).toBe(0x01); // Top bit
      }

      // Bottom border: last page should have bottom bit set for all columns
      const lastPageStart = 7 * width; // Page 7
      for (let col = 0; col < width; col++) {
        expect(packedFrames[0].bytes[lastPageStart + col] & 0x80).toBe(0x80); // Bottom bit
      }

      // Left border: first column of each page should have all bits set
      for (let page = 0; page < 8; page++) {
        const byteIndex = page * width; // First column of each page
        expect(packedFrames[0].bytes[byteIndex]).toBe(0xff);
      }

      // Right border: last column of each page should have all bits set
      for (let page = 0; page < 8; page++) {
        const byteIndex = page * width + (width - 1); // Last column of each page
        expect(packedFrames[0].bytes[byteIndex]).toBe(0xff);
      }
    });

    it('should handle different monochrome conversion options', () => {
      const rgbaFrame = createPatternFrameRGBA(width, height, 'checkerboard');

      // Test with different thresholds
      const monoFrames1 = toMonochrome([rgbaFrame], { threshold: 64 });
      const monoFrames2 = toMonochrome([rgbaFrame], { threshold: 192 });

      const options: PackingOptions = { preset };
      const packedFrames1 = packer.packFrames(monoFrames1, options);
      const packedFrames2 = packer.packFrames(monoFrames2, options);

      expect(packedFrames1).toHaveLength(1);
      expect(packedFrames2).toHaveLength(1);

      // Lower threshold should result in more lit pixels
      const litPixels1 = Array.from(packedFrames1[0].bytes).reduce(
        (sum, byte) => sum + popcount(byte),
        0
      );
      const litPixels2 = Array.from(packedFrames2[0].bytes).reduce(
        (sum, byte) => sum + popcount(byte),
        0
      );

      expect(litPixels1).toBeGreaterThanOrEqual(litPixels2);
    });

    it('should validate dimensions correctly', () => {
      const wrongFrame = createPatternFrameRGBA(width, 32, 'solid'); // Wrong height
      const monoFrames = toMonochrome([wrongFrame], { threshold: 128 });
      const options: PackingOptions = { preset };

      expect(() => {
        packer.packFrames(monoFrames, options);
      }).toThrow(
        "Frame dimensions 128×32 don't match preset requirements 128×64"
      );
    });
  });

  describe('SH1106_132x64 Integration', () => {
    const preset: DevicePreset = 'SH1106_132x64';
    const width = 132;
    const height = 64;
    const expectedByteCount = 1056; // 132 * 8 pages

    it('should handle complete workflow: RGBA → Mono → Packed (solid pattern)', () => {
      const rgbaFrame = createPatternFrameRGBA(width, height, 'solid');
      const monoFrames = toMonochrome([rgbaFrame], { threshold: 128 });
      const options: PackingOptions = { preset };
      const packedFrames = packer.packFrames(monoFrames, options);

      expect(packedFrames).toHaveLength(1);
      validatePackedFrame(packedFrames[0], preset, expectedByteCount);

      // All bytes should be 0xFF for solid white pattern
      for (let i = 0; i < packedFrames[0].bytes.length; i++) {
        expect(packedFrames[0].bytes[i]).toBe(0xff);
      }
    });

    it('should handle viewport area correctly', () => {
      // Create pattern that tests viewport boundaries
      const setPixels: Array<{
        x: number;
        y: number;
        r: number;
        g: number;
        b: number;
      }> = [];

      // Set pixels in off-screen left area (columns 0-1)
      setPixels.push({ x: 0, y: 0, r: 255, g: 255, b: 255 });
      setPixels.push({ x: 1, y: 0, r: 255, g: 255, b: 255 });

      // Set pixels in viewport area (columns 2-129)
      setPixels.push({ x: 2, y: 0, r: 255, g: 255, b: 255 }); // Viewport start
      setPixels.push({ x: 129, y: 0, r: 255, g: 255, b: 255 }); // Viewport end

      // Set pixels in off-screen right area (columns 130-131)
      setPixels.push({ x: 130, y: 0, r: 255, g: 255, b: 255 });
      setPixels.push({ x: 131, y: 0, r: 255, g: 255, b: 255 });

      const rgbaFrame = createTestFrameRGBA(width, height, setPixels);
      const monoFrames = toMonochrome([rgbaFrame], { threshold: 128 });
      const options: PackingOptions = { preset };
      const packedFrames = packer.packFrames(monoFrames, options);

      expect(packedFrames).toHaveLength(1);
      validatePackedFrame(packedFrames[0], preset, expectedByteCount);

      // Verify all specified pixels are set
      expect(packedFrames[0].bytes[0] & 0x01).toBe(0x01); // Column 0
      expect(packedFrames[0].bytes[1] & 0x01).toBe(0x01); // Column 1
      expect(packedFrames[0].bytes[2] & 0x01).toBe(0x01); // Column 2 (viewport start)
      expect(packedFrames[0].bytes[129] & 0x01).toBe(0x01); // Column 129 (viewport end)
      expect(packedFrames[0].bytes[130] & 0x01).toBe(0x01); // Column 130
      expect(packedFrames[0].bytes[131] & 0x01).toBe(0x01); // Column 131
    });

    it('should handle complete workflow with all packing options', () => {
      const rgbaFrame = createPatternFrameRGBA(width, height, 'stripes');
      const monoFrames = toMonochrome([rgbaFrame], {
        threshold: 128,
        invert: true,
      });

      const options: PackingOptions = {
        preset,
        bitOrder: 'msb-top',
        pageOrder: 'bottom-up',
        columnOrder: 'right-left',
      };

      const packedFrames = packer.packFrames(monoFrames, options);

      expect(packedFrames).toHaveLength(1);
      validatePackedFrame(packedFrames[0], preset, expectedByteCount);

      // Verify that options were applied (exact verification would be complex,
      // but we can check that the result is different from default)
      const defaultOptions: PackingOptions = { preset };
      const defaultFrames = packer.packFrames(monoFrames, defaultOptions);

      // Results should be different due to different options
      let differenceCount = 0;
      for (let i = 0; i < expectedByteCount; i++) {
        if (packedFrames[0].bytes[i] !== defaultFrames[0].bytes[i]) {
          differenceCount++;
        }
      }
      expect(differenceCount).toBeGreaterThan(0);
    });

    it('should validate dimensions correctly', () => {
      const wrongFrame = createPatternFrameRGBA(128, 64, 'solid'); // Wrong width
      const monoFrames = toMonochrome([wrongFrame], { threshold: 128 });
      const options: PackingOptions = { preset };

      expect(() => {
        packer.packFrames(monoFrames, options);
      }).toThrow(
        "Frame dimensions 128×64 don't match preset requirements 132×64"
      );
    });
  });

  describe('Cross-Preset Validation', () => {
    it('should handle all presets with same input pattern', () => {
      const presets: Array<{
        preset: DevicePreset;
        width: number;
        height: number;
        expectedBytes: number;
      }> = [
        {
          preset: 'SSD1306_128x32',
          width: 128,
          height: 32,
          expectedBytes: 512,
        },
        {
          preset: 'SSD1306_128x64',
          width: 128,
          height: 64,
          expectedBytes: 1024,
        },
        {
          preset: 'SH1106_132x64',
          width: 132,
          height: 64,
          expectedBytes: 1056,
        },
      ];

      for (const { preset, width, height, expectedBytes } of presets) {
        const rgbaFrame = createPatternFrameRGBA(width, height, 'border');
        const monoFrames = toMonochrome([rgbaFrame], { threshold: 128 });
        const options: PackingOptions = { preset };
        const packedFrames = packer.packFrames(monoFrames, options);

        expect(packedFrames).toHaveLength(1);
        validatePackedFrame(packedFrames[0], preset, expectedBytes);

        // Verify border pattern is preserved for all presets
        // Top-left corner should have a pixel
        expect(packedFrames[0].bytes[0] & 0x01).toBe(0x01);

        // Top-right corner should have a pixel
        const topRightCol = width - 1;
        expect(packedFrames[0].bytes[topRightCol] & 0x01).toBe(0x01);
      }
    });

    it('should reject invalid preset', () => {
      const rgbaFrame = createPatternFrameRGBA(128, 32, 'solid');
      const monoFrames = toMonochrome([rgbaFrame], { threshold: 128 });
      const options = { preset: 'INVALID_PRESET' as DevicePreset };

      expect(() => {
        packer.packFrames(monoFrames, options);
      }).toThrow('Unknown device preset: INVALID_PRESET');
    });

    it('should validate byte counts for all presets', () => {
      const testCases = [
        { preset: 'SSD1306_128x32' as const, expected: 512 },
        { preset: 'SSD1306_128x64' as const, expected: 1024 },
        { preset: 'SH1106_132x64' as const, expected: 1056 },
      ];

      for (const { preset, expected } of testCases) {
        const config = packer.getPresetConfig(preset);
        const calculatedBytes = (config.width * config.height) / 8;
        expect(calculatedBytes).toBe(expected);
      }
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle empty frame array', () => {
      const options: PackingOptions = { preset: 'SSD1306_128x32' };
      const packedFrames = packer.packFrames([], options);

      expect(packedFrames).toHaveLength(0);
    });

    it('should handle frame with all black pixels', () => {
      const rgbaFrame = createTestFrameRGBA(128, 32, []); // No pixels set = all black
      const monoFrames = toMonochrome([rgbaFrame], { threshold: 128 });
      const options: PackingOptions = { preset: 'SSD1306_128x32' };
      const packedFrames = packer.packFrames(monoFrames, options);

      expect(packedFrames).toHaveLength(1);
      validatePackedFrame(packedFrames[0], 'SSD1306_128x32', 512);

      // All bytes should be 0x00 for all black
      for (let i = 0; i < packedFrames[0].bytes.length; i++) {
        expect(packedFrames[0].bytes[i]).toBe(0x00);
      }
    });

    it('should handle frame with single pixel at each corner', () => {
      const width = 128;
      const height = 32;
      const setPixels = [
        { x: 0, y: 0, r: 255, g: 255, b: 255 }, // Top-left
        { x: width - 1, y: 0, r: 255, g: 255, b: 255 }, // Top-right
        { x: 0, y: height - 1, r: 255, g: 255, b: 255 }, // Bottom-left
        { x: width - 1, y: height - 1, r: 255, g: 255, b: 255 }, // Bottom-right
      ];

      const rgbaFrame = createTestFrameRGBA(width, height, setPixels);
      const monoFrames = toMonochrome([rgbaFrame], { threshold: 128 });
      const options: PackingOptions = { preset: 'SSD1306_128x32' };
      const packedFrames = packer.packFrames(monoFrames, options);

      expect(packedFrames).toHaveLength(1);
      validatePackedFrame(packedFrames[0], 'SSD1306_128x32', 512);

      // Verify corner pixels
      expect(packedFrames[0].bytes[0] & 0x01).toBe(0x01); // Top-left
      expect(packedFrames[0].bytes[127] & 0x01).toBe(0x01); // Top-right
      expect(packedFrames[0].bytes[384] & 0x80).toBe(0x80); // Bottom-left (page 3, bit 7)
      expect(packedFrames[0].bytes[511] & 0x80).toBe(0x80); // Bottom-right (page 3, bit 7)
    });

    it('should provide detailed validation errors', () => {
      // Create a frame with wrong dimensions
      const wrongFrame = createPatternFrameRGBA(100, 50, 'solid');
      const monoFrames = toMonochrome([wrongFrame], { threshold: 128 });
      const options: PackingOptions = { preset: 'SSD1306_128x32' };

      let error: Error | undefined;
      try {
        packer.packFrames(monoFrames, options);
      } catch (e) {
        error = e as Error;
      }

      expect(error).toBeDefined();
      expect(error!.message).toContain('Frame validation failed');
      expect(error!.message).toContain(
        "100×50 don't match preset requirements 128×32"
      );
    });
  });
});

/**
 * Count the number of set bits in a byte (population count)
 */
function popcount(byte: number): number {
  let count = 0;
  while (byte) {
    count += byte & 1;
    byte >>>= 1;
  }
  return count;
}

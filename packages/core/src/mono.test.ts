// Unit tests for monochrome conversion module

import { describe, it, expect } from 'vitest';
import {
  MonochromeConverterImpl,
  monochromeConverter,
  toMonochrome,
  calculateLuminance,
  getBitFromArray,
  createTestFrameRGBA,
} from './mono.js';
import type { FrameRGBA } from './types.js';

describe('MonochromeConverter', () => {
  const converter = new MonochromeConverterImpl();

  describe('calculateLuminance', () => {
    it('should calculate luminance using standard formula', () => {
      // Test pure colors
      expect(calculateLuminance(255, 0, 0)).toBe(76); // Red: 0.299 * 255 ≈ 76
      expect(calculateLuminance(0, 255, 0)).toBe(150); // Green: 0.587 * 255 ≈ 150
      expect(calculateLuminance(0, 0, 255)).toBe(29); // Blue: 0.114 * 255 ≈ 29

      // Test white and black
      expect(calculateLuminance(255, 255, 255)).toBe(255);
      expect(calculateLuminance(0, 0, 0)).toBe(0);

      // Test gray
      expect(calculateLuminance(128, 128, 128)).toBe(128);

      // Test specific case
      expect(calculateLuminance(100, 150, 200)).toBe(
        Math.round(0.299 * 100 + 0.587 * 150 + 0.114 * 200)
      );
    });

    it('should handle edge cases', () => {
      expect(calculateLuminance(0, 0, 0)).toBe(0);
      expect(calculateLuminance(255, 255, 255)).toBe(255);
      expect(calculateLuminance(1, 1, 1)).toBe(1);
    });
  });

  describe('applyThreshold', () => {
    it('should apply threshold correctly', () => {
      expect(converter.applyThreshold(127, 128)).toBe(false);
      expect(converter.applyThreshold(128, 128)).toBe(true);
      expect(converter.applyThreshold(129, 128)).toBe(true);
      expect(converter.applyThreshold(0, 128)).toBe(false);
      expect(converter.applyThreshold(255, 128)).toBe(true);
    });

    it('should handle edge thresholds', () => {
      expect(converter.applyThreshold(0, 0)).toBe(true);
      expect(converter.applyThreshold(255, 255)).toBe(true);
      expect(converter.applyThreshold(254, 255)).toBe(false);
    });
  });

  describe('toMonochrome - basic threshold conversion', () => {
    it('should convert single pixel frame with default threshold', () => {
      const frame = createTestFrameRGBA(1, 1, [
        { x: 0, y: 0, r: 255, g: 255, b: 255 }, // White pixel
      ]);

      const result = toMonochrome([frame]);

      expect(result).toHaveLength(1);
      expect(result[0].dims).toEqual({ width: 1, height: 1 });
      expect(getBitFromArray(result[0].bits, 0)).toBe(true); // White should be lit
    });

    it('should convert single pixel frame below threshold', () => {
      const frame = createTestFrameRGBA(1, 1, [
        { x: 0, y: 0, r: 100, g: 100, b: 100 }, // Gray pixel below threshold
      ]);

      const result = toMonochrome([frame]);

      expect(getBitFromArray(result[0].bits, 0)).toBe(false); // Should not be lit
    });

    it('should use custom threshold', () => {
      const frame = createTestFrameRGBA(1, 1, [
        { x: 0, y: 0, r: 100, g: 100, b: 100 }, // Gray pixel
      ]);

      const result = toMonochrome([frame], { threshold: 50 });

      expect(getBitFromArray(result[0].bits, 0)).toBe(true); // Should be lit with lower threshold
    });

    it('should apply invert option', () => {
      const frame = createTestFrameRGBA(1, 1, [
        { x: 0, y: 0, r: 255, g: 255, b: 255 }, // White pixel
      ]);

      const result = toMonochrome([frame], { invert: true });

      expect(getBitFromArray(result[0].bits, 0)).toBe(false); // White should be dark when inverted
    });

    it('should handle 2x2 frame correctly', () => {
      const frame = createTestFrameRGBA(2, 2, [
        { x: 0, y: 0, r: 255, g: 255, b: 255 }, // Top-left: white
        { x: 1, y: 0, r: 0, g: 0, b: 0 }, // Top-right: black
        { x: 0, y: 1, r: 200, g: 200, b: 200 }, // Bottom-left: light gray
        { x: 1, y: 1, r: 50, g: 50, b: 50 }, // Bottom-right: dark gray
      ]);

      const result = toMonochrome([frame], { threshold: 128 });

      expect(result[0].dims).toEqual({ width: 2, height: 2 });
      expect(getBitFromArray(result[0].bits, 0)).toBe(true); // Top-left: white (lit)
      expect(getBitFromArray(result[0].bits, 1)).toBe(false); // Top-right: black (not lit)
      expect(getBitFromArray(result[0].bits, 2)).toBe(true); // Bottom-left: light gray (lit)
      expect(getBitFromArray(result[0].bits, 3)).toBe(false); // Bottom-right: dark gray (not lit)
    });
  });

  describe('toMonochrome - Bayer dithering', () => {
    it('should apply Bayer 4x4 dithering', () => {
      // Create a 4x4 frame with uniform gray that should create a dithering pattern
      const grayValue = 128; // Right at threshold
      const pixels: Array<{
        x: number;
        y: number;
        r: number;
        g: number;
        b: number;
      }> = [];

      for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
          pixels.push({ x, y, r: grayValue, g: grayValue, b: grayValue });
        }
      }

      const frame = createTestFrameRGBA(4, 4, pixels);
      const result = toMonochrome([frame], {
        dithering: 'bayer4',
        threshold: 128,
      });

      expect(result[0].dims).toEqual({ width: 4, height: 4 });

      // With Bayer dithering, we should get a pattern, not all the same value
      const bits: boolean[] = [];
      for (let i = 0; i < 16; i++) {
        bits.push(getBitFromArray(result[0].bits, i));
      }

      // Should have both true and false values (not all the same)
      expect(bits.some(b => b)).toBe(true);
      expect(bits.some(b => !b)).toBe(true);
    });

    it('should handle edge case with very light gray and dithering', () => {
      const frame = createTestFrameRGBA(4, 4, [
        { x: 0, y: 0, r: 200, g: 200, b: 200 },
        { x: 1, y: 0, r: 200, g: 200, b: 200 },
        { x: 2, y: 0, r: 200, g: 200, b: 200 },
        { x: 3, y: 0, r: 200, g: 200, b: 200 },
        { x: 0, y: 1, r: 200, g: 200, b: 200 },
        { x: 1, y: 1, r: 200, g: 200, b: 200 },
        { x: 2, y: 1, r: 200, g: 200, b: 200 },
        { x: 3, y: 1, r: 200, g: 200, b: 200 },
        { x: 0, y: 2, r: 200, g: 200, b: 200 },
        { x: 1, y: 2, r: 200, g: 200, b: 200 },
        { x: 2, y: 2, r: 200, g: 200, b: 200 },
        { x: 3, y: 2, r: 200, g: 200, b: 200 },
        { x: 0, y: 3, r: 200, g: 200, b: 200 },
        { x: 1, y: 3, r: 200, g: 200, b: 200 },
        { x: 2, y: 3, r: 200, g: 200, b: 200 },
        { x: 3, y: 3, r: 200, g: 200, b: 200 },
      ]);

      const result = toMonochrome([frame], {
        dithering: 'bayer4',
        threshold: 128,
      });

      // Light gray (200) should mostly be lit even with dithering
      let litCount = 0;
      for (let i = 0; i < 16; i++) {
        if (getBitFromArray(result[0].bits, i)) {
          litCount++;
        }
      }

      expect(litCount).toBeGreaterThan(8); // Most pixels should be lit
    });
  });

  describe('multiple frames', () => {
    it('should convert multiple frames', () => {
      const frame1 = createTestFrameRGBA(1, 1, [
        { x: 0, y: 0, r: 255, g: 255, b: 255 },
      ]);
      const frame2 = createTestFrameRGBA(1, 1, [
        { x: 0, y: 0, r: 0, g: 0, b: 0 },
      ]);

      const result = toMonochrome([frame1, frame2]);

      expect(result).toHaveLength(2);
      expect(getBitFromArray(result[0].bits, 0)).toBe(true); // First frame: white
      expect(getBitFromArray(result[1].bits, 0)).toBe(false); // Second frame: black
    });

    it('should preserve frame dimensions', () => {
      const frame1 = createTestFrameRGBA(2, 3, []);
      const frame2 = createTestFrameRGBA(4, 1, []);

      const result = toMonochrome([frame1, frame2]);

      expect(result[0].dims).toEqual({ width: 2, height: 3 });
      expect(result[1].dims).toEqual({ width: 4, height: 1 });
    });
  });

  describe('error handling', () => {
    it('should throw error for invalid threshold', () => {
      const frame = createTestFrameRGBA(1, 1, []);

      expect(() => {
        toMonochrome([frame], { threshold: -1 });
      }).toThrow('Invalid monochrome options');

      expect(() => {
        toMonochrome([frame], { threshold: 256 });
      }).toThrow('Invalid monochrome options');
    });

    it('should throw error for invalid dithering option', () => {
      const frame = createTestFrameRGBA(1, 1, []);

      expect(() => {
        toMonochrome([frame], { dithering: 'invalid' as 'none' | 'bayer4' });
      }).toThrow('Invalid monochrome options');
    });

    it('should handle empty frame array', () => {
      const result = toMonochrome([]);
      expect(result).toEqual([]);
    });
  });

  describe('bit array utilities', () => {
    it('should correctly set and get bits', () => {
      const array = new Uint8Array(2); // 16 bits

      // Test setting various bit positions
      const testBits = [0, 1, 7, 8, 9, 15];

      for (const bitIndex of testBits) {
        expect(getBitFromArray(array, bitIndex)).toBe(false); // Initially false
      }

      // Set bits using the internal method (we'll test through conversion)
      const frame = createTestFrameRGBA(4, 4, [
        { x: 0, y: 0, r: 255, g: 255, b: 255 }, // Bit 0
        { x: 1, y: 0, r: 255, g: 255, b: 255 }, // Bit 1
        { x: 3, y: 1, r: 255, g: 255, b: 255 }, // Bit 7
        { x: 0, y: 2, r: 255, g: 255, b: 255 }, // Bit 8
      ]);

      const result = toMonochrome([frame]);

      expect(getBitFromArray(result[0].bits, 0)).toBe(true);
      expect(getBitFromArray(result[0].bits, 1)).toBe(true);
      expect(getBitFromArray(result[0].bits, 7)).toBe(true);
      expect(getBitFromArray(result[0].bits, 8)).toBe(true);
      expect(getBitFromArray(result[0].bits, 2)).toBe(false); // Not set
    });
  });

  describe('edge cases', () => {
    it('should handle 1x1 frame', () => {
      const frame = createTestFrameRGBA(1, 1, [
        { x: 0, y: 0, r: 128, g: 128, b: 128 },
      ]);

      const result = toMonochrome([frame], { threshold: 128 });

      expect(result[0].dims).toEqual({ width: 1, height: 1 });
      expect(result[0].bits).toHaveLength(1);
      expect(getBitFromArray(result[0].bits, 0)).toBe(true);
    });

    it('should handle large frame dimensions', () => {
      const frame = createTestFrameRGBA(128, 64, [
        { x: 0, y: 0, r: 255, g: 255, b: 255 },
        { x: 127, y: 63, r: 255, g: 255, b: 255 },
      ]);

      const result = toMonochrome([frame]);

      expect(result[0].dims).toEqual({ width: 128, height: 64 });
      expect(getBitFromArray(result[0].bits, 0)).toBe(true); // First pixel
      expect(getBitFromArray(result[0].bits, 128 * 64 - 1)).toBe(true); // Last pixel
    });

    it('should handle frames with delay', () => {
      const frame: FrameRGBA = {
        pixels: new Uint8ClampedArray([255, 255, 255, 255]), // 1x1 white pixel
        dims: { width: 1, height: 1 },
        delayMs: 100,
      };

      const result = toMonochrome([frame]);

      expect(result[0].dims).toEqual({ width: 1, height: 1 });
      // Note: delayMs is not preserved in FrameMono as per the type definition
    });
  });

  describe('luminance calculation edge cases', () => {
    it('should handle color combinations that result in specific luminance values', () => {
      // Test combinations that should result in exactly threshold value
      const r = 100,
        g = 50,
        b = 200;
      const expectedLuminance = Math.round(0.299 * r + 0.587 * g + 0.114 * b);

      expect(calculateLuminance(r, g, b)).toBe(expectedLuminance);

      const frame = createTestFrameRGBA(1, 1, [{ x: 0, y: 0, r, g, b }]);
      const result = toMonochrome([frame], { threshold: expectedLuminance });

      expect(getBitFromArray(result[0].bits, 0)).toBe(true); // Should be exactly at threshold
    });
  });
});

describe('module exports', () => {
  it('should export default converter instance', () => {
    expect(monochromeConverter).toBeInstanceOf(MonochromeConverterImpl);
  });

  it('should export convenience functions', () => {
    expect(typeof toMonochrome).toBe('function');
    expect(typeof calculateLuminance).toBe('function');
    expect(typeof getBitFromArray).toBe('function');
    expect(typeof createTestFrameRGBA).toBe('function');
  });
});

/**
 * Integration tests for the complete processing pipeline
 * Tests the interaction between all modules working together
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

import { MonochromeConverterImpl } from '../converters/mono.js';
import { BytePackerImpl } from '../packers/ssd1306.js';
import { CanvasEmulator } from '../emulator/canvas.js';
import { makeByteFiles, toCRawArray } from '../exporters/index.js';

import {
  createTestFrameRGBA,
  createCheckerboardRGBA,
  createGradientRGBA,
  createSolidColorRGBA,
  compareBytes,
} from './utils/test-helpers.js';
import type {
  DevicePreset,
  PackingOptions,
  MonochromeOptions,
  FrameRGBA,
} from '../types/index.js';

describe('Integration Tests', () => {
  let monoConverter: MonochromeConverterImpl;
  let packer: BytePackerImpl;
  let emulator: CanvasEmulator;

  beforeEach(() => {
    monoConverter = new MonochromeConverterImpl();
    packer = new BytePackerImpl();
    emulator = new CanvasEmulator();
  });

  describe('Complete Processing Pipeline', () => {
    it('should process RGBA frames through complete pipeline', () => {
      // Step 1: Create test RGBA frames
      const rgbaFrames: FrameRGBA[] = [
        createCheckerboardRGBA(128, 32, 8),
        createGradientRGBA(128, 32, 'horizontal'),
        createSolidColorRGBA(128, 32, 255, 255, 255, 255),
      ];

      // Step 2: Convert to monochrome
      const monoOptions: MonochromeOptions = {
        threshold: 128,
        dithering: 'none',
      };
      const monoFrames = monoConverter.toMonochrome(rgbaFrames, monoOptions);

      expect(monoFrames).toHaveLength(3);
      monoFrames.forEach(frame => {
        expect(frame.dims.width).toBe(128);
        expect(frame.dims.height).toBe(32);
        expect(frame.bits).toBeInstanceOf(Uint8Array);
      });

      // Step 3: Pack for device
      const packingOptions: PackingOptions = { preset: 'SSD1306_128x32' };
      const packedFrames = packer.packFrames(monoFrames, packingOptions);

      expect(packedFrames).toHaveLength(3);
      packedFrames.forEach(frame => {
        expect(frame.bytes.length).toBe(512); // 128x32 / 8 = 512 bytes
        expect(frame.preset).toBe('SSD1306_128x32');
        expect(frame.dims.width).toBe(128);
        expect(frame.dims.height).toBe(32);
      });

      // Step 4: Export to different formats
      const cArrayOutput = toCRawArray(packedFrames, 'test_frames');
      expect(cArrayOutput).toContain('const uint8_t test_frames');
      expect(cArrayOutput).toContain('0x');

      const binaryFiles = makeByteFiles(packedFrames, 'test');
      expect(binaryFiles).toHaveLength(3);
      binaryFiles.forEach((file, index) => {
        expect(file.name).toBe(
          `test_frame_${index.toString().padStart(3, '0')}.bin`
        );
        expect(file.data.length).toBe(512);
      });
    });

    it('should handle different device presets consistently', () => {
      const rgbaFrame = createCheckerboardRGBA(128, 64, 16);
      const monoFrame = monoConverter.toMonochrome([rgbaFrame], {
        threshold: 128,
      })[0]!;

      const presets: DevicePreset[] = ['SSD1306_128x64'];

      presets.forEach(preset => {
        const config = packer.getPresetConfig(preset);

        // Adjust frame dimensions to match preset
        let testFrame = monoFrame;
        if (config.width !== 128 || config.height !== 64) {
          const adjustedRgba = createCheckerboardRGBA(
            config.width,
            config.height,
            16
          );
          testFrame = monoConverter.toMonochrome([adjustedRgba], {
            threshold: 128,
          })[0]!;
        }

        const packed = packer.packFrames([testFrame], { preset });

        expect(packed).toHaveLength(1);
        expect(packed[0]!.preset).toBe(preset);
        expect(packed[0]!.dims.width).toBe(config.width);
        expect(packed[0]!.dims.height).toBe(config.height);

        const expectedByteCount = (config.width * config.height) / 8;
        expect(packed[0]!.bytes.length).toBe(expectedByteCount);
      });
    });

    it('should handle SH1106 viewport correctly in pipeline', () => {
      // Create frame for SH1106 (132x64)
      const rgbaFrame = createCheckerboardRGBA(132, 64, 8);
      const monoFrame = monoConverter.toMonochrome([rgbaFrame], {
        threshold: 128,
      })[0]!;
      const packedFrame = packer.packFrames([monoFrame], {
        preset: 'SH1106_132x64',
      })[0]!;

      expect(packedFrame.dims.width).toBe(132);
      expect(packedFrame.dims.height).toBe(64);
      expect(packedFrame.bytes.length).toBe(1056); // 132 * 8 pages

      // Verify viewport area has data
      let hasViewportData = false;
      for (let col = 2; col <= 129; col++) {
        if (packedFrame.bytes[col] !== 0) {
          hasViewportData = true;
          break;
        }
      }
      expect(hasViewportData).toBe(true);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle dimension mismatches gracefully', () => {
      const wrongSizeFrame = createTestFrameRGBA(64, 32); // Wrong size for SSD1306_128x32
      const monoFrame = monoConverter.toMonochrome([wrongSizeFrame], {
        threshold: 128,
      })[0]!;

      expect(() => {
        packer.packFrames([monoFrame], { preset: 'SSD1306_128x32' });
      }).toThrow(/dimensions.*don't match/i);
    });

    it('should handle empty frame arrays', () => {
      expect(() => {
        monoConverter.toMonochrome([], { threshold: 128 });
      }).not.toThrow();

      expect(() => {
        packer.packFrames([], { preset: 'SSD1306_128x32' });
      }).not.toThrow();

      const emptyMono = monoConverter.toMonochrome([], { threshold: 128 });
      const emptyPacked = packer.packFrames([], { preset: 'SSD1306_128x32' });

      expect(emptyMono).toHaveLength(0);
      expect(emptyPacked).toHaveLength(0);
    });

    it('should handle invalid packing options', () => {
      const frame = createTestFrameRGBA(128, 32);
      const monoFrame = monoConverter.toMonochrome([frame], {
        threshold: 128,
      })[0]!;

      expect(() => {
        packer.packFrames([monoFrame], {
          preset: 'INVALID_PRESET' as DevicePreset,
        });
      }).toThrow(/unknown.*preset/i);
    });
  });

  describe('Data Consistency Integration', () => {
    it('should maintain pixel accuracy through pipeline', () => {
      // Create a frame with known pixel pattern
      const setPixels = [
        { x: 0, y: 0, r: 255, g: 255, b: 255, a: 255 }, // Top-left (should be white)
        { x: 127, y: 0, r: 255, g: 255, b: 255, a: 255 }, // Top-right (should be white)
        { x: 0, y: 31, r: 255, g: 255, b: 255, a: 255 }, // Bottom-left (should be white)
        { x: 127, y: 31, r: 255, g: 255, b: 255, a: 255 }, // Bottom-right (should be white)
        { x: 64, y: 16, r: 0, g: 0, b: 0, a: 255 }, // Center (should be black)
      ];

      const rgbaFrame = createTestFrameRGBA(128, 32, setPixels);
      const monoFrame = monoConverter.toMonochrome([rgbaFrame], {
        threshold: 128,
      })[0]!;
      const packedFrame = packer.packFrames([monoFrame], {
        preset: 'SSD1306_128x32',
      })[0]!;

      // Verify corner pixels are set in packed data
      expect(packedFrame.bytes[0] & 0x01).toBe(0x01); // Top-left: page 0, col 0, bit 0
      expect(packedFrame.bytes[127] & 0x01).toBe(0x01); // Top-right: page 0, col 127, bit 0
      expect(packedFrame.bytes[384] & 0x80).toBe(0x80); // Bottom-left: page 3, col 0, bit 7
      expect(packedFrame.bytes[511] & 0x80).toBe(0x80); // Bottom-right: page 3, col 127, bit 7

      // Verify center pixel is not set (black)
      expect(packedFrame.bytes[256 + 64] & 0x01).toBe(0x00); // Center: page 2, col 64, bit 0
    });

    it('should handle different monochrome options consistently', () => {
      const rgbaFrame = createGradientRGBA(128, 32, 'horizontal');

      const options: MonochromeOptions[] = [
        { threshold: 64, dithering: 'none' },
        { threshold: 128, dithering: 'none' },
        { threshold: 192, dithering: 'none' },
        { threshold: 128, dithering: 'bayer4' },
      ];

      const results = options.map(option => {
        const monoFrame = monoConverter.toMonochrome([rgbaFrame], option)[0]!;
        const packedFrame = packer.packFrames([monoFrame], {
          preset: 'SSD1306_128x32',
        })[0]!;
        return { option, packedFrame };
      });

      // All results should have same dimensions and structure
      results.forEach(({ packedFrame }) => {
        expect(packedFrame.bytes.length).toBe(512);
        expect(packedFrame.dims.width).toBe(128);
        expect(packedFrame.dims.height).toBe(32);
      });

      // Different thresholds should produce different results
      const threshold64 = results[0]!.packedFrame.bytes;
      const threshold128 = results[1]!.packedFrame.bytes;
      const threshold192 = results[2]!.packedFrame.bytes;

      const comparison1 = compareBytes(threshold64, threshold128);
      const comparison2 = compareBytes(threshold128, threshold192);

      expect(comparison1.isEqual).toBe(false);
      expect(comparison2.isEqual).toBe(false);
    });
  });

  describe('Canvas Emulation Integration', () => {
    it('should render packed frames to canvas', () => {
      // Create a mock canvas context
      const mockCanvas = {
        width: 256,
        height: 64,
        getContext: (): CanvasRenderingContext2D => ({
          canvas: { width: 256, height: 64 },
          imageSmoothingEnabled: true,
          fillStyle: '#000000',
          fillRect: vi.fn(),
          clearRect: vi.fn(),
          putImageData: vi.fn(),
          createImageData: (w: number, h: number) => ({
            width: w,
            height: h,
            data: new Uint8ClampedArray(w * h * 4),
          }),
        }),
      } as HTMLCanvasElement;

      const ctx = mockCanvas.getContext('2d');

      // Create test frame
      const rgbaFrame = createCheckerboardRGBA(128, 32, 8);
      const monoFrame = monoConverter.toMonochrome([rgbaFrame], {
        threshold: 128,
      })[0]!;
      const packedFrame = packer.packFrames([monoFrame], {
        preset: 'SSD1306_128x32',
      })[0]!;

      // Render to canvas (should not throw)
      expect(() => {
        emulator.renderFrameToCanvas(ctx, packedFrame, { scale: 2 });
      }).not.toThrow();

      // Verify canvas methods were called
      expect(ctx.fillRect).toHaveBeenCalled();
    });
  });

  describe('Export Format Integration', () => {
    it('should export consistent data across formats', () => {
      const rgbaFrame = createSolidColorRGBA(128, 32, 255, 255, 255, 255);
      const monoFrame = monoConverter.toMonochrome([rgbaFrame], {
        threshold: 128,
      })[0]!;
      const packedFrame = packer.packFrames([monoFrame], {
        preset: 'SSD1306_128x32',
      })[0]!;

      // Export as C array
      const cArray = toCRawArray([packedFrame], 'solid_white');
      expect(cArray).toContain('const uint8_t solid_white');
      expect(cArray).toContain('0xFF'); // All bytes should be 0xFF for solid white

      // Export as binary
      const binaryFiles = makeByteFiles([packedFrame], 'solid_white');
      expect(binaryFiles).toHaveLength(1);
      expect(binaryFiles[0]!.data.length).toBe(512);

      // All bytes should be 0xFF
      for (let i = 0; i < binaryFiles[0]!.data.length; i++) {
        expect(binaryFiles[0]!.data[i]).toBe(0xff);
      }
    });

    it('should handle multi-frame exports correctly', () => {
      const frames = [
        createSolidColorRGBA(128, 32, 255, 255, 255, 255), // White
        createSolidColorRGBA(128, 32, 0, 0, 0, 255), // Black
        createCheckerboardRGBA(128, 32, 8), // Checkerboard
      ];

      const monoFrames = monoConverter.toMonochrome(frames, { threshold: 128 });
      const packedFrames = packer.packFrames(monoFrames, {
        preset: 'SSD1306_128x32',
      });

      // Export as separate binary files
      const binaryFiles = makeByteFiles(packedFrames, 'multi_frame');
      expect(binaryFiles).toHaveLength(3);

      binaryFiles.forEach((file, index) => {
        expect(file.name).toBe(
          `multi_frame_frame_${index.toString().padStart(3, '0')}.bin`
        );
        expect(file.data.length).toBe(512);
      });

      // Export as single C array
      const cArray = toCRawArray(packedFrames, 'multi_frame', {
        perFrame: false,
      });
      expect(cArray).toContain('const uint8_t multi_frame');

      // Should contain data for all frames
      const expectedTotalBytes = 512 * 3;
      const hexMatches = cArray.match(/0x[0-9a-fA-F]{2}/g);
      expect(hexMatches?.length).toBe(expectedTotalBytes);
    });
  });
});

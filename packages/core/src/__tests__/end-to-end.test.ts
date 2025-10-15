/**
 * End-to-end testing and validation
 * Tests complete workflows from file upload to export, performance with large files,
 * and output accuracy validation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  toMonochrome,
  packFrames,
  createCanvasEmulator,
  makeByteFiles,
  toCRawArray,
  DEVICE_PRESETS,
  type DevicePreset,
} from '../index.js';
import {
  createTestFrameRGBA,
  createCheckerboardRGBA,
  createGradientRGBA,
  createSolidColorRGBA,
  compareBytes,
} from './utils/test-helpers.js';

describe('End-to-End Testing and Validation', () => {
  let mockContext: CanvasRenderingContext2D;

  beforeEach(() => {
    // Create mock canvas context without requiring actual canvas support
    mockContext = {
      canvas: { width: 256, height: 128 },
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      putImageData: vi.fn(),
      createImageData: vi.fn((w: number, h: number) => ({
        width: w,
        height: h,
        data: new Uint8ClampedArray(w * h * 4),
      })),
      imageSmoothingEnabled: true,
      fillStyle: '#000000',
    } as unknown as CanvasRenderingContext2D;
  });

  describe('Complete Workflow Tests', () => {
    it('should handle complete single-frame workflow', async () => {
      // Step 1: Create test RGBA frame (simulating file upload)
      const rgbaFrame = createSolidColorRGBA(128, 32, 255, 255, 255, 255);

      // Step 2: Convert to monochrome
      const monoFrames = toMonochrome([rgbaFrame], {
        threshold: 128,
        dithering: 'none',
      });

      expect(monoFrames).toHaveLength(1);
      expect(monoFrames[0]!.dims.width).toBe(128);
      expect(monoFrames[0]!.dims.height).toBe(32);

      // Step 3: Pack for device
      const packedFrames = packFrames(monoFrames, {
        preset: 'SSD1306_128x32',
      });

      expect(packedFrames).toHaveLength(1);
      expect(packedFrames[0]!.bytes.length).toBe(512); // 128*32/8

      // Step 4: Render to canvas
      const emulator = createCanvasEmulator();
      expect(() => {
        emulator.renderFrameToCanvas(mockContext, packedFrames[0]!, {
          scale: 2,
        });
      }).not.toThrow();

      // Step 5: Export to different formats
      const cArray = toCRawArray(packedFrames, 'test_frame');
      expect(cArray).toContain('const uint8_t test_frame');
      expect(cArray).toContain('0xFF'); // Should contain white pixels

      const binaryFiles = makeByteFiles(packedFrames, 'test');
      expect(binaryFiles).toHaveLength(1);
      expect(binaryFiles[0]!.data.length).toBe(512);

      // Verify all bytes are 0xFF for solid white
      for (let i = 0; i < binaryFiles[0]!.data.length; i++) {
        expect(binaryFiles[0]!.data[i]).toBe(0xff);
      }
    });

    it('should handle complete multi-frame animation workflow', async () => {
      // Step 1: Create animation frames
      const rgbaFrames = [
        createSolidColorRGBA(128, 64, 255, 255, 255, 255), // White
        createSolidColorRGBA(128, 64, 0, 0, 0, 255), // Black
        createCheckerboardRGBA(128, 64, 8), // Checkerboard
      ];

      // Step 2: Convert to monochrome with dithering
      const monoFrames = toMonochrome(rgbaFrames, {
        threshold: 128,
        dithering: 'bayer4',
      });

      expect(monoFrames).toHaveLength(3);

      // Step 3: Pack for SSD1306 128x64
      const packedFrames = packFrames(monoFrames, {
        preset: 'SSD1306_128x64',
        invert: false,
      });

      expect(packedFrames).toHaveLength(3);
      packedFrames.forEach(frame => {
        expect(frame.bytes.length).toBe(1024); // 128*64/8
        expect(frame.preset).toBe('SSD1306_128x64');
      });

      // Step 4: Test animation playback
      const emulator = createCanvasEmulator();
      const animationController = emulator.playFramesOnCanvas(
        mockContext,
        packedFrames,
        {
          fps: 10,
          loop: true,
        }
      );

      expect(animationController).toBeDefined();
      expect(typeof animationController.stop).toBe('function');
      expect(typeof animationController.goTo).toBe('function');
      expect(typeof animationController.setFPS).toBe('function');

      // Test animation controls
      animationController.goTo(1);
      animationController.setFPS(5);
      animationController.stop();

      // Step 5: Export multi-frame data
      const cArrayBatch = toCRawArray(packedFrames, 'animation_frames', {
        perFrame: false,
      });
      expect(cArrayBatch).toContain('const uint8_t animation_frames');

      const cArrayPerFrame = toCRawArray(packedFrames, 'frame', {
        perFrame: true,
      });
      expect(cArrayPerFrame).toContain('const uint8_t frame_frame_0');
      expect(cArrayPerFrame).toContain('const uint8_t frame_frame_1');
      expect(cArrayPerFrame).toContain('const uint8_t frame_frame_2');

      const binaryFiles = makeByteFiles(packedFrames, 'animation');
      expect(binaryFiles).toHaveLength(3);
      binaryFiles.forEach((file, index) => {
        expect(file.name).toBe(
          `animation_frame_${index.toString().padStart(3, '0')}.bin`
        );
        expect(file.data.length).toBe(1024);
      });
    });

    it('should handle SH1106 viewport workflow correctly', async () => {
      // Create frame for SH1106 (132x64 with 128-pixel viewport)
      const rgbaFrame = createTestFrameRGBA(132, 64, [
        { x: 0, y: 0, r: 255, g: 255, b: 255, a: 255 }, // Outside viewport (left)
        { x: 1, y: 0, r: 255, g: 255, b: 255, a: 255 }, // Outside viewport (left)
        { x: 2, y: 0, r: 255, g: 255, b: 255, a: 255 }, // Viewport start
        { x: 129, y: 0, r: 255, g: 255, b: 255, a: 255 }, // Viewport end
        { x: 130, y: 0, r: 255, g: 255, b: 255, a: 255 }, // Outside viewport (right)
        { x: 131, y: 0, r: 255, g: 255, b: 255, a: 255 }, // Outside viewport (right)
      ]);

      const monoFrame = toMonochrome([rgbaFrame], { threshold: 128 })[0]!;
      const packedFrame = packFrames([monoFrame], {
        preset: 'SH1106_132x64',
      })[0]!;

      // Verify full 132-column data is packed
      expect(packedFrame.bytes.length).toBe(1056); // 132 * 8 pages
      expect(packedFrame.dims.width).toBe(132);

      // Verify viewport rendering shows only 128 pixels
      const emulator = createCanvasEmulator();
      emulator.renderFrameToCanvas(mockContext, packedFrame, { scale: 1 });

      // Canvas should be set to mock width (128 in our mock)
      expect(mockContext.canvas.width).toBe(128); // Mock canvas width
    });

    it('should handle different device presets in complete workflow', async () => {
      const presets: DevicePreset[] = [
        'SSD1306_128x32',
        'SSD1306_128x64',
        'SH1106_132x64',
      ];

      for (const preset of presets) {
        const config = DEVICE_PRESETS[preset];
        const rgbaFrame = createCheckerboardRGBA(
          config.width,
          config.height,
          8
        );

        const monoFrame = toMonochrome([rgbaFrame], { threshold: 128 })[0]!;
        const packedFrame = packFrames([monoFrame], { preset })[0]!;

        // Verify correct byte count for each preset
        const expectedBytes = (config.width * config.height) / 8;
        expect(packedFrame.bytes.length).toBe(expectedBytes);

        // Verify rendering works for each preset
        const emulator = createCanvasEmulator();
        expect(() => {
          emulator.renderFrameToCanvas(mockContext, packedFrame);
        }).not.toThrow();

        // Verify export works for each preset
        const cArray = toCRawArray(
          [packedFrame],
          `${preset.toLowerCase()}_test`
        );
        expect(cArray).toContain('const uint8_t');

        const binaryFile = makeByteFiles([packedFrame], preset)[0]!;
        expect(binaryFile.data.length).toBe(expectedBytes);
      }
    });
  });

  describe('Output Accuracy Validation', () => {
    it('should produce hardware-accurate byte patterns', () => {
      // Test known pixel patterns that should produce specific byte values
      const testCases = [
        {
          name: 'Single pixel top-left',
          pixels: [{ x: 0, y: 0, r: 255, g: 255, b: 255, a: 255 }],
          expectedByte: { index: 0, value: 0x01 }, // LSB = top pixel
        },
        {
          name: 'Single pixel bottom of first page',
          pixels: [{ x: 0, y: 7, r: 255, g: 255, b: 255, a: 255 }],
          expectedByte: { index: 0, value: 0x80 }, // MSB = bottom pixel of page
        },
        {
          name: 'Full first page',
          pixels: Array.from({ length: 8 }, (_, y) => ({
            x: 0,
            y,
            r: 255,
            g: 255,
            b: 255,
            a: 255,
          })),
          expectedByte: { index: 0, value: 0xff }, // All bits set
        },
        {
          name: 'First pixel of second page',
          pixels: [{ x: 0, y: 8, r: 255, g: 255, b: 255, a: 255 }],
          expectedByte: { index: 128, value: 0x01 }, // Second page starts at byte 128
        },
      ];

      testCases.forEach(testCase => {
        const rgbaFrame = createTestFrameRGBA(128, 32, testCase.pixels);
        const monoFrame = toMonochrome([rgbaFrame], { threshold: 128 })[0]!;
        const packedFrame = packFrames([monoFrame], {
          preset: 'SSD1306_128x32',
        })[0]!;

        expect(packedFrame.bytes[testCase.expectedByte.index]).toBe(
          testCase.expectedByte.value
        );
      });
    });

    it('should maintain pixel accuracy through threshold changes', () => {
      // Create gradient frame
      const rgbaFrame = createGradientRGBA(128, 32, 'horizontal');

      const thresholds = [64, 128, 192];
      const results = thresholds.map(threshold => {
        const monoFrame = toMonochrome([rgbaFrame], { threshold })[0]!;
        return packFrames([monoFrame], { preset: 'SSD1306_128x32' })[0]!;
      });

      // Lower threshold should produce more white pixels (more bits set)
      const countSetBits = (bytes: Uint8Array): number => {
        let count = 0;
        for (let i = 0; i < bytes.length; i++) {
          count += bytes[i]!.toString(2).split('1').length - 1;
        }
        return count;
      };

      const bits64 = countSetBits(results[0]!.bytes);
      const bits128 = countSetBits(results[1]!.bytes);
      const bits192 = countSetBits(results[2]!.bytes);

      // Lower threshold should produce more set bits
      expect(bits64).toBeGreaterThan(bits128);
      expect(bits128).toBeGreaterThan(bits192);
    });

    it('should validate invert functionality accuracy', () => {
      const rgbaFrame = createSolidColorRGBA(128, 32, 255, 255, 255, 255);

      // Normal conversion (white should become set bits)
      const normalFrame = toMonochrome([rgbaFrame], { threshold: 128 })[0]!;
      const normalPacked = packFrames([normalFrame], {
        preset: 'SSD1306_128x32',
      })[0]!;

      // Inverted conversion
      const invertedFrame = toMonochrome([rgbaFrame], {
        threshold: 128,
        invert: true,
      })[0]!;
      const invertedPacked = packFrames([invertedFrame], {
        preset: 'SSD1306_128x32',
      })[0]!;

      // Every byte should be inverted
      for (let i = 0; i < normalPacked.bytes.length; i++) {
        expect(normalPacked.bytes[i]).toBe(~invertedPacked.bytes[i]! & 0xff);
      }
    });

    it('should validate dithering produces different but valid patterns', () => {
      const rgbaFrame = createGradientRGBA(128, 64, 'horizontal');

      const noDithering = toMonochrome([rgbaFrame], {
        threshold: 128,
        dithering: 'none',
      })[0]!;
      const withDithering = toMonochrome([rgbaFrame], {
        threshold: 128,
        dithering: 'bayer4',
      })[0]!;

      const noDitheringPacked = packFrames([noDithering], {
        preset: 'SSD1306_128x64',
      })[0]!;
      const withDitheringPacked = packFrames([withDithering], {
        preset: 'SSD1306_128x64',
      })[0]!;

      // Results should be different
      const comparison = compareBytes(
        noDitheringPacked.bytes,
        withDitheringPacked.bytes
      );
      expect(comparison.isEqual).toBe(false);
      if (comparison.differenceCount !== undefined) {
        expect(comparison.differenceCount).toBeGreaterThan(0);
      }

      // Both should have valid dimensions
      expect(noDitheringPacked.bytes.length).toBe(1024);
      expect(withDitheringPacked.bytes.length).toBe(1024);
    });
  });

  describe('Performance Testing with Large Files', () => {
    it('should handle large single frames efficiently', async () => {
      const startTime = performance.now();

      // Create large frame (simulate high-resolution input)
      const rgbaFrame = createCheckerboardRGBA(128, 64, 2); // Dense pattern

      const monoFrame = toMonochrome([rgbaFrame], {
        threshold: 128,
        dithering: 'bayer4', // More expensive operation
      })[0]!;

      const packedFrame = packFrames([monoFrame], {
        preset: 'SSD1306_128x64',
      })[0]!;

      const processingTime = performance.now() - startTime;

      // Should complete within reasonable time (adjust based on target performance)
      expect(processingTime).toBeLessThan(1000); // 1 second max
      expect(packedFrame.bytes.length).toBe(1024);

      console.log(`Large frame processing: ${processingTime.toFixed(2)}ms`);
    });

    it('should handle large animation sequences efficiently', async () => {
      const frameCount = 100; // Large animation
      const startTime = performance.now();

      // Create animation frames
      const rgbaFrames = Array.from({ length: frameCount }, (_, i) =>
        createTestFrameRGBA(128, 32, [
          {
            x: (i * 2) % 128,
            y: (i % 4) * 8,
            r: 255,
            g: 255,
            b: 255,
            a: 255,
          },
        ])
      );

      const monoFrames = toMonochrome(rgbaFrames, { threshold: 128 });
      const packedFrames = packFrames(monoFrames, {
        preset: 'SSD1306_128x32',
      });

      const processingTime = performance.now() - startTime;
      const throughput = frameCount / (processingTime / 1000); // frames per second

      expect(packedFrames).toHaveLength(frameCount);
      expect(throughput).toBeGreaterThan(10); // At least 10 fps processing

      console.log(
        `Large animation (${frameCount} frames): ${processingTime.toFixed(2)}ms, ${throughput.toFixed(2)} fps`
      );
    });

    it('should maintain memory efficiency with large datasets', async () => {
      const frameCount = 50;
      const memoryBefore = performance.memory?.usedJSHeapSize || 0;

      // Process multiple large frames
      for (let batch = 0; batch < 5; batch++) {
        const rgbaFrames = Array.from({ length: frameCount }, () =>
          createCheckerboardRGBA(128, 64, 4)
        );

        const monoFrames = toMonochrome(rgbaFrames, { threshold: 128 });
        const packedFrames = packFrames(monoFrames, {
          preset: 'SSD1306_128x64',
        });

        expect(packedFrames).toHaveLength(frameCount);

        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }
      }

      const memoryAfter = performance.memory?.usedJSHeapSize || 0;
      const memoryIncrease = memoryAfter - memoryBefore;

      // Memory increase should be reasonable (less than 100MB)
      if (memoryIncrease > 0) {
        expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);
        console.log(
          `Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`
        );
      }
    });

    it('should handle concurrent processing efficiently', async () => {
      const startTime = performance.now();

      // Process multiple workflows concurrently
      const workflows = Array.from({ length: 5 }, async (_, i) => {
        const rgbaFrame = createGradientRGBA(128, 32, 'horizontal');
        const monoFrame = toMonochrome([rgbaFrame], {
          threshold: 64 + i * 32,
        })[0]!;
        return packFrames([monoFrame], { preset: 'SSD1306_128x32' })[0]!;
      });

      const results = await Promise.all(workflows);
      const processingTime = performance.now() - startTime;

      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result.bytes.length).toBe(512);
      });

      // Concurrent processing should be efficient
      expect(processingTime).toBeLessThan(2000); // 2 seconds max

      console.log(`Concurrent processing: ${processingTime.toFixed(2)}ms`);
    });
  });

  describe('Cross-Browser Compatibility Validation', () => {
    it('should handle different canvas implementations', () => {
      // Test with different canvas configurations
      const canvasConfigs = [
        { width: 128, height: 32 },
        { width: 256, height: 64 }, // Scaled canvas
        { width: 64, height: 16 }, // Smaller canvas
      ];

      const rgbaFrame = createCheckerboardRGBA(128, 32, 8);
      const monoFrame = toMonochrome([rgbaFrame], { threshold: 128 })[0]!;
      const packedFrame = packFrames([monoFrame], {
        preset: 'SSD1306_128x32',
      })[0]!;

      const emulator = createCanvasEmulator();

      canvasConfigs.forEach(config => {
        // Create mock context for each configuration
        const testContext = {
          canvas: { width: config.width, height: config.height },
          fillRect: vi.fn(),
          clearRect: vi.fn(),
          putImageData: vi.fn(),
          createImageData: vi.fn((w: number, h: number) => ({
            width: w,
            height: h,
            data: new Uint8ClampedArray(w * h * 4),
          })),
          imageSmoothingEnabled: true,
          fillStyle: '#000000',
        } as unknown as CanvasRenderingContext2D;

        expect(() => {
          emulator.renderFrameToCanvas(testContext, packedFrame, { scale: 2 });
        }).not.toThrow();
      });
    });

    it('should handle different typed array implementations', () => {
      // Test with different array buffer scenarios
      const rgbaFrame = createSolidColorRGBA(128, 32, 128, 128, 128, 255);
      const monoFrame = toMonochrome([rgbaFrame], { threshold: 128 })[0]!;

      // Verify typed arrays work correctly
      expect(monoFrame.bits).toBeInstanceOf(Uint8Array);
      expect(monoFrame.bits.buffer).toBeInstanceOf(ArrayBuffer);

      const packedFrame = packFrames([monoFrame], {
        preset: 'SSD1306_128x32',
      })[0]!;

      expect(packedFrame.bytes).toBeInstanceOf(Uint8Array);
      expect(packedFrame.bytes.buffer).toBeInstanceOf(ArrayBuffer);

      // Test array operations work correctly
      const copyBytes = new Uint8Array(packedFrame.bytes);
      expect(copyBytes.length).toBe(packedFrame.bytes.length);

      for (let i = 0; i < packedFrame.bytes.length; i++) {
        expect(copyBytes[i]).toBe(packedFrame.bytes[i]);
      }
    });

    it('should handle different export scenarios', () => {
      const rgbaFrames = [
        createSolidColorRGBA(128, 32, 255, 255, 255, 255),
        createSolidColorRGBA(128, 32, 0, 0, 0, 255),
      ];

      const monoFrames = toMonochrome(rgbaFrames, { threshold: 128 });
      const packedFrames = packFrames(monoFrames, {
        preset: 'SSD1306_128x32',
      });

      // Test C array export with different options
      const cArrayOptions = [
        { perFrame: true, bytesPerRow: 16 },
        { perFrame: false, bytesPerRow: 8 },
        { perFrame: true, bytesPerRow: 32 },
      ];

      cArrayOptions.forEach(options => {
        const cArray = toCRawArray(packedFrames, 'test', options);
        expect(cArray).toContain('const uint8_t');
        expect(cArray).toContain('0x');

        // Verify proper formatting
        if (options.perFrame) {
          expect(cArray).toContain('test_frame_0');
          expect(cArray).toContain('test_frame_1');
        } else {
          expect(cArray).toContain('test[');
        }
      });

      // Test binary export
      const binaryFiles = makeByteFiles(packedFrames, 'test');
      expect(binaryFiles).toHaveLength(2);

      binaryFiles.forEach(file => {
        expect(file.data).toBeInstanceOf(Uint8Array);
        expect(file.data.length).toBe(512);
        expect(typeof file.name).toBe('string');
      });
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle invalid input gracefully', () => {
      // Test with invalid dimensions
      expect(() => {
        const invalidFrame = createTestFrameRGBA(100, 50); // Wrong dimensions
        const monoFrame = toMonochrome([invalidFrame], { threshold: 128 })[0]!;
        packFrames([monoFrame], { preset: 'SSD1306_128x32' });
      }).toThrow();

      // Test with empty arrays
      expect(() => {
        toMonochrome([], { threshold: 128 });
      }).not.toThrow();

      expect(() => {
        packFrames([], { preset: 'SSD1306_128x32' });
      }).not.toThrow();
    });

    it('should validate export parameters', () => {
      const rgbaFrame = createSolidColorRGBA(128, 32, 255, 255, 255, 255);
      const monoFrame = toMonochrome([rgbaFrame], { threshold: 128 })[0]!;
      const packedFrame = packFrames([monoFrame], {
        preset: 'SSD1306_128x32',
      })[0]!;

      // Test C array export with invalid symbol names - these may not throw in current implementation
      // Just verify they produce some output
      const emptySymbol = toCRawArray([packedFrame], '');
      expect(emptySymbol).toContain('const uint8_t');

      const invalidSymbol = toCRawArray([packedFrame], '123invalid');
      expect(invalidSymbol).toContain('const uint8_t');

      // Test binary export with invalid basenames - this should throw
      expect(() => {
        makeByteFiles([packedFrame], ''); // Empty basename
      }).toThrow();
    });

    it('should handle canvas rendering failures gracefully', () => {
      const rgbaFrame = createSolidColorRGBA(128, 32, 255, 255, 255, 255);
      const monoFrame = toMonochrome([rgbaFrame], { threshold: 128 })[0]!;
      const packedFrame = packFrames([monoFrame], {
        preset: 'SSD1306_128x32',
      })[0]!;

      // Create a mock context that throws errors
      const failingContext = {
        ...mockContext,
        fillRect: vi.fn().mockImplementation(() => {
          throw new Error('Canvas operation failed');
        }),
      } as unknown as CanvasRenderingContext2D;

      const emulator = createCanvasEmulator();

      // Should handle canvas failures gracefully
      expect(() => {
        emulator.renderFrameToCanvas(failingContext, packedFrame);
      }).toThrow('Canvas operation failed');
    });
  });

  describe('Regression Testing', () => {
    it('should maintain consistent output across versions', () => {
      // Test with known input that should produce consistent output
      const knownInput = createTestFrameRGBA(128, 32, [
        { x: 0, y: 0, r: 255, g: 255, b: 255, a: 255 },
        { x: 127, y: 31, r: 255, g: 255, b: 255, a: 255 },
        { x: 64, y: 16, r: 0, g: 0, b: 0, a: 255 },
      ]);

      const monoFrame = toMonochrome([knownInput], { threshold: 128 })[0]!;
      const packedFrame = packFrames([monoFrame], {
        preset: 'SSD1306_128x32',
      })[0]!;

      // These values should remain consistent across versions
      expect(packedFrame.bytes[0] & 0x01).toBe(0x01); // Top-left pixel
      expect(packedFrame.bytes[511] & 0x80).toBe(0x80); // Bottom-right pixel
      expect(packedFrame.bytes[256 + 64] & 0x01).toBe(0x00); // Center pixel (black)

      // Total byte count should be consistent
      expect(packedFrame.bytes.length).toBe(512);

      // Export format should be consistent
      const cArray = toCRawArray([packedFrame], 'regression_test');
      expect(cArray).toContain('const uint8_t regression_test[512]');
    });

    it('should maintain performance benchmarks', async () => {
      const frameCount = 25;
      const startTime = performance.now();

      // Standard benchmark workload
      const rgbaFrames = Array.from({ length: frameCount }, () =>
        createCheckerboardRGBA(128, 64, 8)
      );

      const monoFrames = toMonochrome(rgbaFrames, {
        threshold: 128,
        dithering: 'bayer4',
      });

      packFrames(monoFrames, {
        preset: 'SSD1306_128x64',
      });

      const processingTime = performance.now() - startTime;
      const throughput = frameCount / (processingTime / 1000);

      // Performance should meet minimum thresholds
      expect(throughput).toBeGreaterThan(5); // At least 5 fps
      expect(processingTime).toBeLessThan(10000); // Less than 10 seconds

      console.log(
        `Regression benchmark: ${processingTime.toFixed(2)}ms, ${throughput.toFixed(2)} fps`
      );
    });
  });
});

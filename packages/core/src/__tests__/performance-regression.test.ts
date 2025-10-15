/**
 * Performance regression testing
 * Validates that performance remains within acceptable bounds across versions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  toMonochrome,
  packFrames,
  createCanvasEmulator,
  makeByteFiles,
  toCRawArray,
  type DevicePreset,
} from '../index.js';
import {
  createCheckerboardRGBA,
  createGradientRGBA,
  createSolidColorRGBA,
} from './utils/test-helpers.js';

// Performance baseline thresholds (adjust based on target hardware)
const PERFORMANCE_THRESHOLDS = {
  // Monochrome conversion (frames per second)
  monoConversion: {
    basic: 100, // Basic threshold conversion
    dithering: 25, // With Bayer dithering
  },
  // Byte packing (frames per second)
  bytePacking: {
    ssd1306_128x32: 200,
    ssd1306_128x64: 100,
    sh1106_132x64: 90,
  },
  // End-to-end pipeline (frames per second)
  pipeline: {
    complete: 50,
    largeBatch: 30,
  },
  // Memory usage (MB)
  memory: {
    maxIncrease: 50, // Maximum memory increase during processing
    batchProcessing: 100, // Maximum memory for batch processing
  },
  // Export operations (operations per second)
  export: {
    cArray: 10,
    binary: 50,
  },
};

interface PerformanceResult {
  duration: number;
  throughput: number;
  memoryUsed?: number;
}

function measurePerformance<T>(
  operation: () => T,
  itemCount: number = 1
): PerformanceResult {
  const memoryBefore = performance.memory?.usedJSHeapSize || 0;
  const startTime = performance.now();

  operation();

  const endTime = performance.now();
  const memoryAfter = performance.memory?.usedJSHeapSize || 0;

  const duration = endTime - startTime;
  const throughput = itemCount / (duration / 1000);
  const memoryUsed = memoryAfter - memoryBefore;

  return {
    duration,
    throughput,
    memoryUsed: memoryUsed > 0 ? memoryUsed / (1024 * 1024) : undefined, // Convert to MB
  };
}

describe('Performance Regression Testing', () => {
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

  describe('Monochrome Conversion Performance', () => {
    it('should meet basic threshold conversion performance', () => {
      const frameCount = 50;
      const rgbaFrames = Array.from({ length: frameCount }, () =>
        createCheckerboardRGBA(128, 64, 8)
      );

      const result = measurePerformance(() => {
        return toMonochrome(rgbaFrames, { threshold: 128, dithering: 'none' });
      }, frameCount);

      expect(result.throughput).toBeGreaterThanOrEqual(
        PERFORMANCE_THRESHOLDS.monoConversion.basic
      );

      console.log(
        `Basic mono conversion: ${result.duration.toFixed(2)}ms, ${result.throughput.toFixed(2)} fps`
      );

      // Memory usage should be reasonable
      if (result.memoryUsed) {
        expect(result.memoryUsed).toBeLessThan(
          PERFORMANCE_THRESHOLDS.memory.maxIncrease
        );
      }
    });

    it('should meet dithering conversion performance', () => {
      const frameCount = 25; // Fewer frames for more expensive operation
      const rgbaFrames = Array.from({ length: frameCount }, () =>
        createGradientRGBA(128, 64, 'horizontal')
      );

      const result = measurePerformance(() => {
        return toMonochrome(rgbaFrames, {
          threshold: 128,
          dithering: 'bayer4',
        });
      }, frameCount);

      expect(result.throughput).toBeGreaterThanOrEqual(
        PERFORMANCE_THRESHOLDS.monoConversion.dithering
      );

      console.log(
        `Dithering conversion: ${result.duration.toFixed(2)}ms, ${result.throughput.toFixed(2)} fps`
      );
    });

    it('should scale linearly with frame count', () => {
      const frameCounts = [10, 25, 50];
      const results: Array<{ count: number; fps: number }> = [];

      frameCounts.forEach(count => {
        const rgbaFrames = Array.from({ length: count }, () =>
          createCheckerboardRGBA(128, 32, 8)
        );

        const result = measurePerformance(() => {
          return toMonochrome(rgbaFrames, { threshold: 128 });
        }, count);

        results.push({ count, fps: result.fps });
      });

      // Performance should be relatively consistent (within 50% variance)
      const avgFps =
        results.reduce((sum, r) => sum + r.fps, 0) / results.length;
      if (avgFps > 0) {
        results.forEach(result => {
          const variance = Math.abs(result.fps - avgFps) / avgFps;
          expect(variance).toBeLessThan(0.5); // Less than 50% variance
        });
      }

      console.log('Mono conversion scaling:', results);
    });
  });

  describe('Byte Packing Performance', () => {
    it('should meet SSD1306 128x32 packing performance', () => {
      const frameCount = 100;
      const monoFrames = Array.from({ length: frameCount }, () => {
        const rgbaFrame = createCheckerboardRGBA(128, 32, 8);
        return toMonochrome([rgbaFrame], { threshold: 128 })[0]!;
      });

      const result = measurePerformance(() => {
        return packFrames(monoFrames, { preset: 'SSD1306_128x32' });
      }, frameCount);

      expect(result.throughput).toBeGreaterThanOrEqual(
        PERFORMANCE_THRESHOLDS.bytePacking.ssd1306_128x32
      );

      console.log(
        `SSD1306 128x32 packing: ${result.duration.toFixed(2)}ms, ${result.throughput.toFixed(2)} fps`
      );
    });

    it('should meet SSD1306 128x64 packing performance', () => {
      const frameCount = 100;
      const monoFrames = Array.from({ length: frameCount }, () => {
        const rgbaFrame = createCheckerboardRGBA(128, 64, 8);
        return toMonochrome([rgbaFrame], { threshold: 128 })[0]!;
      });

      const result = measurePerformance(() => {
        return packFrames(monoFrames, { preset: 'SSD1306_128x64' });
      }, frameCount);

      expect(result.throughput).toBeGreaterThanOrEqual(
        PERFORMANCE_THRESHOLDS.bytePacking.ssd1306_128x64
      );

      console.log(
        `SSD1306 128x64 packing: ${result.duration.toFixed(2)}ms, ${result.throughput.toFixed(2)} fps`
      );
    });

    it('should meet SH1106 132x64 packing performance', () => {
      const frameCount = 100;
      const monoFrames = Array.from({ length: frameCount }, () => {
        const rgbaFrame = createCheckerboardRGBA(132, 64, 8);
        return toMonochrome([rgbaFrame], { threshold: 128 })[0]!;
      });

      const result = measurePerformance(() => {
        return packFrames(monoFrames, { preset: 'SH1106_132x64' });
      }, frameCount);

      expect(result.throughput).toBeGreaterThanOrEqual(
        PERFORMANCE_THRESHOLDS.bytePacking.sh1106_132x64
      );

      console.log(
        `SH1106 132x64 packing: ${result.duration.toFixed(2)}ms, ${result.throughput.toFixed(2)} fps`
      );
    });

    it('should demonstrate expected performance scaling across presets', () => {
      const frameCount = 50;
      const presets: DevicePreset[] = [
        'SSD1306_128x32',
        'SSD1306_128x64',
        'SH1106_132x64',
      ];

      const results = presets.map(preset => {
        // Create appropriate frame size for each preset
        let rgbaFrame;
        switch (preset) {
          case 'SSD1306_128x32':
            rgbaFrame = createCheckerboardRGBA(128, 32, 8);
            break;
          case 'SSD1306_128x64':
            rgbaFrame = createCheckerboardRGBA(128, 64, 8);
            break;
          case 'SH1106_132x64':
            rgbaFrame = createCheckerboardRGBA(132, 64, 8);
            break;
        }

        const monoFrames = Array.from(
          { length: frameCount },
          () => toMonochrome([rgbaFrame], { threshold: 128 })[0]!
        );

        const result = measurePerformance(() => {
          return packFrames(monoFrames, { preset });
        }, frameCount);

        return {
          preset,
          fps: result.throughput,
          bytesPerFrame: monoFrames[0]!.bits.length,
        };
      });

      // Verify performance scales with data size
      const ssd1306_32 = results.find(r => r.preset === 'SSD1306_128x32')!;
      const ssd1306_64 = results.find(r => r.preset === 'SSD1306_128x64')!;

      // 128x64 should be roughly half the speed of 128x32 (2x the data)
      const speedRatio = ssd1306_32.fps / ssd1306_64.fps;
      expect(speedRatio).toBeGreaterThan(1.5);
      expect(speedRatio).toBeLessThan(2.5);

      console.log('Packing performance scaling:', results);
    });
  });

  describe('End-to-End Pipeline Performance', () => {
    it('should meet complete pipeline performance', () => {
      const frameCount = 25;
      const rgbaFrames = Array.from({ length: frameCount }, (_, i) =>
        createGradientRGBA(128, 64, i % 2 === 0 ? 'horizontal' : 'vertical')
      );

      const result = measurePerformance(() => {
        const monoFrames = toMonochrome(rgbaFrames, {
          threshold: 128,
          dithering: 'bayer4',
        });
        return packFrames(monoFrames, { preset: 'SSD1306_128x64' });
      }, frameCount);

      expect(result.throughput).toBeGreaterThanOrEqual(
        PERFORMANCE_THRESHOLDS.pipeline.complete
      );

      console.log(
        `Complete pipeline: ${result.duration.toFixed(2)}ms, ${result.throughput.toFixed(2)} fps`
      );
    });

    it('should handle large batch processing efficiently', () => {
      const frameCount = 200; // Large batch
      const rgbaFrames = Array.from({ length: frameCount }, () =>
        createCheckerboardRGBA(128, 32, 4)
      );

      const result = measurePerformance(() => {
        const monoFrames = toMonochrome(rgbaFrames, { threshold: 128 });
        return packFrames(monoFrames, { preset: 'SSD1306_128x32' });
      }, frameCount);

      expect(result.throughput).toBeGreaterThanOrEqual(
        PERFORMANCE_THRESHOLDS.pipeline.largeBatch
      );

      // Memory usage should be reasonable for large batches
      if (result.memoryUsed) {
        expect(result.memoryUsed).toBeLessThan(
          PERFORMANCE_THRESHOLDS.memory.batchProcessing
        );
      }

      console.log(
        `Large batch (${frameCount} frames): ${result.duration.toFixed(2)}ms, ${result.throughput.toFixed(2)} fps`
      );
    });

    it('should maintain performance with different processing options', () => {
      const frameCount = 30;
      const rgbaFrames = Array.from({ length: frameCount }, () =>
        createGradientRGBA(128, 32, 'horizontal')
      );

      const options = [
        { threshold: 64, dithering: 'none' as const, invert: false },
        { threshold: 128, dithering: 'none' as const, invert: true },
        { threshold: 192, dithering: 'bayer4' as const, invert: false },
        { threshold: 128, dithering: 'bayer4' as const, invert: true },
      ];

      const results = options.map(option => {
        const result = measurePerformance(() => {
          const monoFrames = toMonochrome(rgbaFrames, option);
          return packFrames(monoFrames, {
            preset: 'SSD1306_128x32',
            invert: option.invert,
          });
        }, frameCount);

        return { option, fps: result.throughput };
      });

      // All options should meet minimum performance
      results.forEach(result => {
        expect(result.fps).toBeGreaterThan(20); // Minimum acceptable performance
      });

      console.log('Performance with different options:', results);
    });
  });

  describe('Canvas Emulation Performance', () => {
    it('should render frames efficiently', () => {
      const frameCount = 50;
      const rgbaFrame = createCheckerboardRGBA(128, 64, 8);
      const monoFrame = toMonochrome([rgbaFrame], { threshold: 128 })[0]!;
      const packedFrame = packFrames([monoFrame], {
        preset: 'SSD1306_128x64',
      })[0]!;

      const emulator = createCanvasEmulator();

      const result = measurePerformance(() => {
        for (let i = 0; i < frameCount; i++) {
          emulator.renderFrameToCanvas(mockContext, packedFrame, { scale: 2 });
        }
      }, frameCount);

      // Should render at least 30 fps
      expect(result.throughput).toBeGreaterThan(30);

      console.log(
        `Canvas rendering: ${result.duration.toFixed(2)}ms, ${result.throughput.toFixed(2)} fps`
      );
    });

    it('should handle animation playback efficiently', () => {
      const frameCount = 20;
      const rgbaFrames = Array.from({ length: frameCount }, (_, i) =>
        createSolidColorRGBA(
          128,
          32,
          (i * 12) % 256,
          128,
          255 - ((i * 12) % 256),
          255
        )
      );

      const monoFrames = toMonochrome(rgbaFrames, { threshold: 128 });
      const packedFrames = packFrames(monoFrames, {
        preset: 'SSD1306_128x32',
      });

      const emulator = createCanvasEmulator();

      const result = measurePerformance(() => {
        const controller = emulator.playFramesOnCanvas(
          mockContext,
          packedFrames,
          {
            fps: 30,
            loop: false,
          }
        );

        // Simulate some animation operations
        controller.goTo(5);
        controller.setFPS(15);
        controller.stop();
      }, 1);

      // Animation setup should be fast
      expect(result.duration).toBeLessThan(100); // Less than 100ms

      console.log(`Animation setup: ${result.duration.toFixed(2)}ms`);
    });
  });

  describe('Export Performance', () => {
    it('should meet C array export performance', () => {
      const frameCount = 10; // Reasonable batch for export testing
      const rgbaFrames = Array.from({ length: frameCount }, () =>
        createCheckerboardRGBA(128, 64, 8)
      );

      const monoFrames = toMonochrome(rgbaFrames, { threshold: 128 });
      const packedFrames = packFrames(monoFrames, {
        preset: 'SSD1306_128x64',
      });

      const result = measurePerformance(() => {
        return toCRawArray(packedFrames, 'test_data', {
          perFrame: false,
          bytesPerRow: 16,
        });
      }, frameCount);

      expect(result.throughput).toBeGreaterThanOrEqual(
        PERFORMANCE_THRESHOLDS.export.cArray
      );

      console.log(
        `C array export: ${result.duration.toFixed(2)}ms, ${result.throughput.toFixed(2)} ops/sec`
      );
    });

    it('should meet binary export performance', () => {
      const frameCount = 50;
      const rgbaFrames = Array.from({ length: frameCount }, () =>
        createSolidColorRGBA(128, 32, 255, 255, 255, 255)
      );

      const monoFrames = toMonochrome(rgbaFrames, { threshold: 128 });
      const packedFrames = packFrames(monoFrames, {
        preset: 'SSD1306_128x32',
      });

      const result = measurePerformance(() => {
        return makeByteFiles(packedFrames, 'test');
      }, frameCount);

      expect(result.throughput).toBeGreaterThanOrEqual(
        PERFORMANCE_THRESHOLDS.export.binary
      );

      console.log(
        `Binary export: ${result.duration.toFixed(2)}ms, ${result.throughput.toFixed(2)} ops/sec`
      );
    });

    it('should handle large export operations efficiently', () => {
      const frameCount = 100;
      const rgbaFrames = Array.from({ length: frameCount }, () =>
        createGradientRGBA(128, 64, 'horizontal')
      );

      const monoFrames = toMonochrome(rgbaFrames, { threshold: 128 });
      const packedFrames = packFrames(monoFrames, {
        preset: 'SSD1306_128x64',
      });

      // Test both export formats with large data
      const cArrayResult = measurePerformance(() => {
        return toCRawArray(packedFrames, 'large_data');
      }, 1);

      const binaryResult = measurePerformance(() => {
        return makeByteFiles(packedFrames, 'large_data');
      }, frameCount);

      // Large exports should complete in reasonable time
      expect(cArrayResult.duration).toBeLessThan(5000); // Less than 5 seconds
      expect(binaryResult.duration).toBeLessThan(2000); // Less than 2 seconds

      console.log(
        `Large C array export: ${cArrayResult.duration.toFixed(2)}ms`
      );
      console.log(`Large binary export: ${binaryResult.duration.toFixed(2)}ms`);
    });
  });

  describe('Memory Usage Regression', () => {
    it('should not leak memory during repeated operations', () => {
      const iterations = 10;
      const frameCount = 20;

      const memoryBefore = performance.memory?.usedJSHeapSize || 0;

      for (let i = 0; i < iterations; i++) {
        const rgbaFrames = Array.from({ length: frameCount }, () =>
          createCheckerboardRGBA(128, 32, 8)
        );

        const monoFrames = toMonochrome(rgbaFrames, { threshold: 128 });
        const packedFrames = packFrames(monoFrames, {
          preset: 'SSD1306_128x32',
        });

        // Use the data to prevent optimization
        expect(packedFrames.length).toBe(frameCount);

        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }
      }

      const memoryAfter = performance.memory?.usedJSHeapSize || 0;
      const memoryIncrease = (memoryAfter - memoryBefore) / (1024 * 1024); // MB

      // Memory increase should be minimal after repeated operations
      if (memoryIncrease > 0) {
        expect(memoryIncrease).toBeLessThan(10); // Less than 10MB increase
      }

      console.log(
        `Memory increase after ${iterations} iterations: ${memoryIncrease.toFixed(2)}MB`
      );
    });

    it('should handle concurrent operations without excessive memory usage', async () => {
      const concurrentOperations = 5;
      const frameCount = 30;

      const memoryBefore = performance.memory?.usedJSHeapSize || 0;

      const operations = Array.from(
        { length: concurrentOperations },
        async (_, i) => {
          const rgbaFrames = Array.from({ length: frameCount }, () =>
            createGradientRGBA(128, 64, 'horizontal')
          );

          const monoFrames = toMonochrome(rgbaFrames, {
            threshold: 64 + i * 32,
          });

          return packFrames(monoFrames, { preset: 'SSD1306_128x64' });
        }
      );

      const results = await Promise.all(operations);

      const memoryAfter = performance.memory?.usedJSHeapSize || 0;
      const memoryIncrease = (memoryAfter - memoryBefore) / (1024 * 1024); // MB

      // Verify all operations completed
      expect(results.length).toBe(concurrentOperations);
      results.forEach(result => {
        expect(result.length).toBe(frameCount);
      });

      // Memory usage should be reasonable for concurrent operations
      if (memoryIncrease > 0) {
        expect(memoryIncrease).toBeLessThan(
          PERFORMANCE_THRESHOLDS.memory.batchProcessing
        );
      }

      console.log(
        `Memory increase for ${concurrentOperations} concurrent operations: ${memoryIncrease.toFixed(2)}MB`
      );
    });
  });

  describe('Performance Consistency', () => {
    it('should maintain consistent performance across multiple runs', () => {
      const runs = 5;
      const frameCount = 25;
      const results: number[] = [];

      for (let run = 0; run < runs; run++) {
        const rgbaFrames = Array.from({ length: frameCount }, () =>
          createCheckerboardRGBA(128, 32, 8)
        );

        const result = measurePerformance(() => {
          const monoFrames = toMonochrome(rgbaFrames, { threshold: 128 });
          return packFrames(monoFrames, { preset: 'SSD1306_128x32' });
        }, frameCount);

        results.push(result.throughput);
      }

      // Calculate coefficient of variation (standard deviation / mean)
      const mean = results.reduce((sum, val) => sum + val, 0) / results.length;
      const variance =
        results.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
        results.length;
      const stdDev = Math.sqrt(variance);
      const coefficientOfVariation = stdDev / mean;

      // Performance should be consistent (CV < 0.5) - more lenient for CI environments
      expect(coefficientOfVariation).toBeLessThan(0.5);

      console.log(
        `Performance consistency: mean=${mean.toFixed(2)} fps, CV=${coefficientOfVariation.toFixed(3)}`
      );
    });

    it('should not degrade with increasing data complexity', () => {
      const complexities = [
        {
          name: 'solid',
          creator: () => createSolidColorRGBA(128, 32, 255, 255, 255, 255),
        },
        {
          name: 'checkerboard_large',
          creator: () => createCheckerboardRGBA(128, 32, 16),
        },
        {
          name: 'checkerboard_small',
          creator: () => createCheckerboardRGBA(128, 32, 2),
        },
        {
          name: 'gradient',
          creator: () => createGradientRGBA(128, 32, 'horizontal'),
        },
      ];

      const results = complexities.map(complexity => {
        const frameCount = 30;
        const rgbaFrames = Array.from(
          { length: frameCount },
          complexity.creator
        );

        const result = measurePerformance(() => {
          const monoFrames = toMonochrome(rgbaFrames, {
            threshold: 128,
            dithering: 'bayer4',
          });
          return packFrames(monoFrames, { preset: 'SSD1306_128x32' });
        }, frameCount);

        return { name: complexity.name, fps: result.throughput };
      });

      // All complexities should meet minimum performance
      results.forEach(result => {
        expect(result.fps).toBeGreaterThan(15); // Minimum acceptable performance
      });

      // Performance shouldn't vary dramatically between complexities
      const maxFps = Math.max(...results.map(r => r.fps));
      const minFps = Math.min(...results.map(r => r.fps));
      const performanceRatio = maxFps / minFps;

      expect(performanceRatio).toBeLessThan(3); // Less than 3x difference

      console.log('Performance by complexity:', results);
    });
  });
});

/**
 * Performance benchmark tests
 * These tests measure processing speed and memory usage for various operations
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  PerformanceBenchmark,
  RegressionTracker,
  createBenchmarkTestData,
} from '../performance/index.js';
import { MonochromeConverterImpl } from '../converters/mono.js';
import { BytePackerImpl } from '../packers/ssd1306.js';
import {
  createTestFrameRGBA,
  createCheckerboardRGBA,
  createGradientRGBA,
} from './utils/test-helpers.js';
import type { DevicePreset } from '../types/index.js';

describe('Performance Benchmarks', () => {
  let benchmark: PerformanceBenchmark;
  let monoConverter: MonochromeConverterImpl;
  let packer: BytePackerImpl;

  beforeEach(() => {
    benchmark = new PerformanceBenchmark();
    monoConverter = new MonochromeConverterImpl();
    packer = new BytePackerImpl();
  });

  describe('Monochrome Conversion Benchmarks', () => {
    it('should benchmark basic threshold conversion', async () => {
      const frameCount = 50;
      const { rgbaFrames } = createBenchmarkTestData(frameCount, {
        width: 128,
        height: 64,
      });

      benchmark.start('mono_conversion_basic');

      const monoFrames = monoConverter.toMonochrome(rgbaFrames, {
        threshold: 128,
      });

      const result = benchmark.end('mono_conversion_basic', frameCount);

      expect(monoFrames).toHaveLength(frameCount);
      expect(result.duration).toBeGreaterThan(0);
      expect(result.throughput).toBeGreaterThan(0);

      // Performance expectations (adjust based on target performance)
      expect(result.throughput).toBeGreaterThan(100); // frames per second

      console.log(
        `Mono conversion: ${result.duration.toFixed(2)}ms, ${result.throughput.toFixed(2)} fps`
      );
    });

    it('should benchmark dithering conversion', async () => {
      const frameCount = 25; // Fewer frames for dithering (more expensive)
      const rgbaFrames = Array.from({ length: frameCount }, (_, i) =>
        createGradientRGBA(128, 64, i % 2 === 0 ? 'horizontal' : 'vertical')
      );

      benchmark.start('mono_conversion_dithering');

      const monoFrames = monoConverter.toMonochrome(rgbaFrames, {
        threshold: 128,
        dithering: 'bayer4',
      });

      const result = benchmark.end('mono_conversion_dithering', frameCount);

      expect(monoFrames).toHaveLength(frameCount);
      expect(result.throughput).toBeGreaterThan(10); // Lower expectation for dithering

      console.log(
        `Dithering conversion: ${result.duration.toFixed(2)}ms, ${result.throughput.toFixed(2)} fps`
      );
    });

    it('should compare different threshold values performance', async () => {
      const frameCount = 30;
      const rgbaFrames = Array.from({ length: frameCount }, () =>
        createCheckerboardRGBA(128, 32, 4)
      );

      const thresholds = [64, 128, 192];
      const results: Array<{ threshold: number; fps: number }> = [];

      for (const threshold of thresholds) {
        benchmark.start(`mono_threshold_${threshold}`);

        monoConverter.toMonochrome(rgbaFrames, { threshold });

        const result = benchmark.end(`mono_threshold_${threshold}`, frameCount);
        results.push({ threshold, fps: result.throughput });
      }

      // Verify that all threshold values produce reasonable performance (> 1 fps)
      // Note: We don't enforce strict consistency as performance varies greatly in CI environments
      results.forEach(result => {
        expect(result.fps).toBeGreaterThan(1);
      });

      console.log('Threshold performance:', results);
    });
  });

  describe('Byte Packing Benchmarks', () => {
    it('should benchmark SSD1306 128x32 packing', async () => {
      const frameCount = 100;
      const monoFrames = Array.from(
        { length: frameCount },
        () =>
          monoConverter.toMonochrome([createCheckerboardRGBA(128, 32, 8)], {
            threshold: 128,
          })[0]!
      );

      benchmark.start('packing_ssd1306_128x32');

      const packedFrames = packer.packFrames(monoFrames, {
        preset: 'SSD1306_128x32',
      });

      const result = benchmark.end('packing_ssd1306_128x32', frameCount);

      expect(packedFrames).toHaveLength(frameCount);
      expect(result.throughput).toBeGreaterThan(200); // Should be fast

      console.log(
        `SSD1306 128x32 packing: ${result.duration.toFixed(2)}ms, ${result.throughput.toFixed(2)} fps`
      );
    });

    it('should benchmark SSD1306 128x64 packing', async () => {
      const frameCount = 100;
      const monoFrames = Array.from(
        { length: frameCount },
        () =>
          monoConverter.toMonochrome([createCheckerboardRGBA(128, 64, 8)], {
            threshold: 128,
          })[0]!
      );

      benchmark.start('packing_ssd1306_128x64');

      const packedFrames = packer.packFrames(monoFrames, {
        preset: 'SSD1306_128x64',
      });

      const result = benchmark.end('packing_ssd1306_128x64', frameCount);

      expect(packedFrames).toHaveLength(frameCount);
      expect(result.throughput).toBeGreaterThan(100); // Slightly slower due to 2x size

      console.log(
        `SSD1306 128x64 packing: ${result.duration.toFixed(2)}ms, ${result.throughput.toFixed(2)} fps`
      );
    });

    it('should benchmark SH1106 132x64 packing', async () => {
      const frameCount = 100;
      const monoFrames = Array.from(
        { length: frameCount },
        () =>
          monoConverter.toMonochrome([createCheckerboardRGBA(132, 64, 8)], {
            threshold: 128,
          })[0]!
      );

      benchmark.start('packing_sh1106_132x64');

      const packedFrames = packer.packFrames(monoFrames, {
        preset: 'SH1106_132x64',
      });

      const result = benchmark.end('packing_sh1106_132x64', frameCount);

      expect(packedFrames).toHaveLength(frameCount);
      expect(result.throughput).toBeGreaterThan(90); // Slightly slower due to wider format

      console.log(
        `SH1106 132x64 packing: ${result.duration.toFixed(2)}ms, ${result.throughput.toFixed(2)} fps`
      );
    });

    it('should compare packing performance across presets', async () => {
      const frameCount = 50;
      const presets: DevicePreset[] = [
        'SSD1306_128x32',
        'SSD1306_128x64',
        'SH1106_132x64',
      ];
      const results: Array<{
        preset: DevicePreset;
        fps: number;
        bytesPerFrame: number;
      }> = [];

      for (const preset of presets) {
        const config = packer.getPresetConfig(preset);
        const monoFrames = Array.from(
          { length: frameCount },
          () =>
            monoConverter.toMonochrome(
              [createCheckerboardRGBA(config.width, config.height, 8)],
              { threshold: 128 }
            )[0]!
        );

        benchmark.start(`packing_comparison_${preset}`);

        const packedFrames = packer.packFrames(monoFrames, { preset });

        const result = benchmark.end(
          `packing_comparison_${preset}`,
          frameCount
        );

        results.push({
          preset,
          fps: result.throughput,
          bytesPerFrame: packedFrames[0]!.bytes.length,
        });
      }

      // Verify that performance scales reasonably with data size
      const ssd1306_32 = results.find(r => r.preset === 'SSD1306_128x32')!;
      const ssd1306_64 = results.find(r => r.preset === 'SSD1306_128x64')!;

      // 128x64 should be roughly half the speed of 128x32 (2x the data)
      const speedRatio = ssd1306_32.fps / ssd1306_64.fps;
      expect(speedRatio).toBeGreaterThan(1.5);
      expect(speedRatio).toBeLessThan(2.5);

      console.log('Packing performance comparison:', results);
    });
  });

  describe('End-to-End Pipeline Benchmarks', () => {
    it('should benchmark complete RGBA to packed pipeline', async () => {
      const frameCount = 25;
      const rgbaFrames = Array.from({ length: frameCount }, (_, i) =>
        createTestFrameRGBA(128, 64, [
          { x: i % 128, y: i % 64, r: 255, g: 255, b: 255, a: 255 },
        ])
      );

      benchmark.start('pipeline_complete');

      // Step 1: Convert to monochrome
      const monoFrames = monoConverter.toMonochrome(rgbaFrames, {
        threshold: 128,
      });

      // Step 2: Pack for device
      const packedFrames = packer.packFrames(monoFrames, {
        preset: 'SSD1306_128x64',
      });

      const result = benchmark.end('pipeline_complete', frameCount);

      expect(packedFrames).toHaveLength(frameCount);
      expect(result.throughput).toBeGreaterThan(50); // End-to-end should still be reasonable

      console.log(
        `Complete pipeline: ${result.duration.toFixed(2)}ms, ${result.throughput.toFixed(2)} fps`
      );
    });

    it('should benchmark large batch processing', async () => {
      const frameCount = 200; // Large batch
      const { rgbaFrames } = createBenchmarkTestData(frameCount, {
        width: 128,
        height: 32,
      });

      benchmark.start('large_batch_processing');

      const monoFrames = monoConverter.toMonochrome(rgbaFrames, {
        threshold: 128,
      });
      const packedFrames = packer.packFrames(monoFrames, {
        preset: 'SSD1306_128x32',
      });

      const result = benchmark.end('large_batch_processing', frameCount);

      expect(packedFrames).toHaveLength(frameCount);

      // Large batches should maintain reasonable throughput
      expect(result.throughput).toBeGreaterThan(30);

      console.log(
        `Large batch (${frameCount} frames): ${result.duration.toFixed(2)}ms, ${result.throughput.toFixed(2)} fps`
      );
    });
  });

  describe('Memory Usage Benchmarks', () => {
    it('should measure memory usage during processing', async () => {
      const frameCount = 100;
      const { rgbaFrames } = createBenchmarkTestData(frameCount, {
        width: 128,
        height: 64,
      });

      // Measure memory before
      const memoryBefore = performance.memory?.usedJSHeapSize || 0;

      benchmark.start('memory_usage_test');

      const monoFrames = monoConverter.toMonochrome(rgbaFrames, {
        threshold: 128,
      });
      const packedFrames = packer.packFrames(monoFrames, {
        preset: 'SSD1306_128x64',
      });

      const result = benchmark.end('memory_usage_test', frameCount);

      // Measure memory after
      const memoryAfter = performance.memory?.usedJSHeapSize || 0;
      const memoryUsed = memoryAfter - memoryBefore;

      expect(packedFrames).toHaveLength(frameCount);

      // Memory usage should be reasonable (less than 50MB for 100 frames)
      if (memoryUsed > 0) {
        expect(memoryUsed).toBeLessThan(50 * 1024 * 1024); // 50MB
        console.log(
          `Memory usage: ${(memoryUsed / 1024 / 1024).toFixed(2)}MB for ${frameCount} frames`
        );
      }

      console.log(`Processing time: ${result.duration.toFixed(2)}ms`);
    });
  });

  describe('Regression Detection', () => {
    it('should detect performance regressions', () => {
      const tracker = new RegressionTracker();

      // Set baseline performance
      const baseline = [
        {
          operation: 'mono_conversion',
          duration: 100,
          throughput: 50,
        },
        {
          operation: 'byte_packing',
          duration: 50,
          throughput: 100,
        },
      ];

      tracker.setBaseline(baseline);

      // Test with regression (50% slower)
      const current = [
        {
          operation: 'mono_conversion',
          duration: 150, // 50% slower
          throughput: 33.33,
        },
        {
          operation: 'byte_packing',
          duration: 50,
          throughput: 100,
        },
      ];

      const { regressions, improvements } = tracker.checkRegressions(current);

      expect(regressions.length).toBeGreaterThan(0);
      expect(regressions.some(r => r.operation === 'mono_conversion')).toBe(
        true
      );
      expect(regressions.some(r => r.metric === 'duration')).toBe(true);
      expect(improvements.length).toBe(0);
    });

    it('should detect performance improvements', () => {
      const tracker = new RegressionTracker();

      // Set baseline performance
      const baseline = [
        {
          operation: 'byte_packing',
          duration: 100,
          throughput: 50,
        },
      ];

      tracker.setBaseline(baseline);

      // Test with improvement (50% faster)
      const current = [
        {
          operation: 'byte_packing',
          duration: 50, // 50% faster
          throughput: 100,
        },
      ];

      const { regressions, improvements } = tracker.checkRegressions(current);

      expect(regressions.length).toBe(0);
      expect(improvements.length).toBeGreaterThan(0);
      expect(improvements.some(i => i.operation === 'byte_packing')).toBe(true);
      expect(improvements.some(i => i.metric === 'duration')).toBe(true);
    });
  });
});

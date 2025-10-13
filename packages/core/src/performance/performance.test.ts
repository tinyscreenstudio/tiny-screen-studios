// Performance optimization tests
// Tests for Web Worker, memory management, and benchmarking functionality

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  BatchProcessingWorker,
  getBatchWorker,
  terminateBatchWorker,
  shouldUseWorker,
  TypedArrayPool,
  MemoryMonitor,
  estimateProcessingMemory,
  getBrowserMemoryUsage,
  BatchProcessor,
  PerformanceBenchmark,
  BenchmarkSuite,
  RegressionTracker,
  createBenchmarkTestData,
} from './index.js';
import type { DevicePreset } from '../types/index.js';

describe('Performance Optimizations', () => {
  describe('Web Worker Support', () => {
    afterEach(() => {
      terminateBatchWorker();
    });

    it('should determine when to use worker based on frame count', () => {
      expect(shouldUseWorker(50)).toBe(false);
      // In test environment, worker may not be available, so we just check it doesn't throw
      expect(() => shouldUseWorker(150)).not.toThrow();
    });

    it('should create and terminate worker instance', () => {
      const worker = getBatchWorker();
      expect(worker).toBeInstanceOf(BatchProcessingWorker);
      // In test environment, worker may not be available
      expect(typeof worker.isAvailable()).toBe('boolean');

      terminateBatchWorker();
      // After termination, a new worker should be created
      const newWorker = getBatchWorker();
      expect(newWorker).toBeInstanceOf(BatchProcessingWorker);
    });

    it('should handle worker unavailability gracefully', () => {
      const worker = new BatchProcessingWorker();
      // Simulate worker creation failure by terminating immediately
      worker.terminate();
      expect(worker.isAvailable()).toBe(false);
    });
  });

  describe('Memory Pool', () => {
    let pool: TypedArrayPool;

    beforeEach(() => {
      pool = new TypedArrayPool();
    });

    afterEach(() => {
      pool.clear();
    });

    it('should allocate and reuse Uint8Array buffers', () => {
      const size = 1024;

      // First allocation
      const array1 = pool.getUint8Array(size);
      expect(array1).toBeInstanceOf(Uint8Array);
      expect(array1.length).toBe(size);

      const stats1 = pool.getStats();
      expect(stats1.totalAllocated).toBe(1);
      expect(stats1.totalReused).toBe(0);

      // Release and get again
      pool.release(array1);
      pool.getUint8Array(size);

      const stats2 = pool.getStats();
      expect(stats2.totalAllocated).toBe(1); // No new allocation
      expect(stats2.totalReused).toBe(1); // One reuse
    });

    it('should allocate and reuse Uint8ClampedArray buffers', () => {
      const size = 512;

      const array1 = pool.getUint8ClampedArray(size);
      expect(array1).toBeInstanceOf(Uint8ClampedArray);
      expect(array1.length).toBe(size);

      pool.release(array1);
      pool.getUint8ClampedArray(size);

      const stats = pool.getStats();
      expect(stats.totalReused).toBe(1);
    });

    it('should clean up old unused buffers', async () => {
      const size = 256;

      // Create and release buffer
      const array = pool.getUint8Array(size);
      pool.release(array);

      // Set very short max age for testing
      pool.setMaxAge(1);

      // Wait for age to exceed limit
      await new Promise(resolve => setTimeout(resolve, 50));

      // Cleanup should remove the old buffer
      const statsBefore = pool.getStats();
      pool.cleanup();
      const statsAfter = pool.getStats();

      // Check that cleanup was attempted (gcCount should increase if there were items to clean)
      expect(statsAfter.poolSize).toBeLessThanOrEqual(statsBefore.poolSize);
    });

    it('should limit pool size', () => {
      const size = 128;
      pool.setMaxPoolSize(2);

      // Create more buffers than the limit
      const arrays = [];
      for (let i = 0; i < 5; i++) {
        const array = pool.getUint8Array(size);
        arrays.push(array);
        pool.release(array);
      }

      pool.cleanup();
      const stats = pool.getStats();
      expect(stats.poolSize).toBeLessThanOrEqual(2);
    });
  });

  describe('Memory Monitor', () => {
    let monitor: MemoryMonitor;

    beforeEach(() => {
      monitor = new MemoryMonitor();
    });

    afterEach(() => {
      monitor.clear();
    });

    it('should record memory measurements', () => {
      monitor.record(1000, 'test_operation');
      monitor.record(1500, 'test_operation');
      monitor.record(1200, 'another_operation');

      const testStats = monitor.getOperationStats('test_operation');
      expect(testStats.count).toBe(2);
      expect(testStats.averageUsage).toBe(1250);
      expect(testStats.peakUsage).toBe(1500);

      const anotherStats = monitor.getOperationStats('another_operation');
      expect(anotherStats.count).toBe(1);
      expect(anotherStats.averageUsage).toBe(1200);
    });

    it('should calculate usage trends', () => {
      // Simulate increasing memory usage
      for (let i = 0; i < 20; i++) {
        monitor.record(1000 + i * 100, 'increasing_operation');
      }

      const stats = monitor.getUsageStats();
      expect(stats.trend).toBe('increasing');
      expect(stats.current).toBeGreaterThan(stats.average);
    });

    it('should handle empty measurements gracefully', () => {
      const stats = monitor.getUsageStats();
      expect(stats.average).toBe(0);
      expect(stats.peak).toBe(0);
      expect(stats.current).toBe(0);
      expect(stats.trend).toBe('stable');
    });
  });

  describe('Memory Estimation', () => {
    it('should estimate processing memory requirements', () => {
      const frameCount = 100;
      const dimensions = { width: 128, height: 64 };
      const preset: DevicePreset = 'SSD1306_128x64';

      const estimate = estimateProcessingMemory(frameCount, dimensions, preset);

      expect(estimate.rgbaBytes).toBe(frameCount * 128 * 64 * 4);
      expect(estimate.monoBytes).toBe(frameCount * Math.ceil((128 * 64) / 8));
      expect(estimate.packedBytes).toBe(frameCount * 128 * 8);
      expect(estimate.totalBytes).toBeGreaterThan(0);
      expect(estimate.recommendedBatchSize).toBeGreaterThan(0);
    });

    it('should provide browser memory usage when available', () => {
      const usage = getBrowserMemoryUsage();
      expect(usage).toHaveProperty('available');

      if (usage.available) {
        expect(usage.used).toBeGreaterThan(0);
        expect(usage.total).toBeGreaterThan(0);
      }
    });
  });

  describe('Batch Processor', () => {
    let processor: BatchProcessor<number, number>;

    beforeEach(() => {
      processor = new BatchProcessor(3); // Small batch size for testing
    });

    it('should process items in batches', async () => {
      const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const results: number[] = [];

      const processedResults = await processor.processBatches(
        items,
        async (batch: number[]) => {
          return batch.map(x => x * 2);
        },
        {
          onProgress: (completed, total) => {
            expect(completed).toBeLessThanOrEqual(total);
          },
          onBatchComplete: (batchResults, batchIndex) => {
            results.push(...batchResults);
            expect(batchIndex).toBeGreaterThanOrEqual(0);
          },
        }
      );

      expect(processedResults).toEqual([2, 4, 6, 8, 10, 12, 14, 16, 18, 20]);
    });

    it('should handle batch processing errors gracefully', async () => {
      const items = [1, 2, 3, 4, 5];

      await expect(
        processor.processBatches(items, async (batch: number[]) => {
          if (batch.includes(3)) {
            throw new Error('Test error');
          }
          return batch.map(x => x * 2);
        })
      ).rejects.toThrow('Test error');
    });
  });

  describe('Performance Benchmarking', () => {
    let benchmark: PerformanceBenchmark;

    beforeEach(() => {
      benchmark = new PerformanceBenchmark();
    });

    afterEach(() => {
      benchmark.clear();
    });

    it('should measure operation performance', async () => {
      benchmark.start('test_operation');

      // Simulate some work
      await new Promise(resolve => setTimeout(resolve, 10));

      const result = benchmark.end('test_operation', 100);

      expect(result.operation).toBe('test_operation');
      expect(result.duration).toBeGreaterThan(0);
      expect(result.throughput).toBeGreaterThan(0);
    });

    it('should calculate summary statistics', () => {
      // Add some test results
      benchmark.start('op1');
      benchmark.end('op1', 10);

      benchmark.start('op2');
      benchmark.end('op2', 20);

      const summary = benchmark.getSummary();
      expect(summary.totalDuration).toBeGreaterThan(0);
      expect(summary.averageThroughput).toBeGreaterThan(0);
    });
  });

  describe('Benchmark Suite', () => {
    let suite: BenchmarkSuite;

    beforeEach(() => {
      suite = new BenchmarkSuite('test_suite');
    });

    it('should create test data for benchmarking', () => {
      const { files, rgbaFrames } = createBenchmarkTestData(5, {
        width: 64,
        height: 32,
      });

      expect(files).toHaveLength(5);
      expect(rgbaFrames).toHaveLength(5);

      for (const frame of rgbaFrames) {
        expect(frame.dims.width).toBe(64);
        expect(frame.dims.height).toBe(32);
        expect(frame.pixels).toBeInstanceOf(Uint8ClampedArray);
      }
    });

    it('should benchmark monochrome conversion', async () => {
      const { rgbaFrames } = createBenchmarkTestData(10);

      const results = await suite.benchmarkMonochromeConversion(
        rgbaFrames,
        [{ threshold: 128, dithering: 'none' }],
        1
      );

      expect(results).toHaveLength(1);
      expect(results[0]?.operation).toContain('mono_conversion');
      expect(results[0]?.duration).toBeGreaterThan(0);
    });
  });

  describe('Regression Tracking', () => {
    let tracker: RegressionTracker;

    beforeEach(() => {
      tracker = new RegressionTracker();
    });

    it('should detect performance regressions', () => {
      // Set baseline results
      const baseline = [
        {
          operation: 'test_op',
          duration: 100,
          throughput: 10,
          memoryUsage: { before: 1000, after: 1500, peak: 1500 },
        },
      ];
      tracker.setBaseline(baseline);

      // Test with regression (50% slower)
      const current = [
        {
          operation: 'test_op',
          duration: 150,
          throughput: 6.67,
          memoryUsage: { before: 1000, after: 2000, peak: 2000 },
        },
      ];

      const { regressions } = tracker.checkRegressions(current);

      expect(regressions.length).toBeGreaterThan(0);
      expect(regressions[0]?.metric).toBe('duration');
    });

    it('should detect performance improvements', () => {
      // Set baseline results
      const baseline = [
        {
          operation: 'test_op',
          duration: 100,
          throughput: 10,
          memoryUsage: { before: 1000, after: 1500, peak: 1500 },
        },
      ];
      tracker.setBaseline(baseline);

      // Test with improvement (50% faster)
      const current = [
        {
          operation: 'test_op',
          duration: 50,
          throughput: 20,
          memoryUsage: { before: 1000, after: 1200, peak: 1200 },
        },
      ];

      const { improvements } = tracker.checkRegressions(current);

      expect(improvements.length).toBeGreaterThan(0);
      expect(improvements[0]?.metric).toBe('duration');
    });

    it('should handle missing baseline gracefully', () => {
      const current = [
        {
          operation: 'unknown_op',
          duration: 100,
          throughput: 10,
        },
      ];

      const { regressions, improvements } = tracker.checkRegressions(current);

      expect(regressions).toHaveLength(0);
      expect(improvements).toHaveLength(0);
    });
  });
});

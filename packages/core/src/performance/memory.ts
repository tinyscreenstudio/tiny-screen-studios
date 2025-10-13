// Memory management and monitoring utilities
// Provides typed array preallocation, reuse, and memory usage tracking

import type { Dimensions, DevicePreset } from '../types/index.js';

/**
 * Memory usage statistics
 */
export interface MemoryStats {
  totalAllocated: number;
  totalReused: number;
  currentUsage: number;
  peakUsage: number;
  poolSize: number;
  gcCount: number;
}

/**
 * Memory pool entry
 */
interface PoolEntry {
  buffer: ArrayBuffer;
  size: number;
  lastUsed: number;
  inUse: boolean;
}

/**
 * Memory pool for typed array reuse
 */
export class TypedArrayPool {
  private pools = new Map<string, PoolEntry[]>();
  private stats: MemoryStats = {
    totalAllocated: 0,
    totalReused: 0,
    currentUsage: 0,
    peakUsage: 0,
    poolSize: 0,
    gcCount: 0,
  };
  private maxPoolSize = 50; // Maximum number of buffers per type
  private maxAge = 30000; // 30 seconds max age for unused buffers

  /**
   * Get a Uint8Array from the pool or create new one
   */
  getUint8Array(size: number): Uint8Array {
    const key = `uint8_${size}`;
    const pool = this.pools.get(key) || [];

    // Try to find an available buffer
    for (const entry of pool) {
      if (!entry.inUse && entry.size >= size) {
        entry.inUse = true;
        entry.lastUsed = Date.now();
        this.stats.totalReused++;

        // Return a view of the exact size needed
        return new Uint8Array(entry.buffer, 0, size);
      }
    }

    // No suitable buffer found, create new one
    const buffer = new ArrayBuffer(size);
    const entry: PoolEntry = {
      buffer,
      size,
      lastUsed: Date.now(),
      inUse: true,
    };

    pool.push(entry);
    this.pools.set(key, pool);

    this.stats.totalAllocated++;
    this.stats.currentUsage += size;
    this.stats.peakUsage = Math.max(
      this.stats.peakUsage,
      this.stats.currentUsage
    );
    this.stats.poolSize++;

    return new Uint8Array(buffer);
  }

  /**
   * Get a Uint8ClampedArray from the pool or create new one
   */
  getUint8ClampedArray(size: number): Uint8ClampedArray {
    const key = `uint8clamped_${size}`;
    const pool = this.pools.get(key) || [];

    // Try to find an available buffer
    for (const entry of pool) {
      if (!entry.inUse && entry.size >= size) {
        entry.inUse = true;
        entry.lastUsed = Date.now();
        this.stats.totalReused++;

        return new Uint8ClampedArray(entry.buffer, 0, size);
      }
    }

    // No suitable buffer found, create new one
    const buffer = new ArrayBuffer(size);
    const entry: PoolEntry = {
      buffer,
      size,
      lastUsed: Date.now(),
      inUse: true,
    };

    pool.push(entry);
    this.pools.set(key, pool);

    this.stats.totalAllocated++;
    this.stats.currentUsage += size;
    this.stats.peakUsage = Math.max(
      this.stats.peakUsage,
      this.stats.currentUsage
    );
    this.stats.poolSize++;

    return new Uint8ClampedArray(buffer);
  }

  /**
   * Return a typed array to the pool for reuse
   */
  release(array: Uint8Array | Uint8ClampedArray): void {
    const isUint8Clamped = array instanceof Uint8ClampedArray;
    const key = isUint8Clamped
      ? `uint8clamped_${array.length}`
      : `uint8_${array.length}`;
    const pool = this.pools.get(key);

    if (!pool) return;

    // Find the corresponding pool entry
    for (const entry of pool) {
      if (entry.buffer === array.buffer && entry.inUse) {
        entry.inUse = false;
        entry.lastUsed = Date.now();
        return;
      }
    }
  }

  /**
   * Clean up old unused buffers
   */
  cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, pool] of this.pools) {
      // Remove old unused buffers
      const filtered = pool.filter(entry => {
        if (!entry.inUse && now - entry.lastUsed > this.maxAge) {
          this.stats.currentUsage -= entry.size;
          this.stats.poolSize--;
          cleanedCount++;
          return false;
        }
        return true;
      });

      // Limit pool size
      if (filtered.length > this.maxPoolSize) {
        // Sort by last used time and keep the most recent ones
        filtered.sort((a, b) => b.lastUsed - a.lastUsed);
        const excess = filtered.splice(this.maxPoolSize);

        for (const entry of excess) {
          if (!entry.inUse) {
            this.stats.currentUsage -= entry.size;
            this.stats.poolSize--;
            cleanedCount++;
          }
        }
      }

      if (filtered.length === 0) {
        this.pools.delete(key);
      } else {
        this.pools.set(key, filtered);
      }
    }

    if (cleanedCount > 0) {
      this.stats.gcCount++;
    }
  }

  /**
   * Get current memory statistics
   */
  getStats(): MemoryStats {
    return { ...this.stats };
  }

  /**
   * Clear all pools and reset statistics
   */
  clear(): void {
    this.pools.clear();
    this.stats = {
      totalAllocated: 0,
      totalReused: 0,
      currentUsage: 0,
      peakUsage: 0,
      poolSize: 0,
      gcCount: 0,
    };
  }

  /**
   * Set maximum pool size per type
   */
  setMaxPoolSize(size: number): void {
    this.maxPoolSize = Math.max(1, size);
  }

  /**
   * Set maximum age for unused buffers
   */
  setMaxAge(ageMs: number): void {
    this.maxAge = Math.max(1000, ageMs);
  }
}

/**
 * Singleton memory pool instance
 */
let memoryPool: TypedArrayPool | null = null;

/**
 * Get the global memory pool instance
 */
export function getMemoryPool(): TypedArrayPool {
  if (!memoryPool) {
    memoryPool = new TypedArrayPool();

    // Set up automatic cleanup every 30 seconds
    setInterval(() => {
      memoryPool?.cleanup();
    }, 30000);
  }
  return memoryPool;
}

/**
 * Memory monitor for tracking usage patterns
 */
export class MemoryMonitor {
  private measurements: Array<{
    timestamp: number;
    usage: number;
    operation: string;
  }> = [];
  private maxMeasurements = 1000;

  /**
   * Record a memory measurement
   */
  record(usage: number, operation: string): void {
    this.measurements.push({
      timestamp: Date.now(),
      usage,
      operation,
    });

    // Keep only recent measurements
    if (this.measurements.length > this.maxMeasurements) {
      this.measurements = this.measurements.slice(-this.maxMeasurements);
    }
  }

  /**
   * Get memory usage statistics over time
   */
  getUsageStats(timeWindowMs = 60000): {
    average: number;
    peak: number;
    current: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  } {
    const now = Date.now();
    const recentMeasurements = this.measurements.filter(
      m => now - m.timestamp <= timeWindowMs
    );

    if (recentMeasurements.length === 0) {
      return { average: 0, peak: 0, current: 0, trend: 'stable' };
    }

    const usages = recentMeasurements.map(m => m.usage);
    const average =
      usages.reduce((sum, usage) => sum + usage, 0) / usages.length;
    const peak = Math.max(...usages);
    const current = usages[usages.length - 1] || 0;

    // Calculate trend
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (recentMeasurements.length >= 10) {
      const firstHalf = usages.slice(0, Math.floor(usages.length / 2));
      const secondHalf = usages.slice(Math.floor(usages.length / 2));

      const firstAvg =
        firstHalf.reduce((sum, usage) => sum + usage, 0) / firstHalf.length;
      const secondAvg =
        secondHalf.reduce((sum, usage) => sum + usage, 0) / secondHalf.length;

      const change = (secondAvg - firstAvg) / firstAvg;
      if (change > 0.1) trend = 'increasing';
      else if (change < -0.1) trend = 'decreasing';
    }

    return { average, peak, current, trend };
  }

  /**
   * Get measurements for a specific operation
   */
  getOperationStats(operation: string): {
    count: number;
    averageUsage: number;
    peakUsage: number;
  } {
    const operationMeasurements = this.measurements.filter(
      m => m.operation === operation
    );

    if (operationMeasurements.length === 0) {
      return { count: 0, averageUsage: 0, peakUsage: 0 };
    }

    const usages = operationMeasurements.map(m => m.usage);
    const averageUsage =
      usages.reduce((sum, usage) => sum + usage, 0) / usages.length;
    const peakUsage = Math.max(...usages);

    return {
      count: operationMeasurements.length,
      averageUsage,
      peakUsage,
    };
  }

  /**
   * Clear all measurements
   */
  clear(): void {
    this.measurements = [];
  }
}

/**
 * Singleton memory monitor instance
 */
let memoryMonitor: MemoryMonitor | null = null;

/**
 * Get the global memory monitor instance
 */
export function getMemoryMonitor(): MemoryMonitor {
  if (!memoryMonitor) {
    memoryMonitor = new MemoryMonitor();
  }
  return memoryMonitor;
}

/**
 * Utility functions for memory estimation
 */

/**
 * Calculate memory requirements for processing frames
 */
export function estimateProcessingMemory(
  frameCount: number,
  dimensions: Dimensions,
  preset: DevicePreset
): {
  rgbaBytes: number;
  monoBytes: number;
  packedBytes: number;
  totalBytes: number;
  recommendedBatchSize: number;
} {
  const { width, height } = dimensions;

  // RGBA: 4 bytes per pixel
  const rgbaBytes = frameCount * width * height * 4;

  // Mono: 1 bit per pixel, packed into bytes
  const bitsPerFrame = width * height;
  const bytesPerFrame = Math.ceil(bitsPerFrame / 8);
  const monoBytes = frameCount * bytesPerFrame;

  // Packed: depends on preset
  const presetSizes = {
    SSD1306_128x32: 128 * 4, // 128 columns × 4 pages
    SSD1306_128x64: 128 * 8, // 128 columns × 8 pages
    SH1106_132x64: 132 * 8, // 132 columns × 8 pages
  };
  const packedBytesPerFrame =
    presetSizes[preset] || presetSizes['SSD1306_128x64'];
  const packedBytes = frameCount * packedBytesPerFrame;

  const totalBytes = rgbaBytes + monoBytes + packedBytes;

  // Recommend batch size to stay under 100MB
  const maxMemory = 100 * 1024 * 1024; // 100MB
  const bytesPerFrameTotal =
    width * height * 4 + bytesPerFrame + packedBytesPerFrame;
  const recommendedBatchSize = Math.max(
    1,
    Math.floor(maxMemory / bytesPerFrameTotal)
  );

  return {
    rgbaBytes,
    monoBytes,
    packedBytes,
    totalBytes,
    recommendedBatchSize,
  };
}

/**
 * Get current browser memory usage (if available)
 */
export function getBrowserMemoryUsage(): {
  used?: number;
  total?: number;
  available?: boolean;
} {
  // Check if performance.memory is available (Chrome/Edge)
  if (
    'memory' in performance &&
    (
      performance as unknown as {
        memory: { usedJSHeapSize: number; totalJSHeapSize: number };
      }
    ).memory
  ) {
    const memory = (
      performance as unknown as {
        memory: { usedJSHeapSize: number; totalJSHeapSize: number };
      }
    ).memory;
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      available: true,
    };
  }

  return { available: false };
}

/**
 * Force garbage collection if available
 */
export function forceGarbageCollection(): boolean {
  if (typeof globalThis.gc === 'function') {
    globalThis.gc();
    return true;
  }
  return false;
}

/**
 * Memory-efficient batch processor
 */
export class BatchProcessor {
  private batchSize: number;
  private memoryPool: TypedArrayPool;
  private monitor: MemoryMonitor;

  constructor(batchSize = 50) {
    this.batchSize = batchSize;
    this.memoryPool = getMemoryPool();
    this.monitor = getMemoryMonitor();
  }

  /**
   * Process items in memory-efficient batches
   */
  async processBatches<T, R>(
    items: T[],
    processor: (batch: T[]) => Promise<R[]> | R[],
    options: {
      onProgress?: (completed: number, total: number) => void;
      onBatchComplete?: (batchResults: R[], batchIndex: number) => void;
      cleanupBetweenBatches?: boolean;
    } = {}
  ): Promise<R[]> {
    const results: R[] = [];

    for (let i = 0; i < items.length; i += this.batchSize) {
      const batchIndex = Math.floor(i / this.batchSize);
      const batch = items.slice(i, i + this.batchSize);

      // Record memory usage before processing
      const memoryBefore = getBrowserMemoryUsage();
      if (memoryBefore.available && memoryBefore.used) {
        this.monitor.record(memoryBefore.used, `batch_${batchIndex}_start`);
      }

      try {
        // Process the batch
        const batchResults = await processor(batch);
        results.push(...batchResults);

        // Report progress
        if (options.onProgress) {
          options.onProgress(i + batch.length, items.length);
        }

        // Notify batch completion
        if (options.onBatchComplete) {
          options.onBatchComplete(batchResults, batchIndex);
        }

        // Record memory usage after processing
        const memoryAfter = getBrowserMemoryUsage();
        if (memoryAfter.available && memoryAfter.used) {
          this.monitor.record(memoryAfter.used, `batch_${batchIndex}_end`);
        }

        // Cleanup between batches if requested
        if (options.cleanupBetweenBatches) {
          this.memoryPool.cleanup();
          forceGarbageCollection();
        }
      } catch (error) {
        console.error(`Error processing batch ${batchIndex}:`, error);
        throw error;
      }
    }

    return results;
  }

  /**
   * Set batch size
   */
  setBatchSize(size: number): void {
    this.batchSize = Math.max(1, size);
  }

  /**
   * Get current batch size
   */
  getBatchSize(): number {
    return this.batchSize;
  }
}

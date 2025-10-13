// Performance benchmarking and regression testing utilities
// Provides tools for measuring and tracking performance over time

import type {
  FrameRGBA,
  FrameMono,
  PackedFrame,
  DevicePreset,
  MonochromeOptions,
  PackingOptions,
} from '../types/index.js';

/**
 * Benchmark result for a single operation
 */
export interface BenchmarkResult {
  operation: string;
  duration: number; // milliseconds
  throughput: number; // operations per second
  memoryUsage?: {
    before: number;
    after: number;
    peak: number;
  };
  metadata?: Record<string, unknown>;
}

/**
 * Benchmark suite result
 */
export interface BenchmarkSuiteResult {
  suiteName: string;
  timestamp: number;
  results: BenchmarkResult[];
  summary: {
    totalDuration: number;
    averageThroughput: number;
    memoryEfficiency: number;
  };
  environment: {
    userAgent: string;
    platform: string;
    cores?: number;
    memory?: number;
  };
}

/**
 * Performance benchmark runner
 */
export class PerformanceBenchmark {
  private results: BenchmarkResult[] = [];
  private startTime = 0;
  private memoryBefore = 0;
  private memoryPeak = 0;

  /**
   * Start timing a benchmark
   */
  start(): void {
    this.startTime = performance.now();

    // Record memory usage if available
    if (
      'memory' in performance &&
      (performance as unknown as { memory: { usedJSHeapSize: number } }).memory
    ) {
      this.memoryBefore = (
        performance as unknown as { memory: { usedJSHeapSize: number } }
      ).memory.usedJSHeapSize;
      this.memoryPeak = this.memoryBefore;
    }
  }

  /**
   * End timing and record result
   */
  end(
    operation: string,
    operationCount = 1,
    metadata?: Record<string, unknown>
  ): BenchmarkResult {
    const endTime = performance.now();
    const duration = endTime - this.startTime;
    const throughput = operationCount / (duration / 1000); // ops per second

    let memoryUsage: BenchmarkResult['memoryUsage'];
    if (
      'memory' in performance &&
      (performance as unknown as { memory: { usedJSHeapSize: number } }).memory
    ) {
      const memoryAfter = (
        performance as unknown as { memory: { usedJSHeapSize: number } }
      ).memory.usedJSHeapSize;
      memoryUsage = {
        before: this.memoryBefore,
        after: memoryAfter,
        peak: Math.max(this.memoryPeak, memoryAfter),
      };
    }

    const result: BenchmarkResult = {
      operation,
      duration,
      throughput,
      ...(memoryUsage && { memoryUsage }),
      ...(metadata && { metadata }),
    };

    this.results.push(result);
    return result;
  }

  /**
   * Get all benchmark results
   */
  getResults(): BenchmarkResult[] {
    return [...this.results];
  }

  /**
   * Clear all results
   */
  clear(): void {
    this.results = [];
  }

  /**
   * Get summary statistics
   */
  getSummary(): {
    totalDuration: number;
    averageThroughput: number;
    memoryEfficiency: number;
  } {
    if (this.results.length === 0) {
      return { totalDuration: 0, averageThroughput: 0, memoryEfficiency: 0 };
    }

    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);
    const averageThroughput =
      this.results.reduce((sum, r) => sum + r.throughput, 0) /
      this.results.length;

    // Calculate memory efficiency (operations per MB used)
    const memoryResults = this.results.filter(r => r.memoryUsage);
    let memoryEfficiency = 0;
    if (memoryResults.length > 0) {
      const avgMemoryUsed =
        memoryResults.reduce((sum, r) => {
          const usage = r.memoryUsage!;
          return sum + (usage.peak - usage.before);
        }, 0) / memoryResults.length;

      memoryEfficiency = averageThroughput / (avgMemoryUsed / (1024 * 1024)); // ops per MB
    }

    return { totalDuration, averageThroughput, memoryEfficiency };
  }
}

/**
 * Benchmark suite for comprehensive performance testing
 */
export class BenchmarkSuite {
  private suiteName: string;

  constructor(suiteName: string) {
    this.suiteName = suiteName;
  }

  /**
   * Run image decoding benchmarks
   */
  async benchmarkImageDecoding(
    testFiles: File[],
    iterations = 3
  ): Promise<BenchmarkResult[]> {
    const { decodeImageFiles } = await import('../converters/decoder.js');
    const results: BenchmarkResult[] = [];

    for (let i = 0; i < iterations; i++) {
      const benchmark = new PerformanceBenchmark();

      benchmark.start();
      await decodeImageFiles(testFiles);
      const result = benchmark.end('image_decoding', testFiles.length, {
        iteration: i + 1,
        fileCount: testFiles.length,
        totalFileSize: testFiles.reduce((sum, f) => sum + f.size, 0),
      });

      results.push(result);
    }

    return results;
  }

  /**
   * Run monochrome conversion benchmarks
   */
  async benchmarkMonochromeConversion(
    testFrames: FrameRGBA[],
    options: MonochromeOptions[] = [
      { threshold: 128, dithering: 'none' },
      { threshold: 128, dithering: 'bayer4' },
    ],
    iterations = 3
  ): Promise<BenchmarkResult[]> {
    const { toMonochrome } = await import('../converters/mono.js');
    const results: BenchmarkResult[] = [];

    for (const monoOptions of options) {
      for (let i = 0; i < iterations; i++) {
        const benchmark = new PerformanceBenchmark();

        const optionKey = `${monoOptions.dithering}_t${monoOptions.threshold}`;
        benchmark.start();
        toMonochrome(testFrames, monoOptions);
        const result = benchmark.end(
          `mono_conversion_${optionKey}`,
          testFrames.length,
          {
            iteration: i + 1,
            frameCount: testFrames.length,
            options: monoOptions,
            totalPixels: testFrames.reduce(
              (sum, f) => sum + f.dims.width * f.dims.height,
              0
            ),
          }
        );

        results.push(result);
      }
    }

    return results;
  }

  /**
   * Run frame packing benchmarks
   */
  async benchmarkFramePacking(
    testFrames: FrameMono[],
    presets: DevicePreset[] = [
      'SSD1306_128x32',
      'SSD1306_128x64',
      'SH1106_132x64',
    ],
    iterations = 3
  ): Promise<BenchmarkResult[]> {
    const { packFrames } = await import('../packers/ssd1306.js');
    const results: BenchmarkResult[] = [];

    for (const preset of presets) {
      for (let i = 0; i < iterations; i++) {
        const benchmark = new PerformanceBenchmark();

        const packOptions: PackingOptions = { preset };
        benchmark.start();
        packFrames(testFrames, packOptions);
        const result = benchmark.end(
          `frame_packing_${preset}`,
          testFrames.length,
          {
            iteration: i + 1,
            frameCount: testFrames.length,
            preset,
            totalPixels: testFrames.reduce(
              (sum, f) => sum + f.dims.width * f.dims.height,
              0
            ),
          }
        );

        results.push(result);
      }
    }

    return results;
  }

  /**
   * Run canvas rendering benchmarks
   */
  benchmarkCanvasRendering(
    testFrames: PackedFrame[],
    scales: number[] = [1, 2, 4],
    iterations = 3
  ): BenchmarkResult[] {
    const results: BenchmarkResult[] = [];

    // Skip canvas rendering benchmarks in test environment
    if (typeof OffscreenCanvas === 'undefined') {
      console.warn(
        'OffscreenCanvas not available, skipping canvas rendering benchmarks'
      );
      return results;
    }

    // Create a test canvas
    const canvas = new OffscreenCanvas(256, 256);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to create canvas context for benchmarking');
    }

    for (const scale of scales) {
      for (let i = 0; i < iterations; i++) {
        const benchmark = new PerformanceBenchmark();

        benchmark.start();

        // Render all frames
        for (const frame of testFrames) {
          // Simple rendering simulation
          const { width, height } = frame.dims;
          canvas.width = width * scale;
          canvas.height = height * scale;

          ctx.imageSmoothingEnabled = false;
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Simulate pixel rendering
          ctx.fillStyle = '#ffffff';
          for (let y = 0; y < height; y += 8) {
            for (let x = 0; x < width; x++) {
              const byteIndex = (y / 8) * width + x;
              const byte = frame.bytes[byteIndex] || 0;

              for (let bit = 0; bit < 8; bit++) {
                if (byte & (1 << bit)) {
                  const pixelY = y + bit;
                  ctx.fillRect(x * scale, pixelY * scale, scale, scale);
                }
              }
            }
          }
        }

        const result = benchmark.end(
          `canvas_rendering_${scale}x`,
          testFrames.length,
          {
            iteration: i + 1,
            frameCount: testFrames.length,
            scale,
            canvasSize: `${canvas.width}x${canvas.height}`,
          }
        );

        results.push(result);
      }
    }

    return results;
  }

  /**
   * Run complete end-to-end workflow benchmark
   */
  async benchmarkCompleteWorkflow(
    testFiles: File[],
    preset: DevicePreset,
    options: {
      monoOptions?: MonochromeOptions;
      packOptions?: Partial<PackingOptions>;
    } = {},
    iterations = 3
  ): Promise<BenchmarkResult[]> {
    const { processFilesToPackedFrames } = await import(
      '../orchestrator/index.js'
    );
    const results: BenchmarkResult[] = [];

    for (let i = 0; i < iterations; i++) {
      const benchmark = new PerformanceBenchmark();

      benchmark.start();
      await processFilesToPackedFrames(testFiles, preset, options);
      const result = benchmark.end('complete_workflow', testFiles.length, {
        iteration: i + 1,
        fileCount: testFiles.length,
        preset,
        options,
        totalFileSize: testFiles.reduce((sum, f) => sum + f.size, 0),
      });

      results.push(result);
    }

    return results;
  }

  /**
   * Run all benchmarks and return comprehensive results
   */
  async runAllBenchmarks(
    testFiles: File[],
    preset: DevicePreset = 'SSD1306_128x64'
  ): Promise<BenchmarkSuiteResult> {
    const startTime = Date.now();
    const allResults: BenchmarkResult[] = [];

    try {
      // Decode test files first
      const { decodeImageFiles } = await import('../converters/decoder.js');
      const { toMonochrome } = await import('../converters/mono.js');
      const { packFrames } = await import('../packers/ssd1306.js');

      const rgbaFrames = await decodeImageFiles(testFiles);
      const monoFrames = toMonochrome(rgbaFrames);
      const packedFrames = packFrames(monoFrames, { preset });

      // Run individual benchmarks
      const decodingResults = await this.benchmarkImageDecoding(testFiles);
      const monoResults = await this.benchmarkMonochromeConversion(rgbaFrames);
      const packingResults = await this.benchmarkFramePacking(monoFrames);
      const renderingResults = this.benchmarkCanvasRendering(packedFrames);
      const workflowResults = await this.benchmarkCompleteWorkflow(
        testFiles,
        preset
      );

      allResults.push(
        ...decodingResults,
        ...monoResults,
        ...packingResults,
        ...renderingResults,
        ...workflowResults
      );
    } catch (error) {
      console.error('Benchmark suite failed:', error);
      throw error;
    }

    // Calculate summary
    const totalDuration = allResults.reduce((sum, r) => sum + r.duration, 0);
    const averageThroughput =
      allResults.reduce((sum, r) => sum + r.throughput, 0) / allResults.length;

    const memoryResults = allResults.filter(r => r.memoryUsage);
    let memoryEfficiency = 0;
    if (memoryResults.length > 0) {
      const avgMemoryUsed =
        memoryResults.reduce((sum, r) => {
          const usage = r.memoryUsage!;
          return sum + (usage.peak - usage.before);
        }, 0) / memoryResults.length;

      memoryEfficiency = averageThroughput / (avgMemoryUsed / (1024 * 1024));
    }

    // Get environment info
    const environment = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      ...(navigator.hardwareConcurrency && {
        cores: navigator.hardwareConcurrency,
      }),
      ...((navigator as unknown as { deviceMemory?: number }).deviceMemory && {
        memory:
          (navigator as unknown as { deviceMemory: number }).deviceMemory *
          1024,
      }),
    };

    return {
      suiteName: this.suiteName,
      timestamp: startTime,
      results: allResults,
      summary: {
        totalDuration,
        averageThroughput,
        memoryEfficiency,
      },
      environment,
    };
  }
}

/**
 * Performance regression tracker
 */
export class RegressionTracker {
  private baselineResults: Map<string, BenchmarkResult[]> = new Map();
  private thresholds = {
    duration: 1.2, // 20% slower is a regression
    throughput: 0.8, // 20% slower throughput is a regression
    memory: 1.5, // 50% more memory usage is a regression
  };

  /**
   * Set baseline results for comparison
   */
  setBaseline(results: BenchmarkResult[]): void {
    this.baselineResults.clear();

    for (const result of results) {
      const existing = this.baselineResults.get(result.operation) || [];
      existing.push(result);
      this.baselineResults.set(result.operation, existing);
    }
  }

  /**
   * Check for regressions against baseline
   */
  checkRegressions(currentResults: BenchmarkResult[]): {
    regressions: Array<{
      operation: string;
      metric: 'duration' | 'throughput' | 'memory';
      baseline: number;
      current: number;
      ratio: number;
    }>;
    improvements: Array<{
      operation: string;
      metric: 'duration' | 'throughput' | 'memory';
      baseline: number;
      current: number;
      ratio: number;
    }>;
  } {
    const regressions: Array<{
      operation: string;
      metric: 'duration' | 'throughput' | 'memory';
      baseline: number;
      current: number;
      ratio: number;
    }> = [];
    const improvements: Array<{
      operation: string;
      metric: 'duration' | 'throughput' | 'memory';
      baseline: number;
      current: number;
      ratio: number;
    }> = [];

    for (const current of currentResults) {
      const baseline = this.baselineResults.get(current.operation);
      if (!baseline || baseline.length === 0) continue;

      // Calculate average baseline values
      const avgBaseline = {
        duration:
          baseline.reduce((sum, r) => sum + r.duration, 0) / baseline.length,
        throughput:
          baseline.reduce((sum, r) => sum + r.throughput, 0) / baseline.length,
        memory:
          baseline
            .filter(r => r.memoryUsage)
            .reduce(
              (sum, r) => sum + (r.memoryUsage!.peak - r.memoryUsage!.before),
              0
            ) / baseline.filter(r => r.memoryUsage).length || 0,
      };

      // Check duration regression
      const durationRatio = current.duration / avgBaseline.duration;
      if (durationRatio > this.thresholds.duration) {
        regressions.push({
          operation: current.operation,
          metric: 'duration',
          baseline: avgBaseline.duration,
          current: current.duration,
          ratio: durationRatio,
        });
      } else if (durationRatio < 0.9) {
        // 10% improvement
        improvements.push({
          operation: current.operation,
          metric: 'duration',
          baseline: avgBaseline.duration,
          current: current.duration,
          ratio: durationRatio,
        });
      }

      // Check throughput regression
      const throughputRatio = current.throughput / avgBaseline.throughput;
      if (throughputRatio < this.thresholds.throughput) {
        regressions.push({
          operation: current.operation,
          metric: 'throughput',
          baseline: avgBaseline.throughput,
          current: current.throughput,
          ratio: throughputRatio,
        });
      } else if (throughputRatio > 1.1) {
        // 10% improvement
        improvements.push({
          operation: current.operation,
          metric: 'throughput',
          baseline: avgBaseline.throughput,
          current: current.throughput,
          ratio: throughputRatio,
        });
      }

      // Check memory regression
      if (current.memoryUsage && avgBaseline.memory > 0) {
        const currentMemory =
          current.memoryUsage.peak - current.memoryUsage.before;
        const memoryRatio = currentMemory / avgBaseline.memory;

        if (memoryRatio > this.thresholds.memory) {
          regressions.push({
            operation: current.operation,
            metric: 'memory',
            baseline: avgBaseline.memory,
            current: currentMemory,
            ratio: memoryRatio,
          });
        } else if (memoryRatio < 0.9) {
          // 10% improvement
          improvements.push({
            operation: current.operation,
            metric: 'memory',
            baseline: avgBaseline.memory,
            current: currentMemory,
            ratio: memoryRatio,
          });
        }
      }
    }

    return { regressions, improvements };
  }

  /**
   * Set regression thresholds
   */
  setThresholds(thresholds: Partial<typeof this.thresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }
}

/**
 * Create test data for benchmarking
 */
export function createBenchmarkTestData(
  frameCount: number,
  dimensions: { width: number; height: number } = { width: 128, height: 64 }
): {
  files: File[];
  rgbaFrames: FrameRGBA[];
} {
  const files: File[] = [];
  const rgbaFrames: FrameRGBA[] = [];

  for (let i = 0; i < frameCount; i++) {
    // Create test image data manually for test environment compatibility
    const { width, height } = dimensions;
    const pixelCount = width * height;
    const pixels = new Uint8ClampedArray(pixelCount * 4);

    // Create a simple test pattern
    const offset = (i * 10) % width;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixelIndex = (y * width + x) * 4;

        // Create a checkerboard pattern with animation offset
        const isWhite = (x + offset) % 20 < 10 && y % 20 < 10;
        const color = isWhite ? 255 : 0;

        pixels[pixelIndex] = color; // R
        pixels[pixelIndex + 1] = color; // G
        pixels[pixelIndex + 2] = color; // B
        pixels[pixelIndex + 3] = 255; // A
      }
    }

    // Create RGBA frame
    rgbaFrames.push({
      pixels,
      dims: dimensions,
      delayMs: 100,
    });

    // Create mock file
    const fileName = `test_frame_${i.toString().padStart(3, '0')}.png`;
    const mockFile = new File([new ArrayBuffer(1024)], fileName, {
      type: 'image/png',
    });
    files.push(mockFile);
  }

  return { files, rgbaFrames };
}

/**
 * Export benchmark results to JSON
 */
export function exportBenchmarkResults(results: BenchmarkSuiteResult): string {
  return JSON.stringify(results, null, 2);
}

/**
 * Import benchmark results from JSON
 */
export function importBenchmarkResults(json: string): BenchmarkSuiteResult {
  return JSON.parse(json);
}

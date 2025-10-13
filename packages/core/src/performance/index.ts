// Performance optimization module exports
// Provides Web Worker support, memory management, and benchmarking tools

export * from './worker.js';
export * from './memory.js';
export * from './benchmarks.js';

// Re-export key utilities for convenience
export {
  getBatchWorker,
  terminateBatchWorker,
  shouldUseWorker,
} from './worker.js';

export {
  getMemoryPool,
  getMemoryMonitor,
  estimateProcessingMemory,
  getBrowserMemoryUsage,
  forceGarbageCollection,
} from './memory.js';

export {
  PerformanceBenchmark,
  BenchmarkSuite,
  RegressionTracker,
  createBenchmarkTestData,
  exportBenchmarkResults,
  importBenchmarkResults,
} from './benchmarks.js';

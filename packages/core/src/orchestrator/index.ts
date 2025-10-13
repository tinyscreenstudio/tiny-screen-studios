// Orchestrator module for end-to-end workflows
// Chains decoder → mono → packer → export with error aggregation and progress reporting

import type {
  FrameMono,
  PackedFrame,
  DevicePreset,
  MonochromeOptions,
  PackingOptions,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  ProcessingOrchestrator,
  ExportFile,
  CExportOptions,
  RenderOptions,
  AnimationOptions,
  AnimationController,
  DisplayEmulator,
} from '../types/index.js';

import { decodeAndValidateFiles } from '../converters/decoder.js';
import { toMonochrome } from '../converters/mono.js';
import { packFrames } from '../packers/ssd1306.js';
import {
  makeByteFiles,
  makeConcatenatedByteFile,
} from '../exporters/binary.js';
import { toCRawArray, makeCArrayFiles } from '../exporters/c-array.js';
import {
  createCanvasEmulator,
  renderFrameToNewCanvas,
} from '../emulator/index.js';
import {
  getBatchWorker,
  shouldUseWorker,
  getMemoryPool,
  getMemoryMonitor,
  estimateProcessingMemory,
  getBrowserMemoryUsage,
  forceGarbageCollection,
  BatchProcessor,
  TypedArrayPool,
  MemoryMonitor,
} from '../performance/index.js';

/**
 * Progress callback function type for batch processing
 */
export type ProgressCallback = (
  completed: number,
  total: number,
  currentOperation: string
) => void;

/**
 * Batch processing options
 */
export type BatchProcessingOptions = {
  monoOptions?: MonochromeOptions;
  packOptions?: Partial<PackingOptions>;
  useWebWorker?: boolean;
  progressCallback?: ProgressCallback;
  memoryLimit?: number; // Max frames to process at once
};

/**
 * Complete workflow result
 */
export type WorkflowResult = {
  frames: PackedFrame[];
  validation: ValidationResult;
  processingTime: number;
  memoryUsage?: {
    peakFrames: number;
    totalBytes: number;
  };
};

/**
 * Export workflow result
 */
export type ExportResult = {
  files: ExportFile[];
  validation: ValidationResult;
  exportTime: number;
};

/**
 * Implementation of the ProcessingOrchestrator interface
 */
export class ProcessingOrchestratorImpl implements ProcessingOrchestrator {
  private memoryLimit = 100; // Default max frames to process at once
  private memoryPool = getMemoryPool();
  private memoryMonitor = getMemoryMonitor();
  private batchProcessor = new BatchProcessor(50);

  /**
   * Process files through the complete pipeline: decode → mono → pack
   */
  async processFiles(
    files: File[],
    preset: DevicePreset,
    monoOptions?: MonochromeOptions,
    packOptions?: Partial<PackingOptions>
  ): Promise<WorkflowResult> {
    const startTime = performance.now();
    const aggregatedErrors: ValidationError[] = [];
    const aggregatedWarnings: ValidationWarning[] = [];

    // Record initial memory usage
    const initialMemory = getBrowserMemoryUsage();
    if (initialMemory.available && initialMemory.used) {
      this.memoryMonitor.record(initialMemory.used, 'process_files_start');
    }

    try {
      // Check if we should use web worker for large batches
      if (shouldUseWorker(files.length)) {
        return this.processFilesWithWorker(
          files,
          preset,
          monoOptions,
          packOptions
        );
      }
      // Step 1: Decode and validate files
      const { frames: rgbaFrames, validation: decodeValidation } =
        await decodeAndValidateFiles(files, preset);

      // Aggregate validation results
      aggregatedErrors.push(...decodeValidation.errors);
      aggregatedWarnings.push(...decodeValidation.warnings);

      // If decode validation failed, return early
      if (!decodeValidation.isValid) {
        return {
          frames: [],
          validation: {
            isValid: false,
            errors: aggregatedErrors,
            warnings: aggregatedWarnings,
          },
          processingTime: performance.now() - startTime,
        };
      }

      // Step 2: Convert to monochrome
      let monoFrames: FrameMono[];
      try {
        monoFrames = toMonochrome(rgbaFrames, monoOptions);
      } catch (error) {
        aggregatedErrors.push({
          type: 'invalid_parameters',
          message: `Monochrome conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          context: { monoOptions, error },
        });

        return {
          frames: [],
          validation: {
            isValid: false,
            errors: aggregatedErrors,
            warnings: aggregatedWarnings,
          },
          processingTime: performance.now() - startTime,
        };
      }

      // Step 3: Pack frames for device
      const finalPackOptions: PackingOptions = {
        preset,
        ...packOptions,
      };

      let packedFrames: PackedFrame[];
      try {
        packedFrames = packFrames(monoFrames, finalPackOptions);
      } catch (error) {
        aggregatedErrors.push({
          type: 'invalid_parameters',
          message: `Frame packing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          context: { packOptions: finalPackOptions, error },
        });

        return {
          frames: [],
          validation: {
            isValid: false,
            errors: aggregatedErrors,
            warnings: aggregatedWarnings,
          },
          processingTime: performance.now() - startTime,
        };
      }

      // Calculate memory usage
      const totalBytes = packedFrames.reduce(
        (sum, frame) => sum + frame.bytes.length,
        0
      );

      const processingTime = performance.now() - startTime;

      // Record final memory usage
      const finalMemory = getBrowserMemoryUsage();
      if (finalMemory.available && finalMemory.used) {
        this.memoryMonitor.record(finalMemory.used, 'process_files_end');
      }

      // Clean up memory pool
      this.memoryPool.cleanup();

      return {
        frames: packedFrames,
        validation: {
          isValid: aggregatedErrors.length === 0,
          errors: aggregatedErrors,
          warnings: aggregatedWarnings,
        },
        processingTime,
        memoryUsage: {
          peakFrames: packedFrames.length,
          totalBytes,
        },
      };
    } catch (error) {
      // Handle unexpected errors
      aggregatedErrors.push({
        type: 'invalid_parameters',
        message: `Unexpected processing error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        context: { error },
      });

      return {
        frames: [],
        validation: {
          isValid: false,
          errors: aggregatedErrors,
          warnings: aggregatedWarnings,
        },
        processingTime: performance.now() - startTime,
      };
    }
  }

  /**
   * Process files using web worker for large batches
   */
  private async processFilesWithWorker(
    files: File[],
    preset: DevicePreset,
    monoOptions?: MonochromeOptions,
    packOptions?: Partial<PackingOptions>
  ): Promise<WorkflowResult> {
    const startTime = performance.now();
    const aggregatedErrors: ValidationError[] = [];
    const aggregatedWarnings: ValidationWarning[] = [];

    try {
      // First decode files on main thread (createImageBitmap requires main thread)
      const { frames: rgbaFrames, validation: decodeValidation } =
        await decodeAndValidateFiles(files, preset);

      aggregatedErrors.push(...decodeValidation.errors);
      aggregatedWarnings.push(...decodeValidation.warnings);

      if (!decodeValidation.isValid) {
        return {
          frames: [],
          validation: {
            isValid: false,
            errors: aggregatedErrors,
            warnings: aggregatedWarnings,
          },
          processingTime: performance.now() - startTime,
        };
      }

      // Use web worker for mono conversion and packing
      const worker = getBatchWorker();
      const packedFrames = await worker.processBatch(rgbaFrames, preset, {
        ...(monoOptions && { monoOptions }),
        ...(packOptions && { packOptions }),
        progressCallback: (completed, total, operation) => {
          // eslint-disable-next-line no-console
          console.log(`Worker progress: ${completed}/${total} - ${operation}`);
        },
      });

      const processingTime = performance.now() - startTime;
      const totalBytes = packedFrames.reduce(
        (sum, frame) => sum + frame.bytes.length,
        0
      );

      return {
        frames: packedFrames,
        validation: {
          isValid: aggregatedErrors.length === 0,
          errors: aggregatedErrors,
          warnings: aggregatedWarnings,
        },
        processingTime,
        memoryUsage: {
          peakFrames: packedFrames.length,
          totalBytes,
        },
      };
    } catch (error) {
      aggregatedErrors.push({
        type: 'invalid_parameters',
        message: `Worker processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        context: { error },
      });

      return {
        frames: [],
        validation: {
          isValid: false,
          errors: aggregatedErrors,
          warnings: aggregatedWarnings,
        },
        processingTime: performance.now() - startTime,
      };
    }
  }

  /**
   * Process multiple file groups in batches with memory management
   */
  async batchProcess(
    fileGroups: File[][],
    preset: DevicePreset,
    options: BatchProcessingOptions = {}
  ): Promise<PackedFrame[][]> {
    const {
      monoOptions,
      packOptions,
      progressCallback,
      memoryLimit = this.memoryLimit,
    } = options;

    // Estimate memory requirements
    const totalFiles = fileGroups.reduce((sum, group) => sum + group.length, 0);
    const memoryEstimate = estimateProcessingMemory(
      totalFiles,
      { width: 128, height: 64 }, // Default dimensions, will be updated after first decode
      preset
    );

    // Adjust batch size based on memory estimate
    const adjustedBatchSize = Math.min(
      memoryLimit,
      memoryEstimate.recommendedBatchSize
    );
    this.batchProcessor.setBatchSize(adjustedBatchSize);

    // Process file groups with progress tracking
    let processedGroups = 0;

    // Use the memory-efficient batch processor
    return this.batchProcessor
      .processBatches(
        fileGroups,
        async (batch: File[][]) => {
          const batchResults: PackedFrame[][] = [];

          for (const fileGroup of batch) {
            // Report progress for each group
            if (progressCallback) {
              progressCallback(
                processedGroups,
                fileGroups.length,
                `Processing group ${processedGroups + 1}/${fileGroups.length}`
              );
            }

            try {
              const result = await this.processFiles(
                fileGroup,
                preset,
                monoOptions,
                packOptions
              );

              if (result.validation.isValid) {
                batchResults.push(result.frames);
              } else {
                console.warn(
                  `Failed to process file group:`,
                  result.validation.errors
                );
                batchResults.push([]);
              }
            } catch (error) {
              console.error(`Error processing file group:`, error);
              batchResults.push([]);
            }

            processedGroups++;
          }

          return batchResults;
        },
        {
          cleanupBetweenBatches: true,
          onBatchComplete: (_, batchIndex) => {
            // Log batch completion with memory stats
            const memoryStats = this.memoryPool.getStats();
            // eslint-disable-next-line no-console
            console.log(
              `Batch ${batchIndex + 1} complete. Memory: ${Math.round(memoryStats.currentUsage / 1024 / 1024)}MB used, ${memoryStats.totalReused} arrays reused`
            );
          },
        }
      )
      .then(results => {
        // Final progress report
        if (progressCallback) {
          progressCallback(
            fileGroups.length,
            fileGroups.length,
            'Batch processing complete'
          );
        }
        return results;
      });
  }

  /**
   * Set memory limit for batch processing
   */
  setMemoryLimit(limit: number): void {
    if (limit <= 0) {
      throw new Error('Memory limit must be greater than 0');
    }
    this.memoryLimit = limit;
  }

  /**
   * Get current memory limit
   */
  getMemoryLimit(): number {
    return this.memoryLimit;
  }

  /**
   * Get memory pool statistics
   */
  getMemoryStats(): ReturnType<TypedArrayPool['getStats']> {
    return this.memoryPool.getStats();
  }

  /**
   * Get memory usage statistics
   */
  getMemoryUsageStats(
    timeWindowMs = 60000
  ): ReturnType<MemoryMonitor['getUsageStats']> {
    return this.memoryMonitor.getUsageStats(timeWindowMs);
  }

  /**
   * Force cleanup of memory pools and garbage collection
   */
  forceCleanup(): void {
    this.memoryPool.cleanup();
    forceGarbageCollection();
  }

  /**
   * Estimate memory requirements for processing
   */
  estimateMemoryRequirements(
    fileCount: number,
    dimensions: { width: number; height: number },
    preset: DevicePreset
  ): ReturnType<typeof estimateProcessingMemory> {
    return estimateProcessingMemory(fileCount, dimensions, preset);
  }
}

/**
 * High-level workflow functions for common use cases
 */

/**
 * Complete workflow: files → packed frames
 */
export async function processFilesToPackedFrames(
  files: File[],
  preset: DevicePreset,
  options: {
    monoOptions?: MonochromeOptions;
    packOptions?: Partial<PackingOptions>;
  } = {}
): Promise<WorkflowResult> {
  const orchestrator = new ProcessingOrchestratorImpl();
  return orchestrator.processFiles(
    files,
    preset,
    options.monoOptions,
    options.packOptions
  );
}

/**
 * Complete workflow: files → binary export
 */
export async function processFilesToBinary(
  files: File[],
  preset: DevicePreset,
  basename: string,
  options: {
    monoOptions?: MonochromeOptions;
    packOptions?: Partial<PackingOptions>;
    concatenated?: boolean;
  } = {}
): Promise<ExportResult> {
  const startTime = performance.now();

  try {
    // Process files to packed frames
    const result = await processFilesToPackedFrames(files, preset, options);

    if (!result.validation.isValid) {
      return {
        files: [],
        validation: result.validation,
        exportTime: performance.now() - startTime,
      };
    }

    // Export to binary
    const exportFiles = options.concatenated
      ? [makeConcatenatedByteFile(result.frames, basename)]
      : makeByteFiles(result.frames, basename);

    return {
      files: exportFiles,
      validation: result.validation,
      exportTime: performance.now() - startTime,
    };
  } catch (error) {
    return {
      files: [],
      validation: {
        isValid: false,
        errors: [
          {
            type: 'invalid_parameters',
            message: `Export workflow failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            context: { error },
          },
        ],
        warnings: [],
      },
      exportTime: performance.now() - startTime,
    };
  }
}

/**
 * Complete workflow: files → C array export
 */
export async function processFilesToCArray(
  files: File[],
  preset: DevicePreset,
  symbolName: string,
  options: {
    monoOptions?: MonochromeOptions;
    packOptions?: Partial<PackingOptions>;
    exportOptions?: CExportOptions;
  } = {}
): Promise<{ code: string; validation: ValidationResult; exportTime: number }> {
  const startTime = performance.now();

  try {
    // Process files to packed frames
    const result = await processFilesToPackedFrames(files, preset, options);

    if (!result.validation.isValid) {
      return {
        code: '',
        validation: result.validation,
        exportTime: performance.now() - startTime,
      };
    }

    // Export to C array
    const code = toCRawArray(result.frames, symbolName, options.exportOptions);

    return {
      code,
      validation: result.validation,
      exportTime: performance.now() - startTime,
    };
  } catch (error) {
    return {
      code: '',
      validation: {
        isValid: false,
        errors: [
          {
            type: 'invalid_parameters',
            message: `C array export workflow failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            context: { error },
          },
        ],
        warnings: [],
      },
      exportTime: performance.now() - startTime,
    };
  }
}

/**
 * Complete workflow: files → C array files (.h and .c)
 */
export async function processFilesToCArrayFiles(
  files: File[],
  preset: DevicePreset,
  symbolName: string,
  options: {
    monoOptions?: MonochromeOptions;
    packOptions?: Partial<PackingOptions>;
    exportOptions?: CExportOptions;
  } = {}
): Promise<ExportResult> {
  const startTime = performance.now();

  try {
    // Process files to packed frames
    const result = await processFilesToPackedFrames(files, preset, options);

    if (!result.validation.isValid) {
      return {
        files: [],
        validation: result.validation,
        exportTime: performance.now() - startTime,
      };
    }

    // Export to C array files
    const exportFiles = makeCArrayFiles(
      result.frames,
      symbolName,
      options.exportOptions
    );

    return {
      files: exportFiles,
      validation: result.validation,
      exportTime: performance.now() - startTime,
    };
  } catch (error) {
    return {
      files: [],
      validation: {
        isValid: false,
        errors: [
          {
            type: 'invalid_parameters',
            message: `C array files export workflow failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            context: { error },
          },
        ],
        warnings: [],
      },
      exportTime: performance.now() - startTime,
    };
  }
}

/**
 * Complete workflow: files → canvas preview
 */
export async function processFilesToCanvas(
  files: File[],
  preset: DevicePreset,
  options: {
    monoOptions?: MonochromeOptions;
    packOptions?: Partial<PackingOptions>;
    renderOptions?: RenderOptions;
  } = {}
): Promise<{
  canvas: HTMLCanvasElement | null;
  frames: PackedFrame[];
  validation: ValidationResult;
  processingTime: number;
}> {
  const startTime = performance.now();

  try {
    // Process files to packed frames
    const result = await processFilesToPackedFrames(files, preset, options);

    if (!result.validation.isValid || result.frames.length === 0) {
      return {
        canvas: null,
        frames: result.frames,
        validation: result.validation,
        processingTime: performance.now() - startTime,
      };
    }

    // Render first frame to canvas
    const canvas = renderFrameToNewCanvas(
      result.frames[0]!,
      options.renderOptions
    );

    return {
      canvas,
      frames: result.frames,
      validation: result.validation,
      processingTime: performance.now() - startTime,
    };
  } catch (error) {
    return {
      canvas: null,
      frames: [],
      validation: {
        isValid: false,
        errors: [
          {
            type: 'invalid_parameters',
            message: `Canvas preview workflow failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            context: { error },
          },
        ],
        warnings: [],
      },
      processingTime: performance.now() - startTime,
    };
  }
}

/**
 * Complete workflow: files → animated canvas playback
 */
export async function processFilesToAnimation(
  files: File[],
  preset: DevicePreset,
  canvasContext: CanvasRenderingContext2D,
  options: {
    monoOptions?: MonochromeOptions;
    packOptions?: Partial<PackingOptions>;
    renderOptions?: RenderOptions;
    animationOptions?: AnimationOptions;
  } = {}
): Promise<{
  controller: AnimationController | null;
  frames: PackedFrame[];
  validation: ValidationResult;
  processingTime: number;
}> {
  const startTime = performance.now();

  try {
    // Process files to packed frames
    const result = await processFilesToPackedFrames(files, preset, options);

    if (!result.validation.isValid || result.frames.length === 0) {
      return {
        controller: null,
        frames: result.frames,
        validation: result.validation,
        processingTime: performance.now() - startTime,
      };
    }

    // Create emulator and start animation
    const emulator = createCanvasEmulator();
    const controller = emulator.playFramesOnCanvas(
      canvasContext,
      result.frames,
      options.animationOptions
    );

    return {
      controller,
      frames: result.frames,
      validation: result.validation,
      processingTime: performance.now() - startTime,
    };
  } catch (error) {
    return {
      controller: null,
      frames: [],
      validation: {
        isValid: false,
        errors: [
          {
            type: 'invalid_parameters',
            message: `Animation workflow failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            context: { error },
          },
        ],
        warnings: [],
      },
      processingTime: performance.now() - startTime,
    };
  }
}

/**
 * Utility function to estimate memory usage for a batch
 */
export function estimateMemoryUsage(
  fileGroups: File[][],
  preset: DevicePreset
): {
  estimatedBytes: number;
  recommendedBatchSize: number;
} {
  // Rough estimation based on preset dimensions
  const presetSizes = {
    SSD1306_128x32: 128 * 32 * 4, // RGBA bytes
    SSD1306_128x64: 128 * 64 * 4,
    SH1106_132x64: 132 * 64 * 4,
  };

  const bytesPerFrame = presetSizes[preset] || presetSizes.SSD1306_128x64;
  const totalFrames = fileGroups.reduce((sum, group) => sum + group.length, 0);

  // Estimate 3x overhead for processing (RGBA + Mono + Packed)
  const estimatedBytes = totalFrames * bytesPerFrame * 3;

  // Recommend batch size to stay under 100MB
  const maxMemory = 100 * 1024 * 1024; // 100MB
  const recommendedBatchSize = Math.max(
    1,
    Math.floor(maxMemory / (bytesPerFrame * 3))
  );

  return {
    estimatedBytes,
    recommendedBatchSize,
  };
}

/**
 * Create a display emulator instance for advanced use cases
 */
export function createEmulator(): DisplayEmulator {
  return createCanvasEmulator();
}

// Export default orchestrator instance
export const orchestrator = new ProcessingOrchestratorImpl();

// Export convenience functions - class is already exported above

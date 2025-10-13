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

    try {
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

    const results: PackedFrame[][] = [];
    const totalGroups = fileGroups.length;

    // Process in chunks to manage memory
    for (let i = 0; i < fileGroups.length; i += memoryLimit) {
      const chunk = fileGroups.slice(i, i + memoryLimit);
      const chunkResults: PackedFrame[][] = [];

      for (let j = 0; j < chunk.length; j++) {
        const fileGroup = chunk[j];
        if (!fileGroup) continue;

        const groupIndex = i + j;

        // Report progress
        if (progressCallback) {
          progressCallback(
            groupIndex,
            totalGroups,
            `Processing group ${groupIndex + 1}/${totalGroups}`
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
            chunkResults.push(result.frames);
          } else {
            // Log errors but continue processing other groups
            console.warn(
              `Failed to process file group ${groupIndex + 1}:`,
              result.validation.errors
            );
            chunkResults.push([]); // Empty result for failed group
          }
        } catch (error) {
          console.error(
            `Error processing file group ${groupIndex + 1}:`,
            error
          );
          chunkResults.push([]); // Empty result for failed group
        }
      }

      results.push(...chunkResults);

      // Force garbage collection between chunks if available
      if (typeof globalThis.gc === 'function') {
        globalThis.gc();
      }
    }

    // Final progress report
    if (progressCallback) {
      progressCallback(totalGroups, totalGroups, 'Batch processing complete');
    }

    return results;
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

import type {
  FrameRGBA,
  Dimensions,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  ImageDecoder,
  DevicePreset,
} from './types.js';

/**
 * Image decoder implementation for converting PNG files to RGBA frame data
 * Uses createImageBitmap for optimal performance in browsers
 */
export class DefaultImageDecoder implements ImageDecoder {
  /**
   * Decode uploaded PNG files into RGBA frame data
   * @param files - Array of File objects to decode
   * @returns Promise resolving to array of RGBA frames
   */
  async decodeImageFiles(files: File[]): Promise<FrameRGBA[]> {
    if (!files || files.length === 0) {
      throw new Error('No files provided for decoding');
    }

    const frames: FrameRGBA[] = [];
    const errors: ValidationError[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!file) {
        errors.push({
          type: 'corrupt_file',
          message: `File at index ${i} is undefined`,
          context: { index: i },
        });
        continue;
      }

      try {
        // Validate file type
        if (!this.isSupportedImageType(file)) {
          errors.push({
            type: 'unsupported_format',
            message: `Unsupported file format: ${file.type || 'unknown'}. Only PNG files are supported.`,
            context: { filename: file.name, type: file.type, index: i },
          });
          continue;
        }

        // Decode the image using createImageBitmap for optimal performance
        const bitmap = await createImageBitmap(file);

        // Extract RGBA pixel data
        const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          errors.push({
            type: 'corrupt_file',
            message: `Failed to create canvas context for file: ${file.name}`,
            context: { filename: file.name, index: i },
          });
          continue;
        }

        // Draw bitmap to canvas and extract pixel data
        ctx.drawImage(bitmap, 0, 0);
        const imageData = ctx.getImageData(0, 0, bitmap.width, bitmap.height);

        // Create frame object
        const delayMs = this.extractDelayFromFilename(file.name);
        const frame: FrameRGBA = {
          pixels: imageData.data,
          dims: {
            width: bitmap.width,
            height: bitmap.height,
          },
          // Extract delay from filename if present (e.g., frame_001_100ms.png)
          ...(delayMs !== undefined && { delayMs }),
        };

        frames.push(frame);

        // Clean up bitmap
        bitmap.close();
      } catch (error) {
        errors.push({
          type: 'corrupt_file',
          message: `Failed to decode file: ${file.name}. ${error instanceof Error ? error.message : 'Unknown error'}`,
          context: {
            filename: file.name,
            index: i,
            error: error instanceof Error ? error.message : String(error),
          },
        });
      }
    }

    // If we have errors but some frames were decoded, we could continue
    // For now, throw if any files failed to maintain strict error handling
    if (errors.length > 0) {
      const errorMessage = `Failed to decode ${errors.length} of ${files.length} files:\n${errors.map(e => `- ${e.message}`).join('\n')}`;
      throw new Error(errorMessage);
    }

    return frames;
  }

  /**
   * Validate that all frames have consistent dimensions matching the expected preset
   * @param frames - Array of RGBA frames to validate
   * @param expected - Expected dimensions
   * @returns Validation result with errors and warnings
   */
  validateDimensions(
    frames: FrameRGBA[],
    expected: Dimensions
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!frames || frames.length === 0) {
      errors.push({
        type: 'invalid_parameters',
        message: 'No frames provided for validation',
        context: { frameCount: 0 },
      });
      return { isValid: false, errors, warnings };
    }

    // Check each frame's dimensions
    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i];

      if (!frame) {
        errors.push({
          type: 'dimension_mismatch',
          message: `Frame ${i} is undefined`,
          context: { frameIndex: i },
        });
        continue;
      }

      if (!frame.dims) {
        errors.push({
          type: 'dimension_mismatch',
          message: `Frame ${i} is missing dimension information`,
          context: { frameIndex: i },
        });
        continue;
      }

      // Validate against expected dimensions
      if (
        frame.dims.width !== expected.width ||
        frame.dims.height !== expected.height
      ) {
        errors.push({
          type: 'dimension_mismatch',
          message: `Frame ${i} dimension mismatch. Expected ${expected.width}×${expected.height}, got ${frame.dims.width}×${frame.dims.height}`,
          context: {
            frameIndex: i,
            expected,
            actual: frame.dims,
          },
        });
      }

      // Check for consistent dimensions across all frames
      if (i > 0) {
        const firstFrame = frames[0];
        if (!firstFrame || !firstFrame.dims) {
          errors.push({
            type: 'dimension_mismatch',
            message: `First frame is missing or has no dimensions`,
            context: { frameIndex: 0 },
          });
          continue;
        }

        if (
          frame.dims.width !== firstFrame.dims.width ||
          frame.dims.height !== firstFrame.dims.height
        ) {
          errors.push({
            type: 'dimension_mismatch',
            message: `Frame ${i} has inconsistent dimensions. First frame: ${firstFrame.dims.width}×${firstFrame.dims.height}, Frame ${i}: ${frame.dims.width}×${frame.dims.height}`,
            context: {
              frameIndex: i,
              firstFrameDims: firstFrame.dims,
              currentFrameDims: frame.dims,
            },
          });
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Order frames by numeric suffix in filename (e.g., frame_001.png, frame_002.png)
   * @param frames - Array of RGBA frames
   * @param files - Corresponding array of File objects
   * @returns Ordered array of RGBA frames
   */
  orderFramesByFilename(frames: FrameRGBA[], files: File[]): FrameRGBA[] {
    if (frames.length !== files.length) {
      throw new Error(
        `Frame count (${frames.length}) does not match file count (${files.length})`
      );
    }

    if (frames.length <= 1) {
      return [...frames]; // Return copy for single frame or empty array
    }

    // Create array of frame-file pairs with extracted numeric indices
    const frameFilePairs = frames.map((frame, index) => {
      const file = files[index];
      if (!file) {
        throw new Error(`File at index ${index} is undefined`);
      }
      return {
        frame,
        file,
        numericIndex: this.extractNumericIndex(file.name),
        originalIndex: index,
      };
    });

    // Sort by numeric index, falling back to original order for non-numeric names
    frameFilePairs.sort((a, b) => {
      // If both have numeric indices, sort by them
      if (a.numericIndex !== null && b.numericIndex !== null) {
        return a.numericIndex - b.numericIndex;
      }

      // If only one has numeric index, prioritize it
      if (a.numericIndex !== null && b.numericIndex === null) {
        return -1;
      }
      if (a.numericIndex === null && b.numericIndex !== null) {
        return 1;
      }

      // If neither has numeric index, maintain original order
      return a.originalIndex - b.originalIndex;
    });

    // Check for gaps in numeric sequence and warn
    const numericIndices = frameFilePairs
      .map(pair => pair.numericIndex)
      .filter((index): index is number => index !== null)
      .sort((a, b) => a - b);

    if (numericIndices.length > 1) {
      for (let i = 1; i < numericIndices.length; i++) {
        const current = numericIndices[i];
        const previous = numericIndices[i - 1];
        if (
          current !== undefined &&
          previous !== undefined &&
          current - previous > 1
        ) {
          console.warn(
            `Gap detected in frame sequence: missing frames between ${previous} and ${current}`
          );
        }
      }
    }

    return frameFilePairs.map(pair => pair.frame);
  }

  /**
   * Check if a file is a supported image type
   * @param file - File to check
   * @returns True if file type is supported
   */
  private isSupportedImageType(file: File): boolean {
    // Check MIME type first
    if (file.type === 'image/png') {
      return true;
    }

    // Fallback to file extension if MIME type is not set
    const extension = file.name.toLowerCase().split('.').pop();
    return extension === 'png';
  }

  /**
   * Extract numeric index from filename (e.g., "frame_001.png" -> 1, "image_42.png" -> 42)
   * @param filename - Filename to parse
   * @returns Numeric index or null if not found
   */
  private extractNumericIndex(filename: string): number | null {
    // Remove file extension
    const nameWithoutExt = filename.replace(/\.[^.]*$/, '');

    // Look for numeric suffix patterns:
    // - frame_001, image_42, sprite-05, etc.
    const patterns = [
      /(\d+)$/, // Ends with digits
      /_(\d+)$/, // Underscore followed by digits at end
      /-(\d+)$/, // Dash followed by digits at end
      /\.(\d+)$/, // Dot followed by digits at end (before file extension)
    ];

    for (const pattern of patterns) {
      const match = nameWithoutExt.match(pattern);
      if (match && match[1]) {
        return parseInt(match[1], 10);
      }
    }

    return null;
  }

  /**
   * Extract delay timing from filename (e.g., "frame_001_100ms.png" -> 100)
   * @param filename - Filename to parse
   * @returns Delay in milliseconds or undefined if not found
   */
  private extractDelayFromFilename(filename: string): number | undefined {
    // Look for patterns like _100ms, _50ms, etc.
    const delayMatch = filename.match(/_(\d+)ms/i);
    if (delayMatch && delayMatch[1]) {
      return parseInt(delayMatch[1], 10);
    }
    return undefined;
  }
}

/**
 * Convenience function to create a decoder instance and decode files
 * @param files - Files to decode
 * @returns Promise resolving to RGBA frames
 */
export async function decodeImageFiles(files: File[]): Promise<FrameRGBA[]> {
  const decoder = new DefaultImageDecoder();
  return decoder.decodeImageFiles(files);
}

/**
 * Convenience function to decode and validate files against a device preset
 * @param files - Files to decode
 * @param preset - Device preset to validate against
 * @returns Promise resolving to frames and validation result
 */
export async function decodeAndValidateFiles(
  files: File[],
  preset: DevicePreset
): Promise<{ frames: FrameRGBA[]; validation: ValidationResult }> {
  const decoder = new DefaultImageDecoder();

  // Decode files
  const frames = await decoder.decodeImageFiles(files);

  // Order frames by filename
  const orderedFrames = decoder.orderFramesByFilename(frames, files);

  // Validate dimensions against preset
  const { getPresetDimensions } = await import('./presets.js');
  const expectedDims = getPresetDimensions(preset);
  const validation = decoder.validateDimensions(orderedFrames, expectedDims);

  return {
    frames: orderedFrames,
    validation,
  };
}

// Export the default decoder instance
export const imageDecoder = new DefaultImageDecoder();

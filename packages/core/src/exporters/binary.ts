import type { PackedFrame, ExportFile } from '../types/index.js';

/**
 * Binary exporter for raw byte data
 * Exports PackedFrame data as .bin files for direct firmware use
 */

/**
 * Generate binary files for packed frames
 * @param frames Array of packed frames to export
 * @param basename Base filename (without extension)
 * @returns Array of export files with .bin extension
 */
export function makeByteFiles(
  frames: PackedFrame[],
  basename: string
): ExportFile[] {
  if (!frames || frames.length === 0) {
    throw new Error('No frames provided for binary export');
  }

  if (!basename || basename.trim() === '') {
    throw new Error('Basename is required for binary export');
  }

  // Sanitize basename - remove any existing extension and invalid characters
  const sanitizedBasename = basename
    .replace(/\.[^/.]+$/, '') // Remove extension if present
    .replace(/[^a-zA-Z0-9_-]/g, '_'); // Replace invalid chars with underscore

  const exportFiles: ExportFile[] = [];

  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];

    if (!frame || !frame.bytes || frame.bytes.length === 0) {
      throw new Error(`Frame ${i} has no byte data`);
    }

    // Generate filename with frame index for multi-frame sequences
    const filename =
      frames.length === 1
        ? `${sanitizedBasename}.bin`
        : `${sanitizedBasename}_frame_${i.toString().padStart(3, '0')}.bin`;

    exportFiles.push({
      name: filename,
      data: new Uint8Array(frame.bytes), // Create copy to avoid reference issues
      mimeType: 'application/octet-stream',
    });
  }

  return exportFiles;
}

/**
 * Generate concatenated binary file for multi-frame data
 * Useful for firmware that expects all frames in a single binary blob
 * @param frames Array of packed frames to concatenate
 * @param basename Base filename (without extension)
 * @returns Single export file containing all frame data
 */
export function makeConcatenatedByteFile(
  frames: PackedFrame[],
  basename: string
): ExportFile {
  if (!frames || frames.length === 0) {
    throw new Error('No frames provided for concatenated binary export');
  }

  if (!basename || basename.trim() === '') {
    throw new Error('Basename is required for concatenated binary export');
  }

  // Calculate total size needed
  const totalSize = frames.reduce((sum, frame) => {
    if (!frame || !frame.bytes || frame.bytes.length === 0) {
      throw new Error('Frame has no byte data');
    }
    return sum + frame.bytes.length;
  }, 0);

  // Create concatenated buffer
  const concatenatedData = new Uint8Array(totalSize);
  let offset = 0;

  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    if (!frame || !frame.bytes) {
      throw new Error(`Frame ${i} has no byte data`);
    }
    concatenatedData.set(frame.bytes, offset);
    offset += frame.bytes.length;
  }

  // Sanitize basename
  const sanitizedBasename = basename
    .replace(/\.[^/.]+$/, '') // Remove extension if present
    .replace(/[^a-zA-Z0-9_-]/g, '_'); // Replace invalid chars with underscore

  const filename = `${sanitizedBasename}_all_frames.bin`;

  return {
    name: filename,
    data: concatenatedData,
    mimeType: 'application/octet-stream',
  };
}

/**
 * Validate binary export parameters
 * @param frames Array of frames to validate
 * @param basename Basename to validate
 * @returns True if parameters are valid
 */
export function validateBinaryExportParams(
  frames: PackedFrame[],
  basename: string
): boolean {
  if (!frames || frames.length === 0) {
    return false;
  }

  if (!basename || basename.trim() === '') {
    return false;
  }

  // Check that all frames have valid byte data
  return frames.every(frame => frame && frame.bytes && frame.bytes.length > 0);
}

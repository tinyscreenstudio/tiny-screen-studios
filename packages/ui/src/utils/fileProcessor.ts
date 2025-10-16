import { useAppStore } from '../store/appStore';
import type { DevicePreset } from '@tiny-screen-studios/core';

// Auto-detect device preset based on image dimensions
async function detectDevicePreset(files: File[]): Promise<DevicePreset | null> {
  if (files.length === 0) return null;

  try {
    // Import core functions
    const { decodeImageFiles, DEVICE_PRESETS } = await import(
      '@tiny-screen-studios/core'
    );

    // Decode just the first file to get dimensions
    const firstFile = files[0];
    if (!firstFile) return null;

    const frames = await decodeImageFiles([firstFile]);

    if (frames.length === 0) return null;

    const firstFrame = frames[0];
    if (!firstFrame?.dims) return null;

    const { width, height } = firstFrame.dims;

    // Find matching device preset
    for (const [presetKey, config] of Object.entries(DEVICE_PRESETS)) {
      if (config.width === width && config.height === height) {
        return presetKey as DevicePreset;
      }
    }

    return null; // No matching preset found
  } catch (error) {
    console.error('Error detecting device preset:', error);
    return null;
  }
}

let processingTimeout: ReturnType<typeof setTimeout> | null = null;

export async function processFiles(files: File[]) {
  const store = useAppStore.getState();

  if (store.isProcessing || files.length === 0) return;

  // Clear any existing timeout
  if (processingTimeout) {
    clearTimeout(processingTimeout);
  }

  // Debounce processing for threshold changes
  processingTimeout = setTimeout(async () => {
    await doProcessFiles(files);
  }, 150);
}

async function doProcessFiles(files: File[]) {
  const {
    setIsProcessing,
    setProgress,
    setValidationResults,
    setFileValidation,
    setCurrentPackedFrames,
    setShowExportPanel,
    setCurrentFrame,
    setIsAnimationPlaying,
    setDevicePreset,
    devicePreset,
    threshold,
    invert,
    dithering,
  } = useAppStore.getState();

  setIsProcessing(true);
  setShowExportPanel(false);
  setCurrentPackedFrames([]);
  setValidationResults(null);
  setCurrentFrame(0);
  setIsAnimationPlaying(false);

  try {
    // Validate files first
    setProgress('Validating files...', 10);
    const fileValidation = validateUploadedFiles(files);
    setFileValidation(fileValidation);

    if (fileValidation.validCount === 0) {
      throw new Error('No valid PNG files to process');
    }

    // Filter valid files
    const validFiles = files.filter(
      (_, index) => !fileValidation.fileErrors.has(index)
    );

    // Auto-detect device preset based on image dimensions
    setProgress('Detecting device type...', 20);
    const detectedPreset = await detectDevicePreset(validFiles);

    let finalDevicePreset = devicePreset;
    if (detectedPreset) {
      finalDevicePreset = detectedPreset;
      setDevicePreset(detectedPreset);
    } else {
      // If no preset detected, get dimensions and show helpful error
      try {
        const { decodeImageFiles } = await import('@tiny-screen-studios/core');
        const firstValidFile = validFiles[0];
        if (!firstValidFile) return;

        const frames = await decodeImageFiles([firstValidFile]);
        if (frames.length > 0) {
          const firstFrame = frames[0];
          if (!firstFrame?.dims) return;

          const { width, height } = firstFrame.dims;
          throw new Error(
            `Unsupported image dimensions: ${width}×${height}. ` +
              `Supported sizes: 128×32 (SSD1306), 128×64 (SSD1306), 132×64 (SH1106)`
          );
        }
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes('Unsupported image dimensions')
        ) {
          throw error;
        }
        // If we can't decode, continue with current preset and let normal validation handle it
        console.warn(
          'Could not detect image dimensions, using current preset:',
          error
        );
      }
    }

    setProgress('Decoding images...', 25);

    // Import core functions
    const { decodeAndValidateFiles, toMonochrome, packFrames } = await import(
      '@tiny-screen-studios/core'
    );

    // Decode PNG files
    const { frames: rgbaFrames, validation } = await decodeAndValidateFiles(
      validFiles,
      finalDevicePreset as DevicePreset
    );

    setValidationResults(validation);

    if (!validation.isValid) {
      throw new Error('Validation failed - see details above');
    }

    setProgress('Converting to monochrome...', 50);

    // Convert to monochrome
    const monoOptions = {
      threshold,
      dithering: dithering ? ('bayer4' as const) : ('none' as const),
      invert: dithering ? false : invert, // Only apply invert in mono if not dithering
    };

    const monoFrames = toMonochrome(rgbaFrames, monoOptions);

    setProgress('Packing for device format...', 75);

    // Pack frames for the selected device
    const packingOptions = {
      preset: finalDevicePreset as DevicePreset,
      invert: dithering ? invert : false, // Apply invert in packing if dithering
    };

    const packedFrames = packFrames(monoFrames, packingOptions);

    setProgress('Complete!', 100);
    setCurrentPackedFrames(packedFrames);
    setShowExportPanel(true);

    // Clear progress after a short delay
    setTimeout(() => {
      setProgress('', 0);
    }, 1000);
  } catch (error) {
    console.error('Error processing files:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage !== 'Validation failed - see details above') {
      setValidationResults({
        isValid: false,
        errors: [{ message: errorMessage }],
        warnings: [],
      });
    }

    setProgress('', 0);
  } finally {
    setIsProcessing(false);
  }
}

function validateUploadedFiles(files: File[]) {
  const fileErrors = new Map<number, string>();
  const warnings: string[] = [];
  let validCount = 0;

  files.forEach((file, index) => {
    // Check if file exists and is not empty
    if (!file) {
      fileErrors.set(index, 'File is missing or corrupted');
      return;
    }

    if (file.size === 0) {
      fileErrors.set(index, 'File is empty');
      return;
    }

    // Check file type
    if (
      !file.type.includes('image/png') &&
      !file.name.toLowerCase().endsWith('.png')
    ) {
      fileErrors.set(index, 'Only PNG files are supported');
      return;
    }

    // Check file size (warn if very large)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      fileErrors.set(index, 'File is too large (max 10MB)');
      return;
    }

    // Warn about large files
    const warnSize = 2 * 1024 * 1024; // 2MB
    if (file.size > warnSize) {
      warnings.push(
        `${file.name} is large (${formatFileSize(file.size)}) and may take longer to process`
      );
    }

    validCount++;
  });

  // Check for potential animation sequences
  if (files.length > 1) {
    const numericFiles = files.filter(file =>
      /\d+/.test(file.name.replace(/\.[^.]*$/, ''))
    );

    if (numericFiles.length > 0 && numericFiles.length < files.length) {
      warnings.push(
        'Mix of numbered and non-numbered files detected. Frame ordering may be unexpected.'
      );
    }

    if (files.length > 100) {
      warnings.push(
        `Processing ${files.length} files may take a while and use significant memory.`
      );
    }
  }

  return { fileErrors, warnings, validCount };
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

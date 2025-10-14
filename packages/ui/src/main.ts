// UI entry point - Basic structure for Tiny Screen Studios
import {
  version,
  DEVICE_PRESETS,
  type DevicePreset,
} from '@tiny-screen-studios/core';

// eslint-disable-next-line no-console
console.log(`Tiny Screen Studios v${version}`);

// DOM element references
const fileInput = document.getElementById('fileInput') as HTMLInputElement;
const fileInputArea = document.getElementById(
  'fileInputArea'
) as HTMLDivElement;
const devicePreset = document.getElementById(
  'devicePreset'
) as HTMLSelectElement;
const threshold = document.getElementById('threshold') as HTMLInputElement;
const thresholdValue = document.getElementById(
  'thresholdValue'
) as HTMLSpanElement;
const invert = document.getElementById('invert') as HTMLInputElement;
const dithering = document.getElementById('dithering') as HTMLInputElement;
const previewCanvas = document.getElementById(
  'previewCanvas'
) as HTMLCanvasElement;
const canvasPlaceholder = document.getElementById(
  'canvasPlaceholder'
) as HTMLDivElement;
const scale = document.getElementById('scale') as HTMLInputElement;
const scaleValue = document.getElementById('scaleValue') as HTMLSpanElement;
const showGrid = document.getElementById('showGrid') as HTMLInputElement;
const statusMessage = document.getElementById(
  'statusMessage'
) as HTMLDivElement;
const progressContainer = document.getElementById(
  'progressContainer'
) as HTMLDivElement;
const progressFill = document.getElementById('progressFill') as HTMLDivElement;
const progressText = document.getElementById('progressText') as HTMLDivElement;
const fileList = document.getElementById('fileList') as HTMLDivElement;
const validationResults = document.getElementById(
  'validationResults'
) as HTMLDivElement;

// Application state
let currentFiles: File[] = [];
let currentPreset = 'SSD1306_128x32';
let isProcessing = false;

// Initialize the application
function init(): void {
  setupEventListeners();
  updateCanvasSize();
  showStatus('Ready to process files', 'info');
}

// Set up all event listeners
function setupEventListeners(): void {
  // File input handling
  fileInput.addEventListener('change', handleFileSelect);

  // Drag and drop
  fileInputArea.addEventListener('dragover', handleDragOver);
  fileInputArea.addEventListener('dragleave', handleDragLeave);
  fileInputArea.addEventListener('drop', handleFileDrop);

  // Control changes
  devicePreset.addEventListener('change', handlePresetChange);
  threshold.addEventListener('input', handleThresholdChange);
  invert.addEventListener('change', handleSettingsChange);
  dithering.addEventListener('change', handleSettingsChange);
  scale.addEventListener('input', handleScaleChange);
  showGrid.addEventListener('change', handleSettingsChange);
}

// File handling functions
function handleFileSelect(event: Event): void {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    handleFileUpload(Array.from(target.files));
  }
}

function handleDragOver(event: DragEvent): void {
  event.preventDefault();
  fileInputArea.classList.add('dragover');
}

function handleDragLeave(event: DragEvent): void {
  event.preventDefault();
  fileInputArea.classList.remove('dragover');
}

function handleFileDrop(event: DragEvent): void {
  event.preventDefault();
  fileInputArea.classList.remove('dragover');

  if (event.dataTransfer?.files) {
    handleFileUpload(Array.from(event.dataTransfer.files));
  }
}

// Settings change handlers
function handlePresetChange(): void {
  if (isProcessing) {
    return;
  }

  currentPreset = devicePreset.value;
  updateCanvasSize();
  showStatus(`Changed to ${currentPreset}`, 'info');

  // Reprocess files if any are loaded
  if (currentFiles.length > 0) {
    processFiles(currentFiles).catch(error => {
      console.error('Error in handlePresetChange:', error);
    });
  }
}

function handleThresholdChange(): void {
  thresholdValue.textContent = threshold.value;

  // Reprocess files if any are loaded
  if (currentFiles.length > 0 && !isProcessing) {
    processFiles(currentFiles).catch(error => {
      console.error('Error in handleThresholdChange:', error);
    });
  }
}

function handleScaleChange(): void {
  const scaleVal = parseInt(scale.value);
  scaleValue.textContent = `${scaleVal}x`;

  // Re-render current frame with new scale if files are loaded
  if (currentFiles.length > 0 && !isProcessing) {
    processFiles(currentFiles).catch(error => {
      console.error('Error in handleScaleChange:', error);
    });
  }
}

function handleSettingsChange(): void {
  // Reprocess files if any are loaded
  if (currentFiles.length > 0 && !isProcessing) {
    processFiles(currentFiles).catch(error => {
      console.error('Error in handleSettingsChange:', error);
    });
  }
}

// Canvas management
function updateCanvasSize(): void {
  const presetConfig =
    DEVICE_PRESETS[currentPreset as keyof typeof DEVICE_PRESETS];
  if (presetConfig) {
    // Set the logical canvas size to match the device preset
    previewCanvas.width = presetConfig.width;
    previewCanvas.height = presetConfig.height;
    // Don't set the display size here - let the emulator handle scaling
  }
}

// Enhanced file upload handler with validation
function handleFileUpload(files: File[]): void {
  if (isProcessing) {
    showStatus('Already processing files. Please wait...', 'warning');
    return;
  }

  if (files.length === 0) {
    showStatus('No files selected', 'warning');
    return;
  }

  // Validate files before processing
  const validation = validateUploadedFiles(files);
  displayFileList(files, validation);
  displayValidationResults(validation);

  // If there are valid files, process them
  const validFiles = files.filter(
    (_, index) => !validation.fileErrors.has(index)
  );

  if (validFiles.length > 0) {
    processFiles(validFiles).catch(error => {
      console.error('Error processing files:', error);
      hideProgress();
      showStatus(
        `Error processing files: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error'
      );
    });
  } else {
    showStatus('No valid PNG files to process', 'error');
  }
}

// Client-side file validation
function validateUploadedFiles(files: File[]): {
  fileErrors: Map<number, string>;
  warnings: string[];
  validCount: number;
} {
  const fileErrors = new Map<number, string>();
  const warnings: string[] = [];
  let validCount = 0;

  // Check each file
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

// Display file list with validation status
function displayFileList(
  files: File[],
  validation: ReturnType<typeof validateUploadedFiles>
): void {
  if (files.length === 0) {
    fileList.style.display = 'none';
    return;
  }

  fileList.innerHTML = '';
  fileList.style.display = 'block';

  files.forEach((file, index) => {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';

    const fileName = document.createElement('div');
    fileName.className = 'file-name';
    fileName.textContent = file.name;

    const fileStatus = document.createElement('div');
    fileStatus.className = 'file-status';

    const error = validation.fileErrors.get(index);
    if (error) {
      fileStatus.textContent = error;
      fileStatus.classList.add('invalid');
    } else {
      fileStatus.textContent = `${formatFileSize(file.size)} - Valid`;
      fileStatus.classList.add('valid');
    }

    fileItem.appendChild(fileName);
    fileItem.appendChild(fileStatus);
    fileList.appendChild(fileItem);
  });
}

// Display validation results
function displayValidationResults(
  validation: ReturnType<typeof validateUploadedFiles>
): void {
  validationResults.innerHTML = '';

  // Show summary
  if (validation.validCount > 0) {
    const summary = document.createElement('div');
    summary.className = 'validation-item success';
    summary.textContent = `${validation.validCount} valid PNG file(s) ready for processing`;
    validationResults.appendChild(summary);
  }

  // Show errors
  if (validation.fileErrors.size > 0) {
    const errorSummary = document.createElement('div');
    errorSummary.className = 'validation-item validation-error';
    errorSummary.textContent = `${validation.fileErrors.size} file(s) have errors and will be skipped`;
    validationResults.appendChild(errorSummary);
  }

  // Show warnings
  validation.warnings.forEach(warning => {
    const warningItem = document.createElement('div');
    warningItem.className = 'validation-item validation-warning';
    warningItem.textContent = warning;
    validationResults.appendChild(warningItem);
  });
}

// Progress indication functions
function showProgress(text: string = 'Processing files...'): void {
  progressContainer.style.display = 'block';
  progressText.textContent = text;
  progressFill.style.width = '0%';
}

function updateProgress(percentage: number, text?: string): void {
  progressFill.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
  if (text) {
    progressText.textContent = text;
  }
}

function hideProgress(): void {
  progressContainer.style.display = 'none';
}

// Display validation results from decoding process
function displayDecodingValidation(validation: {
  isValid: boolean;
  errors: Array<{
    message: string;
    context?: unknown;
  }>;
  warnings: Array<{ message: string }>;
}): void {
  // Clear previous validation results
  const existingDecodingResults = validationResults.querySelectorAll(
    '.decoding-validation'
  );
  existingDecodingResults.forEach(el => el.remove());

  // Show decoding errors
  validation.errors.forEach(error => {
    const errorItem = document.createElement('div');
    errorItem.className =
      'validation-item validation-error decoding-validation';

    let message = error.message;
    if (error.context && typeof error.context === 'object') {
      const context = error.context as {
        frameIndex?: number;
        filename?: string;
      };
      if (context.frameIndex !== undefined) {
        message = `Frame ${context.frameIndex}: ${message}`;
      }
      if (context.filename) {
        message = `${context.filename}: ${message}`;
      }
    }

    errorItem.textContent = message;
    validationResults.appendChild(errorItem);
  });

  // Show decoding warnings
  validation.warnings.forEach(warning => {
    const warningItem = document.createElement('div');
    warningItem.className =
      'validation-item validation-warning decoding-validation';
    warningItem.textContent = warning.message;
    validationResults.appendChild(warningItem);
  });
}

// Utility function to format file sizes
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// File processing - decode, convert, and render PNG files
async function processFiles(files: File[]): Promise<void> {
  if (isProcessing) {
    return;
  }

  isProcessing = true;
  currentFiles = files;

  try {
    showProgress('Decoding images...');
    updateProgress(10, 'Decoding images...');

    // Import the core functions we need
    const { decodeAndValidateFiles } = await import(
      '@tiny-screen-studios/core'
    );
    const { toMonochrome } = await import('@tiny-screen-studios/core');
    const { packFrames } = await import('@tiny-screen-studios/core');
    const { createCanvasEmulator } = await import('@tiny-screen-studios/core');

    updateProgress(25, 'Validating dimensions...');

    // Decode PNG files to RGBA frames
    const { frames: rgbaFrames, validation } = await decodeAndValidateFiles(
      files,
      currentPreset as DevicePreset
    );

    // Display detailed validation results
    displayDecodingValidation(validation);

    // If there are validation errors, stop processing
    if (!validation.isValid) {
      throw new Error(
        `Validation failed: ${validation.errors.map(e => e.message).join(', ')}`
      );
    }

    updateProgress(50, 'Converting to monochrome...');

    // Convert to monochrome
    const isDitheringEnabled = dithering.checked;
    const isInvertEnabled = invert.checked;

    const monoOptions = {
      threshold: parseInt(threshold.value),
      dithering: isDitheringEnabled ? ('bayer4' as const) : ('none' as const),
      invert: isDitheringEnabled ? false : isInvertEnabled, // Only apply invert in mono if not dithering
    };

    const monoFrames = toMonochrome(rgbaFrames, monoOptions);

    updateProgress(75, 'Packing for device format...');

    // Pack frames for the selected device
    const packingOptions = {
      preset: currentPreset as DevicePreset,
      invert: isDitheringEnabled ? isInvertEnabled : false, // Apply invert in packing if dithering
    };

    const packedFrames = packFrames(monoFrames, packingOptions);

    updateProgress(90, 'Rendering preview...');

    // Show canvas and hide placeholder
    previewCanvas.style.display = 'block';
    canvasPlaceholder.style.display = 'none';

    // Render the first frame to canvas
    if (packedFrames.length > 0) {
      const emulator = createCanvasEmulator();
      const ctx = previewCanvas.getContext('2d');

      if (ctx) {
        const renderOptions = {
          scale: parseInt(scale.value),
          showGrid: showGrid.checked,
        };

        const firstFrame = packedFrames[0];
        if (firstFrame) {
          emulator.renderFrameToCanvas(ctx, firstFrame, renderOptions);

          updateProgress(100, 'Complete!');

          setTimeout(() => {
            hideProgress();
            showStatus(
              `Successfully processed ${packedFrames.length} frame(s)`,
              'success'
            );
          }, 500);
        } else {
          throw new Error('No frames to render');
        }
      } else {
        throw new Error('Failed to get canvas context');
      }
    }
  } catch (error) {
    console.error('Error processing files:', error);
    hideProgress();
    showStatus(
      `Error processing files: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'error'
    );

    // Hide canvas and show placeholder on error
    previewCanvas.style.display = 'none';
    canvasPlaceholder.style.display = 'block';
  } finally {
    isProcessing = false;
  }
}

// Status message handling
function showStatus(
  message: string,
  type: 'info' | 'success' | 'warning' | 'error' = 'info'
): void {
  statusMessage.textContent = message;
  statusMessage.className = type;

  // Auto-clear non-error messages after 5 seconds
  if (type !== 'error') {
    setTimeout(() => {
      if (statusMessage.textContent === message) {
        statusMessage.textContent = 'Ready to process files';
        statusMessage.className = '';
      }
    }, 5000);
  }
}

// Initialize the application when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

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

// Application state
let currentFiles: File[] = [];
let currentPreset = 'SSD1306_128x32';

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
    processFiles(Array.from(target.files)).catch(error => {
      console.error('Error in handleFileSelect:', error);
    });
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
    processFiles(Array.from(event.dataTransfer.files)).catch(error => {
      console.error('Error in handleFileDrop:', error);
    });
  }
}

// Settings change handlers
function handlePresetChange(): void {
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
  if (currentFiles.length > 0) {
    processFiles(currentFiles).catch(error => {
      console.error('Error in handleThresholdChange:', error);
    });
  }
}

function handleScaleChange(): void {
  const scaleVal = parseInt(scale.value);
  scaleValue.textContent = `${scaleVal}x`;

  // Re-render current frame with new scale if files are loaded
  if (currentFiles.length > 0) {
    processFiles(currentFiles).catch(error => {
      console.error('Error in handleScaleChange:', error);
    });
  }
}

function handleSettingsChange(): void {
  // Reprocess files if any are loaded
  if (currentFiles.length > 0) {
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

// File processing - decode, convert, and render PNG files
async function processFiles(files: File[]): Promise<void> {
  currentFiles = files;

  // Filter PNG files
  const pngFiles = files.filter(file => file.type === 'image/png');

  if (pngFiles.length === 0) {
    showStatus('Please select PNG files only', 'error');
    return;
  }

  if (pngFiles.length !== files.length) {
    showStatus(
      `Filtered to ${pngFiles.length} PNG files out of ${files.length} total`,
      'warning'
    );
  }

  try {
    showStatus('Processing images...', 'info');

    // Import the core functions we need
    const { decodeAndValidateFiles } = await import(
      '@tiny-screen-studios/core'
    );
    const { toMonochrome } = await import('@tiny-screen-studios/core');
    const { packFrames } = await import('@tiny-screen-studios/core');
    const { createCanvasEmulator } = await import('@tiny-screen-studios/core');

    // Decode PNG files to RGBA frames
    const { frames: rgbaFrames, validation } = await decodeAndValidateFiles(
      pngFiles,
      currentPreset as DevicePreset
    );

    // Show validation warnings if any
    if (validation.warnings.length > 0) {
      console.warn('Validation warnings:', validation.warnings);
    }

    // Convert to monochrome
    const isDitheringEnabled = dithering.checked;
    const isInvertEnabled = invert.checked;

    const monoOptions = {
      threshold: parseInt(threshold.value),
      dithering: isDitheringEnabled ? ('bayer4' as const) : ('none' as const),
      invert: isDitheringEnabled ? false : isInvertEnabled, // Only apply invert in mono if not dithering
    };

    const monoFrames = toMonochrome(rgbaFrames, monoOptions);

    // Pack frames for the selected device
    const packingOptions = {
      preset: currentPreset as DevicePreset,
      invert: isDitheringEnabled ? isInvertEnabled : false, // Apply invert in packing if dithering
    };

    const packedFrames = packFrames(monoFrames, packingOptions);

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

          showStatus(
            `Successfully processed ${packedFrames.length} frame(s)`,
            'success'
          );
        } else {
          throw new Error('No frames to render');
        }
      } else {
        throw new Error('Failed to get canvas context');
      }
    }
  } catch (error) {
    console.error('Error processing files:', error);
    showStatus(
      `Error processing files: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'error'
    );

    // Hide canvas and show placeholder on error
    previewCanvas.style.display = 'none';
    canvasPlaceholder.style.display = 'block';
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

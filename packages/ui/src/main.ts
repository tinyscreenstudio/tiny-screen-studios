// UI entry point - Basic structure for Tiny Screen Studios
import {
  version,
  DEVICE_PRESETS,
  type DevicePreset,
  type PackedFrame,
  type AnimationController,
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
// Animation controls
const animationControls = document.getElementById(
  'animationControls'
) as HTMLDivElement;
const playbackControls = document.getElementById(
  'playbackControls'
) as HTMLDivElement;
const fps = document.getElementById('fps') as HTMLInputElement;
const fpsValue = document.getElementById('fpsValue') as HTMLSpanElement;
const playStopBtn = document.getElementById('playStopBtn') as HTMLButtonElement;
const frameSlider = document.getElementById('frameSlider') as HTMLInputElement;
const frameValue = document.getElementById('frameValue') as HTMLSpanElement;
const totalFrames = document.getElementById('totalFrames') as HTMLSpanElement;
// Status message element removed - using validation results instead
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
let currentPackedFrames: PackedFrame[] = []; // Store processed frames for re-rendering
let thresholdDebounceTimer: ReturnType<typeof setTimeout> | null = null;
// Animation state
let animationController: AnimationController | null = null;
let isAnimationPlaying = false;

// Initialize the application
function init(): void {
  setupEventListeners();
  updateCanvasSize();
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
  invert.addEventListener('change', handleInvertChange);
  dithering.addEventListener('change', handleDitheringChange);
  scale.addEventListener('input', handleScaleChange);
  showGrid.addEventListener('change', handleGridChange);

  // Animation control listeners
  fps.addEventListener('input', handleFpsChange);
  playStopBtn.addEventListener('click', handlePlayStopClick);
  frameSlider.addEventListener('input', handleFrameSliderChange);
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

  const oldPreset = currentPreset;
  currentPreset = devicePreset.value;
  updateCanvasSize();
  // Don't show preset change messages - they're not needed

  // Reprocess files if any are loaded and preset actually changed
  if (currentFiles.length > 0 && oldPreset !== currentPreset) {
    processFiles(currentFiles).catch(error => {
      console.error('Error in handlePresetChange:', error);
    });
  }
}

function handleThresholdChange(): void {
  const newThreshold = threshold.value;
  thresholdValue.textContent = newThreshold;

  // Trigger real-time preview update if files are loaded
  if (currentFiles.length > 0 && !isProcessing) {
    // Debounce the processing to avoid excessive updates during slider drag
    if (thresholdDebounceTimer !== null) {
      clearTimeout(thresholdDebounceTimer);
    }
    thresholdDebounceTimer = setTimeout(() => {
      processFiles(currentFiles).catch(error => {
        console.error('Error in handleThresholdChange:', error);
      });
    }, 150); // 150ms debounce
  }
}

function handleScaleChange(): void {
  const scaleVal = parseInt(scale.value);
  scaleValue.textContent = `${scaleVal}x`;

  // Re-render current frame with new scale if files are loaded
  if (
    currentFiles.length > 0 &&
    !isProcessing &&
    currentPackedFrames.length > 0
  ) {
    // Scale changes only affect rendering, not processing
    renderCurrentFrame();
  }
}

function handleInvertChange(): void {
  // Trigger real-time preview update if files are loaded
  if (currentFiles.length > 0 && !isProcessing) {
    processFiles(currentFiles).catch(error => {
      console.error('Error in handleInvertChange:', error);
    });
  }
}

function handleDitheringChange(): void {
  // Trigger real-time preview update if files are loaded
  if (currentFiles.length > 0 && !isProcessing) {
    processFiles(currentFiles).catch(error => {
      console.error('Error in handleDitheringChange:', error);
    });
  }
}

function handleGridChange(): void {
  // Grid changes only affect rendering, not processing
  if (
    currentFiles.length > 0 &&
    !isProcessing &&
    currentPackedFrames.length > 0
  ) {
    renderCurrentFrame();
  }
}

// Animation control handlers
function handleFpsChange(): void {
  const newFps = parseInt(fps.value);
  fpsValue.textContent = newFps.toString();

  // Update animation controller FPS if animation is active
  if (animationController) {
    animationController.setFPS(newFps);
  }
}

function handlePlayStopClick(): void {
  if (!animationController || currentPackedFrames.length <= 1) {
    return;
  }

  if (isAnimationPlaying) {
    // Stop animation
    animationController.stop();
    isAnimationPlaying = false;
    playStopBtn.textContent = 'Play';
  } else {
    // Start animation - create new controller to restart
    startAnimation();
  }
}

function handleFrameSliderChange(): void {
  const frameIndex = parseInt(frameSlider.value);
  frameValue.textContent = (frameIndex + 1).toString();

  // Jump to specific frame
  if (animationController) {
    animationController.goTo(frameIndex);
  }
}

// Animation management functions
async function startAnimation(): Promise<void> {
  if (currentPackedFrames.length <= 1) {
    return;
  }

  try {
    const { createCanvasEmulator } = await import('@tiny-screen-studios/core');
    const emulator = createCanvasEmulator();
    const ctx = previewCanvas.getContext('2d');

    if (ctx) {
      const animationOptions = {
        fps: parseInt(fps.value),
        loop: true,
        pingpong: false,
      };

      // Stop existing animation if any
      if (animationController) {
        animationController.stop();
      }

      // Create new animation controller
      animationController = emulator.playFramesOnCanvas(
        ctx,
        currentPackedFrames,
        animationOptions
      );
      isAnimationPlaying = true;
      playStopBtn.textContent = 'Stop';

      // Update frame slider as animation plays
      updateFrameSliderFromAnimation();
    }
  } catch (error) {
    console.error('Error starting animation:', error);
  }
}

function updateFrameSliderFromAnimation(): void {
  if (!animationController || !isAnimationPlaying) {
    return;
  }

  const currentFrame = animationController.getCurrentFrame();
  frameSlider.value = currentFrame.toString();
  frameValue.textContent = (currentFrame + 1).toString();

  // Continue updating if animation is still playing
  if (isAnimationPlaying) {
    requestAnimationFrame(() => updateFrameSliderFromAnimation());
  }
}

function stopAnimation(): void {
  if (animationController) {
    animationController.stop();
    animationController = null;
  }
  isAnimationPlaying = false;
  playStopBtn.textContent = 'Play';
}

function setupAnimationControls(frameCount: number): void {
  if (frameCount > 1) {
    // Show animation controls for multi-frame content
    animationControls.style.display = 'block';
    playbackControls.style.display = 'block';

    // Setup frame slider
    frameSlider.max = (frameCount - 1).toString();
    frameSlider.value = '0';
    frameValue.textContent = '1';
    totalFrames.textContent = frameCount.toString();

    // Reset play button
    playStopBtn.textContent = 'Play';
    isAnimationPlaying = false;
  } else {
    // Hide animation controls for single frames
    animationControls.style.display = 'none';
    playbackControls.style.display = 'none';
    stopAnimation();
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

// Render the current frame with current settings (for scale/grid changes)
async function renderCurrentFrame(): Promise<void> {
  if (currentPackedFrames.length === 0) {
    return;
  }

  try {
    const { createCanvasEmulator } = await import('@tiny-screen-studios/core');
    const emulator = createCanvasEmulator();
    const ctx = previewCanvas.getContext('2d');

    if (ctx && currentPackedFrames[0]) {
      const renderOptions = {
        scale: parseInt(scale.value),
        showGrid: showGrid.checked,
      };

      // If we have animation controller and it's not playing, render the current frame from controller
      if (animationController && !isAnimationPlaying) {
        const currentFrameIndex = animationController.getCurrentFrame();
        const frameToRender =
          currentPackedFrames[currentFrameIndex] || currentPackedFrames[0];
        emulator.renderFrameToCanvas(ctx, frameToRender, renderOptions);
      } else if (!animationController) {
        // No animation controller, render first frame
        emulator.renderFrameToCanvas(
          ctx,
          currentPackedFrames[0],
          renderOptions
        );
      }
      // If animation is playing, let the animation controller handle rendering
    }
  } catch (error) {
    console.error('Error rendering frame:', error);
  }
}

// Enhanced file upload handler with validation
function handleFileUpload(files: File[]): void {
  if (isProcessing) {
    showMessage('Already processing files. Please wait...', 'warning');
    return;
  }

  if (files.length === 0) {
    showMessage('No files selected', 'warning');
    return;
  }

  // Clear any previous messages when starting new file processing
  clearMessages();

  // Validate files before processing
  const validation = validateUploadedFiles(files);
  displayFileList(files, validation);
  displayValidationResults(validation);

  // If there are valid files, process them
  const validFiles = files.filter(
    (_, index) => !validation.fileErrors.has(index)
  );

  if (validFiles.length > 0) {
    // processFiles handles its own error display, so we don't need to catch here
    processFiles(validFiles).catch(error => {
      console.error('Error processing files:', error);
      // Error handling is done inside processFiles
    });
  } else {
    showMessage('No valid PNG files to process', 'error');
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

// Clear all validation results
function clearValidationResults(): void {
  validationResults.innerHTML = '';
}

// Display validation results
function displayValidationResults(
  validation: ReturnType<typeof validateUploadedFiles>
): void {
  // Clear previous results first
  clearValidationResults();

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
  // Clear all previous results to avoid clutter
  clearValidationResults();

  // Show decoding errors directly without redundant header
  validation.errors.forEach(error => {
    const errorItem = document.createElement('div');
    errorItem.className = 'validation-item validation-error';

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
    warningItem.className = 'validation-item validation-warning';
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
    // Clear any previous messages
    clearMessages();

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
      // Don't show error in status bar since it's already shown in validation results
      throw new Error('Validation failed - see details above');
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

    // Store packed frames for re-rendering
    currentPackedFrames = packedFrames;

    updateProgress(90, 'Rendering preview...');

    // Show canvas and hide placeholder
    previewCanvas.style.display = 'block';
    canvasPlaceholder.style.display = 'none';

    // Set up animation controls and render preview
    if (packedFrames.length > 0) {
      const emulator = createCanvasEmulator();
      const ctx = previewCanvas.getContext('2d');

      if (ctx) {
        // Setup animation controls based on frame count
        setupAnimationControls(packedFrames.length);

        const renderOptions = {
          scale: parseInt(scale.value),
          showGrid: showGrid.checked,
        };

        const firstFrame = packedFrames[0];
        if (firstFrame) {
          // Stop any existing animation
          stopAnimation();

          if (packedFrames.length > 1) {
            // Multi-frame: set up animation controller but don't start playing
            animationController = emulator.playFramesOnCanvas(
              ctx,
              packedFrames,
              {
                fps: parseInt(fps.value),
                loop: true,
                pingpong: false,
              }
            );
            // Stop it immediately so user can control playback
            animationController.stop();
            isAnimationPlaying = false;

            // Render first frame with proper scaling
            emulator.renderFrameToCanvas(ctx, firstFrame, renderOptions);
          } else {
            // Single frame: just render it
            emulator.renderFrameToCanvas(ctx, firstFrame, renderOptions);
          }

          updateProgress(100, 'Complete!');

          setTimeout(() => {
            hideProgress();
            showMessage(
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

    // Only show generic error if it's not a validation error (validation errors are already shown)
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage !== 'Validation failed - see details above') {
      showMessage(`Error: ${errorMessage}`, 'error');
    }
    // For validation errors, the details are already shown by displayDecodingValidation

    // Clear stored frames and hide canvas on error
    currentPackedFrames = [];
    previewCanvas.style.display = 'none';
    canvasPlaceholder.style.display = 'block';

    // Clean up animation state
    stopAnimation();
    setupAnimationControls(0);
  } finally {
    isProcessing = false;
  }
}

// Unified message system using validation results section
function showMessage(
  message: string,
  type: 'info' | 'success' | 'warning' | 'error' = 'info'
): void {
  // Clear previous messages
  clearValidationResults();

  const messageItem = document.createElement('div');
  messageItem.className = `validation-item validation-${type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'success'}`;
  messageItem.textContent = message;

  validationResults.appendChild(messageItem);

  // Auto-clear success/info messages after 5 seconds
  if (type === 'success' || type === 'info') {
    setTimeout(() => {
      if (validationResults.contains(messageItem)) {
        validationResults.removeChild(messageItem);
      }
    }, 5000);
  }
}

// Clear all messages
function clearMessages(): void {
  clearValidationResults();
}

// Initialize the application when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

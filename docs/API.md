# API Reference

This document provides comprehensive documentation for the `@tiny-screen-studios/core` library API.

## Table of Contents

- [Installation](#installation)
- [Core Types](#core-types)
- [Image Processing](#image-processing)
- [Monochrome Conversion](#monochrome-conversion)
- [Byte Packing](#byte-packing)
- [Canvas Emulation](#canvas-emulation)
- [Export Functions](#export-functions)
- [Orchestrator](#orchestrator)
- [Validation](#validation)
- [Performance](#performance)
- [Error Handling](#error-handling)

## Installation

```bash
npm install @tiny-screen-studios/core
# or
pnpm add @tiny-screen-studios/core
# or
yarn add @tiny-screen-studios/core
```

## Core Types

### Frame Types

```typescript
type Dimensions = { 
  width: number; 
  height: number; 
};

type FrameRGBA = {
  pixels: Uint8ClampedArray; // RGBA pixel data (4 bytes per pixel)
  dims: Dimensions;
  delayMs?: number; // Animation frame delay in milliseconds
};

type FrameMono = {
  bits: Uint8Array; // 1-bit logical grid (1 bit per pixel, packed in bytes)
  dims: Dimensions;
};

type PackedFrame = {
  bytes: Uint8Array; // Device-specific byte layout
  dims: Dimensions;
  preset: DevicePreset;
  delayMs?: number;
};
```

### Device and Configuration Types

```typescript
type DevicePreset = 
  | 'SSD1306_128x32'  // 128×32 SSD1306 OLED
  | 'SSD1306_128x64'  // 128×64 SSD1306 OLED  
  | 'SH1106_132x64';  // 132×64 SH1106 OLED (128px visible)

type PresetConfig = {
  width: number;           // Display width in pixels
  height: number;          // Display height in pixels
  pageHeight: number;      // Height of each page (always 8 for current displays)
  bitOrder: 'lsb-top' | 'msb-top';     // Bit ordering within bytes
  pageOrder: 'top-down' | 'bottom-up'; // Page ordering
  columnOrder: 'left-right' | 'right-left'; // Column ordering
  viewportOffset?: number; // For SH1106: visible window offset
};

type MonochromeOptions = {
  threshold?: number;      // Luminance threshold (0-255, default: 128)
  dithering?: 'none' | 'bayer4'; // Dithering algorithm
  invert?: boolean;        // Invert pixel values
};

type PackingOptions = {
  preset: DevicePreset;
  invert?: boolean;        // Invert packed bits
  bitOrder?: 'lsb-top' | 'msb-top';
  pageOrder?: 'top-down' | 'bottom-up';
  columnOrder?: 'left-right' | 'right-left';
};
```

### Validation Types

```typescript
type ValidationResult = {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
};

type ValidationError = {
  type: 'dimension_mismatch' | 'corrupt_file' | 'unsupported_format' | 
        'byte_count_error' | 'invalid_parameters';
  message: string;
  context?: unknown;
};

type ValidationWarning = {
  type: 'missing_frames' | 'performance_warning' | 'compatibility_warning';
  message: string;
  context?: unknown;
};
```

## Image Processing

### decodeImageFiles

Decodes PNG files into RGBA frame data with automatic filename-based ordering.

```typescript
function decodeImageFiles(files: File[]): Promise<FrameRGBA[]>
```

**Parameters:**
- `files: File[]` - Array of PNG File objects

**Returns:**
- `Promise<FrameRGBA[]>` - Array of decoded RGBA frames

**Example:**
```typescript
const fileInput = document.querySelector('input[type="file"]');
const files = Array.from(fileInput.files);
const frames = await decodeImageFiles(files);

console.log(`Decoded ${frames.length} frames`);
console.log(`First frame: ${frames[0].dims.width}×${frames[0].dims.height}`);
```

**Behavior:**
- Files are automatically ordered by numeric suffix (e.g., `frame_001.png`, `frame_002.png`)
- Uses `createImageBitmap()` for optimal performance
- Validates that all files are valid PNG images
- Preserves animation timing information if present in filenames

**Errors:**
- Throws `ValidationError` with type `'corrupt_file'` for invalid PNG files
- Throws `ValidationError` with type `'unsupported_format'` for non-PNG files

### validateDimensions

Validates frame dimensions against expected display dimensions.

```typescript
function validateDimensions(
  frames: FrameRGBA[], 
  expected: Dimensions
): ValidationResult
```

**Parameters:**
- `frames: FrameRGBA[]` - Frames to validate
- `expected: Dimensions` - Expected dimensions

**Returns:**
- `ValidationResult` - Validation result with errors and warnings

**Example:**
```typescript
import { DEVICE_PRESETS } from '@tiny-screen-studios/core';

const expectedDims = DEVICE_PRESETS['SSD1306_128x64'];
const validation = validateDimensions(frames, expectedDims);

if (!validation.isValid) {
  validation.errors.forEach(error => {
    console.error(`Dimension error: ${error.message}`);
  });
}
```

## Monochrome Conversion

### toMonochrome

Converts RGBA frames to 1-bit monochrome using luminance calculation and optional dithering.

```typescript
function toMonochrome(
  frames: FrameRGBA[], 
  options?: MonochromeOptions
): FrameMono[]
```

**Parameters:**
- `frames: FrameRGBA[]` - Input RGBA frames
- `options?: MonochromeOptions` - Conversion options

**Returns:**
- `FrameMono[]` - Array of monochrome frames

**Example:**
```typescript
// Basic conversion with default threshold
const monoFrames = toMonochrome(rgbaFrames);

// Advanced conversion with dithering
const monoFrames = toMonochrome(rgbaFrames, {
  threshold: 128,
  dithering: 'bayer4',
  invert: false
});
```

**Algorithm:**
- Luminance calculation: `0.299 * R + 0.587 * G + 0.114 * B`
- Threshold comparison: `luminance >= threshold ? 1 : 0`
- Bayer 4×4 dithering matrix applied when enabled
- Inversion applied after thresholding if enabled

### calculateLuminance

Calculates luminance value for RGB color using standard formula.

```typescript
function calculateLuminance(r: number, g: number, b: number): number
```

**Parameters:**
- `r: number` - Red component (0-255)
- `g: number` - Green component (0-255)  
- `b: number` - Blue component (0-255)

**Returns:**
- `number` - Luminance value (0-255)

**Example:**
```typescript
const luminance = calculateLuminance(128, 128, 128); // Returns 128
const whiteLuminance = calculateLuminance(255, 255, 255); // Returns 255
const blackLuminance = calculateLuminance(0, 0, 0); // Returns 0
```

## Byte Packing

### packFrames

Converts monochrome frames to device-specific byte layouts.

```typescript
function packFrames(
  frames: FrameMono[], 
  options: PackingOptions
): PackedFrame[]
```

**Parameters:**
- `frames: FrameMono[]` - Input monochrome frames
- `options: PackingOptions` - Packing configuration

**Returns:**
- `PackedFrame[]` - Array of packed frames ready for display

**Example:**
```typescript
// Pack for SSD1306 128×64 display
const packedFrames = packFrames(monoFrames, {
  preset: 'SSD1306_128x64',
  invert: false,
  bitOrder: 'lsb-top',
  pageOrder: 'top-down',
  columnOrder: 'left-right'
});

// Pack for SH1106 with custom options
const packedFrames = packFrames(monoFrames, {
  preset: 'SH1106_132x64',
  invert: true,
  bitOrder: 'msb-top'
});
```

**Packing Details:**

#### SSD1306 Format
- Pixels organized in 8-pixel vertical "pages"
- Each byte represents 8 vertical pixels
- Default: LSB = top pixel, MSB = bottom pixel
- Pages ordered top-to-bottom, columns left-to-right

#### SH1106 Format  
- Similar to SSD1306 but 132 columns wide
- Only columns 2-129 are visible (128-pixel window)
- Viewport offset handled automatically

### getPresetConfig

Retrieves configuration for a specific device preset.

```typescript
function getPresetConfig(preset: DevicePreset): PresetConfig
```

**Parameters:**
- `preset: DevicePreset` - Device preset identifier

**Returns:**
- `PresetConfig` - Configuration object for the preset

**Example:**
```typescript
const config = getPresetConfig('SSD1306_128x64');
console.log(`Display size: ${config.width}×${config.height}`);
console.log(`Pages: ${config.height / config.pageHeight}`);
```

## Canvas Emulation

### renderFrameToCanvas

Renders a packed frame to HTML5 Canvas with pixel-perfect accuracy.

```typescript
function renderFrameToCanvas(
  ctx: CanvasRenderingContext2D,
  frame: PackedFrame,
  options?: RenderOptions
): void
```

**Parameters:**
- `ctx: CanvasRenderingContext2D` - Canvas rendering context
- `frame: PackedFrame` - Frame to render
- `options?: RenderOptions` - Rendering options

**Options:**
```typescript
type RenderOptions = {
  scale?: number;      // Pixel scaling factor (default: 1)
  showGrid?: boolean;  // Show pixel grid overlay (default: false)
  invert?: boolean;    // Invert display colors (default: false)
};
```

**Example:**
```typescript
const canvas = document.getElementById('preview');
const ctx = canvas.getContext('2d');

// Basic rendering
renderFrameToCanvas(ctx, packedFrame);

// Scaled rendering with grid
renderFrameToCanvas(ctx, packedFrame, {
  scale: 4,
  showGrid: true,
  invert: false
});
```

**Behavior:**
- Automatically disables image smoothing for pixel-perfect rendering
- Handles SH1106 viewport offset correctly
- Grid overlay shows individual pixel boundaries when enabled

### playFramesOnCanvas

Animates a sequence of frames on canvas with playback controls.

```typescript
function playFramesOnCanvas(
  ctx: CanvasRenderingContext2D,
  frames: PackedFrame[],
  options?: AnimationOptions
): AnimationController
```

**Parameters:**
- `ctx: CanvasRenderingContext2D` - Canvas rendering context
- `frames: PackedFrame[]` - Frame sequence to animate
- `options?: AnimationOptions` - Animation options

**Options:**
```typescript
type AnimationOptions = {
  fps?: number;        // Frames per second (default: 10)
  loop?: boolean;      // Loop animation (default: true)
  pingpong?: boolean;  // Ping-pong loop mode (default: false)
};
```

**Returns:**
```typescript
type AnimationController = {
  stop(): void;                    // Stop animation
  goTo(frameIndex: number): void;  // Jump to specific frame
  setFPS(fps: number): void;       // Change playback speed
  isPlaying(): boolean;            // Check if currently playing
  getCurrentFrame(): number;       // Get current frame index
};
```

**Example:**
```typescript
const controller = playFramesOnCanvas(ctx, packedFrames, {
  fps: 15,
  loop: true,
  pingpong: false
});

// Control playback
setTimeout(() => controller.setFPS(30), 2000);  // Speed up after 2s
setTimeout(() => controller.goTo(10), 5000);    // Jump to frame 10
setTimeout(() => controller.stop(), 10000);     // Stop after 10s
```

## Export Functions

### toCRawArray

Generates C array code from packed frames.

```typescript
function toCRawArray(
  frames: PackedFrame[], 
  symbolName: string, 
  options?: CExportOptions
): string
```

**Parameters:**
- `frames: PackedFrame[]` - Frames to export
- `symbolName: string` - C symbol name for the array
- `options?: CExportOptions` - Export formatting options

**Options:**
```typescript
type CExportOptions = {
  perFrame?: boolean;        // Separate array per frame (default: false)
  bytesPerRow?: number;      // Bytes per line for formatting (default: 16)
  includeMetadata?: boolean; // Include dimension/timing comments (default: true)
};
```

**Returns:**
- `string` - Generated C code

**Example:**
```typescript
// Single array for all frames
const cCode = toCRawArray(packedFrames, 'my_animation', {
  bytesPerRow: 16,
  includeMetadata: true
});

// Separate arrays per frame
const cCode = toCRawArray(packedFrames, 'my_frames', {
  perFrame: true,
  bytesPerRow: 8,
  includeMetadata: true
});
```

**Output Format:**
```c
// Single array
const uint8_t my_animation[] = {
  // Frame 0: 128x64 SSD1306 bitmap
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  // ... more bytes
};

// Per-frame arrays
const uint8_t my_frames_0[] = { /* frame 0 data */ };
const uint8_t my_frames_1[] = { /* frame 1 data */ };
const uint8_t* my_frames[] = { my_frames_0, my_frames_1 };
```

### makeByteFiles

Creates binary files from packed frames.

```typescript
function makeByteFiles(
  frames: PackedFrame[], 
  basename: string
): ExportFile[]
```

**Parameters:**
- `frames: PackedFrame[]` - Frames to export
- `basename: string` - Base filename for generated files

**Returns:**
```typescript
type ExportFile = {
  name: string;        // Generated filename
  data: Uint8Array;    // Binary data
  mimeType?: string;   // MIME type for downloads
};
```

**Example:**
```typescript
const files = makeByteFiles(packedFrames, 'animation');
// Returns:
// [
//   { name: 'animation_frame_000.bin', data: Uint8Array(...) },
//   { name: 'animation_frame_001.bin', data: Uint8Array(...) },
//   // ...
// ]

// Download files in browser
files.forEach(file => {
  const blob = new Blob([file.data], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  a.click();
  URL.revokeObjectURL(url);
});
```

## Orchestrator

### processFiles

High-level function that processes files through the complete pipeline.

```typescript
function processFiles(
  files: File[],
  preset: DevicePreset,
  monoOptions?: MonochromeOptions,
  packOptions?: Partial<PackingOptions>
): Promise<{
  frames: PackedFrame[];
  validation: ValidationResult;
}>
```

**Parameters:**
- `files: File[]` - PNG files to process
- `preset: DevicePreset` - Target display preset
- `monoOptions?: MonochromeOptions` - Monochrome conversion options
- `packOptions?: Partial<PackingOptions>` - Packing options (preset will be set automatically)

**Returns:**
- `Promise<{ frames: PackedFrame[]; validation: ValidationResult }>` - Processing results

**Example:**
```typescript
const result = await processFiles(
  files, 
  'SSD1306_128x64',
  { threshold: 128, dithering: 'bayer4' },
  { invert: true }
);

if (result.validation.isValid) {
  console.log(`Processed ${result.frames.length} frames successfully`);
  const cCode = toCRawArray(result.frames, 'my_display');
} else {
  result.validation.errors.forEach(error => {
    console.error(`Error: ${error.message}`);
  });
}
```

### batchProcess

Processes multiple file groups efficiently, optionally using Web Workers.

```typescript
function batchProcess(
  fileGroups: File[][],
  preset: DevicePreset,
  options?: {
    monoOptions?: MonochromeOptions;
    packOptions?: Partial<PackingOptions>;
    useWebWorker?: boolean;
  }
): Promise<PackedFrame[][]>
```

**Parameters:**
- `fileGroups: File[][]` - Array of file groups to process
- `preset: DevicePreset` - Target display preset
- `options?` - Processing options including Web Worker usage

**Returns:**
- `Promise<PackedFrame[][]>` - Array of frame arrays (one per file group)

**Example:**
```typescript
// Process multiple animations
const animations = [
  [walk_001.png, walk_002.png, walk_003.png],
  [jump_001.png, jump_002.png, jump_003.png],
  [idle_001.png, idle_002.png]
];

const results = await batchProcess(animations, 'SSD1306_128x32', {
  useWebWorker: true,  // Use Web Worker for better performance
  monoOptions: { dithering: 'bayer4' }
});

results.forEach((frames, index) => {
  console.log(`Animation ${index}: ${frames.length} frames`);
});
```

## Performance

### Memory Management

The library includes several performance optimizations:

```typescript
// Preallocated typed arrays for better performance
const buffer = new Uint8Array(expectedSize);

// Web Worker support for heavy processing
import { createWorker } from '@tiny-screen-studios/core/performance';

const worker = createWorker();
const result = await worker.processFrames(frames, options);
```

### Performance Monitoring

```typescript
import { measurePerformance } from '@tiny-screen-studios/core/performance';

const metrics = await measurePerformance(() => {
  return processFiles(files, 'SSD1306_128x64');
});

console.log(`Processing took ${metrics.duration}ms`);
console.log(`Peak memory usage: ${metrics.peakMemory}MB`);
```

## Error Handling

### Error Types

All functions that can fail return `ValidationResult` objects or throw typed errors:

```typescript
try {
  const frames = await decodeImageFiles(files);
} catch (error) {
  switch (error.type) {
    case 'dimension_mismatch':
      console.error(`Wrong dimensions: ${error.message}`);
      break;
    case 'corrupt_file':
      console.error(`File corrupted: ${error.message}`);
      break;
    case 'unsupported_format':
      console.error(`Unsupported format: ${error.message}`);
      break;
    default:
      console.error(`Unexpected error: ${error.message}`);
  }
}
```

### Validation Patterns

```typescript
// Always check validation results
const validation = validateDimensions(frames, expectedDims);

if (!validation.isValid) {
  // Handle errors
  validation.errors.forEach(error => {
    console.error(`Error: ${error.message}`);
  });
  return;
}

// Handle warnings (non-fatal)
validation.warnings.forEach(warning => {
  console.warn(`Warning: ${warning.message}`);
});

// Continue with processing...
```

## Constants

### Device Presets

```typescript
const DEVICE_PRESETS: Record<DevicePreset, PresetConfig> = {
  SSD1306_128x32: {
    width: 128,
    height: 32,
    pageHeight: 8,
    bitOrder: 'lsb-top',
    pageOrder: 'top-down',
    columnOrder: 'left-right'
  },
  SSD1306_128x64: {
    width: 128,
    height: 64,
    pageHeight: 8,
    bitOrder: 'lsb-top',
    pageOrder: 'top-down',
    columnOrder: 'left-right'
  },
  SH1106_132x64: {
    width: 132,
    height: 64,
    pageHeight: 8,
    bitOrder: 'lsb-top',
    pageOrder: 'top-down',
    columnOrder: 'left-right',
    viewportOffset: 2
  }
};
```

### Version Information

```typescript
import { version } from '@tiny-screen-studios/core';
console.log(`Library version: ${version}`);
```
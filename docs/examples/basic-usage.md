# Basic Usage Examples

This document provides step-by-step examples for common use cases with Tiny Screen Studios.

## Table of Contents

- [Single Image Conversion](#single-image-conversion)
- [Animation Processing](#animation-processing)
- [Custom Display Configuration](#custom-display-configuration)
- [Web Integration](#web-integration)
- [Node.js Integration](#nodejs-integration)
- [Arduino Integration](#arduino-integration)

## Single Image Conversion

### Convert PNG to SSD1306 Format

```typescript
import { 
  decodeImageFiles, 
  toMonochrome, 
  packFrames, 
  toCRawArray 
} from '@tiny-screen-studios/core';

async function convertLogo() {
  // Get file from input element
  const fileInput = document.querySelector('#file-input') as HTMLInputElement;
  const files = Array.from(fileInput.files || []);
  
  if (files.length === 0) {
    console.error('No files selected');
    return;
  }

  try {
    // Step 1: Decode PNG file
    console.log('Decoding PNG file...');
    const rgbaFrames = await decodeImageFiles(files);
    console.log(`Decoded ${rgbaFrames.length} frame(s)`);
    
    // Step 2: Convert to monochrome
    console.log('Converting to monochrome...');
    const monoFrames = toMonochrome(rgbaFrames, {
      threshold: 128,
      dithering: 'none',
      invert: false
    });
    
    // Step 3: Pack for SSD1306 display
    console.log('Packing for SSD1306...');
    const packedFrames = packFrames(monoFrames, {
      preset: 'SSD1306_128x64'
    });
    
    // Step 4: Generate C array
    console.log('Generating C code...');
    const cCode = toCRawArray(packedFrames, 'logo_bitmap', {
      bytesPerRow: 16,
      includeMetadata: true
    });
    
    // Display result
    console.log('Generated C code:');
    console.log(cCode);
    
    // Copy to clipboard
    navigator.clipboard.writeText(cCode);
    console.log('C code copied to clipboard!');
    
  } catch (error) {
    console.error('Conversion failed:', error);
  }
}

// HTML
// <input type="file" id="file-input" accept=".png" />
// <button onclick="convertLogo()">Convert Logo</button>
```

### Convert with Dithering

```typescript
async function convertWithDithering() {
  const files = getSelectedFiles();
  
  const rgbaFrames = await decodeImageFiles(files);
  
  // Convert with Bayer dithering for better quality
  const monoFrames = toMonochrome(rgbaFrames, {
    threshold: 128,
    dithering: 'bayer4',  // Enable dithering
    invert: false
  });
  
  const packedFrames = packFrames(monoFrames, {
    preset: 'SSD1306_128x32'
  });
  
  const cCode = toCRawArray(packedFrames, 'dithered_image');
  return cCode;
}
```

## Animation Processing

### Convert PNG Sequence to Animation

```typescript
import { 
  decodeImageFiles, 
  toMonochrome, 
  packFrames,
  toCRawArray,
  makeByteFiles
} from '@tiny-screen-studios/core';

async function convertAnimation() {
  // Files should be named: frame_001.png, frame_002.png, etc.
  const files = getAnimationFiles();
  
  try {
    // Decode all frames
    const rgbaFrames = await decodeImageFiles(files);
    console.log(`Processing ${rgbaFrames.length} animation frames`);
    
    // Convert to monochrome
    const monoFrames = toMonochrome(rgbaFrames, {
      threshold: 120,
      dithering: 'bayer4'
    });
    
    // Pack for display
    const packedFrames = packFrames(monoFrames, {
      preset: 'SSD1306_128x64'
    });
    
    // Generate C code for all frames
    const cCode = toCRawArray(packedFrames, 'animation_frames', {
      perFrame: true,  // Separate array per frame
      bytesPerRow: 8,
      includeMetadata: true
    });
    
    // Also generate binary files
    const binaryFiles = makeByteFiles(packedFrames, 'animation');
    
    return {
      cCode,
      binaryFiles,
      frameCount: packedFrames.length
    };
    
  } catch (error) {
    console.error('Animation conversion failed:', error);
    throw error;
  }
}

function getAnimationFiles(): File[] {
  const fileInput = document.querySelector('#animation-input') as HTMLInputElement;
  return Array.from(fileInput.files || []);
}
```

### Preview Animation on Canvas

```typescript
import { 
  decodeImageFiles, 
  toMonochrome, 
  packFrames,
  playFramesOnCanvas 
} from '@tiny-screen-studios/core';

async function previewAnimation() {
  const files = getAnimationFiles();
  
  // Process frames
  const rgbaFrames = await decodeImageFiles(files);
  const monoFrames = toMonochrome(rgbaFrames, { threshold: 128 });
  const packedFrames = packFrames(monoFrames, { preset: 'SSD1306_128x64' });
  
  // Set up canvas
  const canvas = document.getElementById('preview-canvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d')!;
  
  // Configure canvas size
  canvas.width = 128 * 4;  // 4x scale
  canvas.height = 64 * 4;
  
  // Start animation
  const controller = playFramesOnCanvas(ctx, packedFrames, {
    fps: 10,
    loop: true,
    pingpong: false
  });
  
  // Add controls
  document.getElementById('play-btn')?.addEventListener('click', () => {
    // Animation starts automatically, this would restart if stopped
    controller.goTo(0);
  });
  
  document.getElementById('stop-btn')?.addEventListener('click', () => {
    controller.stop();
  });
  
  document.getElementById('speed-slider')?.addEventListener('input', (e) => {
    const fps = parseInt((e.target as HTMLInputElement).value);
    controller.setFPS(fps);
  });
  
  return controller;
}
```

## Custom Display Configuration

### Define Custom Display Preset

```typescript
import { 
  packFrames, 
  type PresetConfig,
  type PackingOptions 
} from '@tiny-screen-studios/core';

// Define custom display configuration
const CUSTOM_DISPLAY: PresetConfig = {
  width: 96,
  height: 16,
  pageHeight: 8,
  bitOrder: 'lsb-top',
  pageOrder: 'top-down',
  columnOrder: 'left-right'
};

async function convertForCustomDisplay() {
  const files = getSelectedFiles();
  
  // Validate dimensions match custom display
  const rgbaFrames = await decodeImageFiles(files);
  
  for (const frame of rgbaFrames) {
    if (frame.dims.width !== CUSTOM_DISPLAY.width || 
        frame.dims.height !== CUSTOM_DISPLAY.height) {
      throw new Error(
        `Image dimensions ${frame.dims.width}×${frame.dims.height} ` +
        `don't match display ${CUSTOM_DISPLAY.width}×${CUSTOM_DISPLAY.height}`
      );
    }
  }
  
  const monoFrames = toMonochrome(rgbaFrames);
  
  // Use custom packing logic
  const packedFrames = packCustomDisplay(monoFrames, CUSTOM_DISPLAY);
  
  return toCRawArray(packedFrames, 'custom_display');
}

function packCustomDisplay(
  frames: FrameMono[], 
  config: PresetConfig
): PackedFrame[] {
  // Implement custom packing logic based on your display's requirements
  return frames.map(frame => {
    const bytesPerPage = config.width;
    const pageCount = config.height / config.pageHeight;
    const totalBytes = bytesPerPage * pageCount;
    const bytes = new Uint8Array(totalBytes);
    
    // Pack pixels according to your display's format
    for (let page = 0; page < pageCount; page++) {
      for (let col = 0; col < config.width; col++) {
        let byte = 0;
        
        for (let bit = 0; bit < 8; bit++) {
          const y = page * 8 + bit;
          const pixelIndex = y * config.width + col;
          const bitIndex = pixelIndex % 8;
          const byteIndex = Math.floor(pixelIndex / 8);
          
          if (frame.bits[byteIndex] & (1 << bitIndex)) {
            byte |= (1 << bit);
          }
        }
        
        bytes[page * config.width + col] = byte;
      }
    }
    
    return {
      bytes,
      dims: frame.dims,
      preset: 'SSD1306_128x64' as const // Use closest standard preset
    };
  });
}
```

## Web Integration

### Complete Web Application

```html
<!DOCTYPE html>
<html>
<head>
  <title>Tiny Screen Studios Web App</title>
  <style>
    .container { max-width: 800px; margin: 0 auto; padding: 20px; }
    .controls { margin: 20px 0; }
    .preview { border: 1px solid #ccc; margin: 20px 0; }
    .output { background: #f5f5f5; padding: 10px; font-family: monospace; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Tiny Screen Studios</h1>
    
    <div class="controls">
      <label>
        Select PNG files:
        <input type="file" id="file-input" multiple accept=".png" />
      </label>
      
      <label>
        Display Type:
        <select id="preset-select">
          <option value="SSD1306_128x32">SSD1306 128×32</option>
          <option value="SSD1306_128x64">SSD1306 128×64</option>
          <option value="SH1106_132x64">SH1106 132×64</option>
        </select>
      </label>
      
      <label>
        Threshold:
        <input type="range" id="threshold-slider" min="0" max="255" value="128" />
        <span id="threshold-value">128</span>
      </label>
      
      <label>
        <input type="checkbox" id="dithering-checkbox" />
        Enable Dithering
      </label>
      
      <label>
        <input type="checkbox" id="invert-checkbox" />
        Invert Colors
      </label>
      
      <button id="convert-btn">Convert</button>
    </div>
    
    <div class="preview">
      <canvas id="preview-canvas"></canvas>
      <div>
        <button id="play-btn">Play</button>
        <button id="stop-btn">Stop</button>
        <label>
          FPS: <input type="range" id="fps-slider" min="1" max="30" value="10" />
          <span id="fps-value">10</span>
        </label>
      </div>
    </div>
    
    <div class="output">
      <h3>Generated C Code:</h3>
      <pre id="c-output"></pre>
      <button id="copy-btn">Copy to Clipboard</button>
      <button id="download-btn">Download .bin Files</button>
    </div>
  </div>

  <script type="module">
    import { 
      decodeImageFiles, 
      toMonochrome, 
      packFrames,
      toCRawArray,
      makeByteFiles,
      renderFrameToCanvas,
      playFramesOnCanvas
    } from '@tiny-screen-studios/core';

    let currentFrames = [];
    let animationController = null;

    // UI Elements
    const fileInput = document.getElementById('file-input');
    const presetSelect = document.getElementById('preset-select');
    const thresholdSlider = document.getElementById('threshold-slider');
    const thresholdValue = document.getElementById('threshold-value');
    const ditheringCheckbox = document.getElementById('dithering-checkbox');
    const invertCheckbox = document.getElementById('invert-checkbox');
    const convertBtn = document.getElementById('convert-btn');
    const canvas = document.getElementById('preview-canvas');
    const ctx = canvas.getContext('2d');
    const playBtn = document.getElementById('play-btn');
    const stopBtn = document.getElementById('stop-btn');
    const fpsSlider = document.getElementById('fps-slider');
    const fpsValue = document.getElementById('fps-value');
    const cOutput = document.getElementById('c-output');
    const copyBtn = document.getElementById('copy-btn');
    const downloadBtn = document.getElementById('download-btn');

    // Event Listeners
    thresholdSlider.addEventListener('input', (e) => {
      thresholdValue.textContent = e.target.value;
    });

    fpsSlider.addEventListener('input', (e) => {
      const fps = parseInt(e.target.value);
      fpsValue.textContent = fps;
      if (animationController) {
        animationController.setFPS(fps);
      }
    });

    convertBtn.addEventListener('click', convertFiles);
    playBtn.addEventListener('click', playAnimation);
    stopBtn.addEventListener('click', stopAnimation);
    copyBtn.addEventListener('click', copyToClipboard);
    downloadBtn.addEventListener('click', downloadBinaryFiles);

    async function convertFiles() {
      const files = Array.from(fileInput.files || []);
      if (files.length === 0) {
        alert('Please select PNG files');
        return;
      }

      try {
        convertBtn.disabled = true;
        convertBtn.textContent = 'Converting...';

        // Get options
        const preset = presetSelect.value;
        const threshold = parseInt(thresholdSlider.value);
        const dithering = ditheringCheckbox.checked ? 'bayer4' : 'none';
        const invert = invertCheckbox.checked;

        // Process files
        const rgbaFrames = await decodeImageFiles(files);
        const monoFrames = toMonochrome(rgbaFrames, { threshold, dithering, invert });
        const packedFrames = packFrames(monoFrames, { preset });

        currentFrames = packedFrames;

        // Update preview
        updatePreview();

        // Generate C code
        const cCode = toCRawArray(packedFrames, 'display_data', {
          perFrame: packedFrames.length > 1,
          bytesPerRow: 16,
          includeMetadata: true
        });

        cOutput.textContent = cCode;

        convertBtn.textContent = 'Convert';
        convertBtn.disabled = false;

      } catch (error) {
        alert(`Conversion failed: ${error.message}`);
        convertBtn.textContent = 'Convert';
        convertBtn.disabled = false;
      }
    }

    function updatePreview() {
      if (currentFrames.length === 0) return;

      const frame = currentFrames[0];
      canvas.width = frame.dims.width * 4;
      canvas.height = frame.dims.height * 4;

      renderFrameToCanvas(ctx, frame, {
        scale: 4,
        showGrid: true
      });
    }

    function playAnimation() {
      if (currentFrames.length <= 1) return;

      stopAnimation();

      const fps = parseInt(fpsSlider.value);
      animationController = playFramesOnCanvas(ctx, currentFrames, {
        fps,
        loop: true
      });
    }

    function stopAnimation() {
      if (animationController) {
        animationController.stop();
        animationController = null;
      }
    }

    async function copyToClipboard() {
      try {
        await navigator.clipboard.writeText(cOutput.textContent);
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
          copyBtn.textContent = 'Copy to Clipboard';
        }, 2000);
      } catch (error) {
        alert('Failed to copy to clipboard');
      }
    }

    function downloadBinaryFiles() {
      if (currentFrames.length === 0) return;

      const files = makeByteFiles(currentFrames, 'display_data');
      
      files.forEach(file => {
        const blob = new Blob([file.data], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    }
  </script>
</body>
</html>
```

## Node.js Integration

### Command Line Tool

```typescript
#!/usr/bin/env node

import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';
import { 
  decodeImageFiles, 
  toMonochrome, 
  packFrames,
  toCRawArray,
  makeByteFiles
} from '@tiny-screen-studios/core';

interface CliOptions {
  input: string[];
  output: string;
  preset: 'SSD1306_128x32' | 'SSD1306_128x64' | 'SH1106_132x64';
  threshold: number;
  dithering: boolean;
  invert: boolean;
  format: 'c' | 'binary';
}

async function main() {
  const options = parseArgs();
  
  try {
    // Read PNG files
    const files = await Promise.all(
      options.input.map(async (path) => {
        const data = await readFile(resolve(path));
        return new File([data], path, { type: 'image/png' });
      })
    );

    console.log(`Processing ${files.length} file(s)...`);

    // Convert files
    const rgbaFrames = await decodeImageFiles(files);
    const monoFrames = toMonochrome(rgbaFrames, {
      threshold: options.threshold,
      dithering: options.dithering ? 'bayer4' : 'none',
      invert: options.invert
    });
    const packedFrames = packFrames(monoFrames, { preset: options.preset });

    console.log(`Converted ${packedFrames.length} frame(s)`);

    // Export based on format
    if (options.format === 'c') {
      const cCode = toCRawArray(packedFrames, 'display_data', {
        perFrame: packedFrames.length > 1,
        bytesPerRow: 16,
        includeMetadata: true
      });

      await writeFile(options.output, cCode);
      console.log(`C code written to ${options.output}`);

    } else if (options.format === 'binary') {
      const binaryFiles = makeByteFiles(packedFrames, 'frame');
      
      for (const file of binaryFiles) {
        const outputPath = resolve(options.output, file.name);
        await writeFile(outputPath, file.data);
        console.log(`Binary file written to ${outputPath}`);
      }
    }

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

function parseArgs(): CliOptions {
  // Simple argument parsing - in real app, use a library like yargs
  const args = process.argv.slice(2);
  
  return {
    input: args.filter(arg => arg.endsWith('.png')),
    output: args.find(arg => arg.startsWith('--output='))?.split('=')[1] || 'output.c',
    preset: (args.find(arg => arg.startsWith('--preset='))?.split('=')[1] || 'SSD1306_128x64') as any,
    threshold: parseInt(args.find(arg => arg.startsWith('--threshold='))?.split('=')[1] || '128'),
    dithering: args.includes('--dithering'),
    invert: args.includes('--invert'),
    format: (args.find(arg => arg.startsWith('--format='))?.split('=')[1] || 'c') as any
  };
}

main();
```

Usage:
```bash
# Convert single image
node convert.js image.png --preset=SSD1306_128x64 --output=logo.c

# Convert animation with dithering
node convert.js frame_*.png --preset=SSD1306_128x32 --dithering --format=binary --output=./frames/

# Custom threshold and invert
node convert.js sprite.png --threshold=100 --invert --output=sprite.c
```

## Arduino Integration

### Using Generated C Arrays

```cpp
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// Paste generated C array here
const uint8_t logo_bitmap[] = {
  // Generated by Tiny Screen Studios
  // 128x64 SSD1306 bitmap
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  // ... rest of the data
};

void setup() {
  Serial.begin(9600);
  
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("SSD1306 allocation failed"));
    for (;;);
  }
  
  // Display logo
  display.clearDisplay();
  display.drawBitmap(0, 0, logo_bitmap, SCREEN_WIDTH, SCREEN_HEIGHT, WHITE);
  display.display();
}

void loop() {
  // Main loop
}
```

### Animation Playback

```cpp
#include <Adafruit_SSD1306.h>

Adafruit_SSD1306 display(128, 64, &Wire, -1);

// Generated animation frames
const uint8_t animation_frame_0[] = { /* frame 0 data */ };
const uint8_t animation_frame_1[] = { /* frame 1 data */ };
const uint8_t animation_frame_2[] = { /* frame 2 data */ };

const uint8_t* animation_frames[] = {
  animation_frame_0,
  animation_frame_1,
  animation_frame_2
};

const int FRAME_COUNT = 3;
const int FRAME_DELAY = 100; // milliseconds

int currentFrame = 0;
unsigned long lastFrameTime = 0;

void setup() {
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  display.clearDisplay();
  display.display();
}

void loop() {
  unsigned long currentTime = millis();
  
  if (currentTime - lastFrameTime >= FRAME_DELAY) {
    // Display current frame
    display.clearDisplay();
    display.drawBitmap(0, 0, animation_frames[currentFrame], 128, 64, WHITE);
    display.display();
    
    // Advance to next frame
    currentFrame = (currentFrame + 1) % FRAME_COUNT;
    lastFrameTime = currentTime;
  }
}
```

### Memory-Efficient Animation (PROGMEM)

```cpp
#include <Adafruit_SSD1306.h>
#include <avr/pgmspace.h>

Adafruit_SSD1306 display(128, 64, &Wire, -1);

// Store animation frames in program memory
const uint8_t PROGMEM animation_frame_0[] = { /* frame 0 data */ };
const uint8_t PROGMEM animation_frame_1[] = { /* frame 1 data */ };
const uint8_t PROGMEM animation_frame_2[] = { /* frame 2 data */ };

const uint8_t* const PROGMEM animation_frames[] = {
  animation_frame_0,
  animation_frame_1,
  animation_frame_2
};

const int FRAME_COUNT = 3;
uint8_t frameBuffer[1024]; // Buffer for current frame (128*64/8 = 1024 bytes)

void setup() {
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
}

void loop() {
  for (int frame = 0; frame < FRAME_COUNT; frame++) {
    // Copy frame from PROGMEM to RAM
    memcpy_P(frameBuffer, pgm_read_ptr(&animation_frames[frame]), 1024);
    
    // Display frame
    display.clearDisplay();
    display.drawBitmap(0, 0, frameBuffer, 128, 64, WHITE);
    display.display();
    
    delay(100);
  }
}
```

These examples demonstrate the complete workflow from PNG files to working Arduino code, showing how to integrate Tiny Screen Studios into various development environments and use cases.
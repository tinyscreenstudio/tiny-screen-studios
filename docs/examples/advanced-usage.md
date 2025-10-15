# Advanced Usage Examples

This document covers advanced use cases and integration patterns for Tiny Screen Studios.

## Table of Contents

- [Custom Display Support](#custom-display-support)
- [Performance Optimization](#performance-optimization)
- [Web Worker Integration](#web-worker-integration)
- [Batch Processing](#batch-processing)
- [Custom Export Formats](#custom-export-formats)
- [Real-time Processing](#real-time-processing)
- [Integration with Build Systems](#integration-with-build-systems)

## Custom Display Support

### Adding Support for New Display Types

```typescript
import { 
  type PresetConfig,
  type FrameMono,
  type PackedFrame,
  packFrames 
} from '@tiny-screen-studios/core';

// Define configuration for a custom display
const ST7565_128x64: PresetConfig = {
  width: 128,
  height: 64,
  pageHeight: 8,
  bitOrder: 'msb-top',      // Different from SSD1306
  pageOrder: 'top-down',
  columnOrder: 'left-right'
};

// Custom packing function for ST7565
function packST7565(frames: FrameMono[]): PackedFrame[] {
  return frames.map(frame => {
    const config = ST7565_128x64;
    const bytesPerPage = config.width;
    const pageCount = config.height / config.pageHeight;
    const bytes = new Uint8Array(bytesPerPage * pageCount);
    
    for (let page = 0; page < pageCount; page++) {
      for (let col = 0; col < config.width; col++) {
        let byte = 0;
        
        // Pack 8 vertical pixels into one byte (MSB-top for ST7565)
        for (let bit = 0; bit < 8; bit++) {
          const y = page * 8 + bit;
          const pixelIndex = y * config.width + col;
          const bitIndex = pixelIndex % 8;
          const byteIndex = Math.floor(pixelIndex / 8);
          
          if (frame.bits[byteIndex] & (1 << bitIndex)) {
            // MSB-top: bit 7 = top pixel, bit 0 = bottom pixel
            byte |= (1 << (7 - bit));
          }
        }
        
        bytes[page * config.width + col] = byte;
      }
    }
    
    return {
      bytes,
      dims: frame.dims,
      preset: 'SSD1306_128x64' as const // Use compatible preset for other functions
    };
  });
}

// Usage
async function convertForST7565() {
  const files = getSelectedFiles();
  const rgbaFrames = await decodeImageFiles(files);
  const monoFrames = toMonochrome(rgbaFrames);
  const packedFrames = packST7565(monoFrames);
  
  return toCRawArray(packedFrames, 'st7565_display');
}
```

### Supporting Different Bit Layouts

```typescript
// Custom packing for displays with different bit arrangements
function packCustomBitLayout(
  frames: FrameMono[], 
  config: {
    width: number;
    height: number;
    bitsPerByte: number;
    bitOrder: 'horizontal' | 'vertical';
    byteOrder: 'row-major' | 'column-major';
  }
): PackedFrame[] {
  return frames.map(frame => {
    const totalBits = config.width * config.height;
    const totalBytes = Math.ceil(totalBits / config.bitsPerByte);
    const bytes = new Uint8Array(totalBytes);
    
    if (config.bitOrder === 'horizontal' && config.byteOrder === 'row-major') {
      // Pack pixels horizontally, row by row
      for (let y = 0; y < config.height; y++) {
        for (let x = 0; x < config.width; x++) {
          const pixelIndex = y * config.width + x;
          const bitIndex = pixelIndex % 8;
          const frameByteIndex = Math.floor(pixelIndex / 8);
          
          if (frame.bits[frameByteIndex] & (1 << bitIndex)) {
            const outputBitIndex = pixelIndex % config.bitsPerByte;
            const outputByteIndex = Math.floor(pixelIndex / config.bitsPerByte);
            bytes[outputByteIndex] |= (1 << outputBitIndex);
          }
        }
      }
    } else if (config.bitOrder === 'vertical' && config.byteOrder === 'column-major') {
      // Pack pixels vertically, column by column
      for (let x = 0; x < config.width; x++) {
        for (let y = 0; y < config.height; y++) {
          const pixelIndex = y * config.width + x;
          const bitIndex = pixelIndex % 8;
          const frameByteIndex = Math.floor(pixelIndex / 8);
          
          if (frame.bits[frameByteIndex] & (1 << bitIndex)) {
            const outputPixelIndex = x * config.height + y;
            const outputBitIndex = outputPixelIndex % config.bitsPerByte;
            const outputByteIndex = Math.floor(outputPixelIndex / config.bitsPerByte);
            bytes[outputByteIndex] |= (1 << outputBitIndex);
          }
        }
      }
    }
    
    return {
      bytes,
      dims: frame.dims,
      preset: 'SSD1306_128x64' as const
    };
  });
}
```

## Performance Optimization

### Memory-Efficient Processing

```typescript
import { 
  decodeImageFiles,
  toMonochrome,
  packFrames,
  type FrameRGBA,
  type FrameMono,
  type PackedFrame
} from '@tiny-screen-studios/core';

class MemoryEfficientProcessor {
  private frameBuffer: FrameRGBA | null = null;
  private monoBuffer: FrameMono | null = null;
  
  async processFilesStreaming(
    files: File[],
    preset: DevicePreset,
    onFrameProcessed: (frame: PackedFrame, index: number) => void
  ): Promise<void> {
    for (let i = 0; i < files.length; i++) {
      // Process one file at a time to minimize memory usage
      const rgbaFrames = await decodeImageFiles([files[i]]);
      
      for (const rgbaFrame of rgbaFrames) {
        // Reuse buffers when possible
        this.frameBuffer = rgbaFrame;
        
        const monoFrames = toMonochrome([rgbaFrame]);
        this.monoBuffer = monoFrames[0];
        
        const packedFrames = packFrames([monoFrames[0]], { preset });
        const packedFrame = packedFrames[0];
        
        // Process frame immediately
        onFrameProcessed(packedFrame, i);
        
        // Clear references to allow garbage collection
        this.frameBuffer = null;
        this.monoBuffer = null;
      }
      
      // Force garbage collection if available (development only)
      if (typeof window !== 'undefined' && (window as any).gc) {
        (window as any).gc();
      }
    }
  }
}

// Usage
const processor = new MemoryEfficientProcessor();
const results: PackedFrame[] = [];

await processor.processFilesStreaming(
  largeFileList,
  'SSD1306_128x64',
  (frame, index) => {
    results.push(frame);
    console.log(`Processed frame ${index + 1}/${largeFileList.length}`);
  }
);
```

### Optimized Batch Processing

```typescript
class BatchProcessor {
  private readonly maxBatchSize: number;
  private readonly useWebWorker: boolean;
  
  constructor(options: { maxBatchSize?: number; useWebWorker?: boolean } = {}) {
    this.maxBatchSize = options.maxBatchSize || 50;
    this.useWebWorker = options.useWebWorker || false;
  }
  
  async processBatches(
    files: File[],
    preset: DevicePreset,
    options?: {
      onProgress?: (processed: number, total: number) => void;
      onBatchComplete?: (frames: PackedFrame[], batchIndex: number) => void;
    }
  ): Promise<PackedFrame[]> {
    const batches = this.createBatches(files);
    const allFrames: PackedFrame[] = [];
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      
      let batchFrames: PackedFrame[];
      
      if (this.useWebWorker && batch.length > 10) {
        batchFrames = await this.processWithWebWorker(batch, preset);
      } else {
        batchFrames = await this.processRegular(batch, preset);
      }
      
      allFrames.push(...batchFrames);
      
      options?.onBatchComplete?.(batchFrames, i);
      options?.onProgress?.(allFrames.length, files.length);
    }
    
    return allFrames;
  }
  
  private createBatches(files: File[]): File[][] {
    const batches: File[][] = [];
    
    for (let i = 0; i < files.length; i += this.maxBatchSize) {
      batches.push(files.slice(i, i + this.maxBatchSize));
    }
    
    return batches;
  }
  
  private async processRegular(files: File[], preset: DevicePreset): Promise<PackedFrame[]> {
    const rgbaFrames = await decodeImageFiles(files);
    const monoFrames = toMonochrome(rgbaFrames);
    return packFrames(monoFrames, { preset });
  }
  
  private async processWithWebWorker(files: File[], preset: DevicePreset): Promise<PackedFrame[]> {
    // Web Worker implementation would go here
    // For now, fall back to regular processing
    return this.processRegular(files, preset);
  }
}
```

## Web Worker Integration

### Web Worker Implementation

```typescript
// worker.ts
import { 
  decodeImageFiles,
  toMonochrome,
  packFrames,
  type DevicePreset,
  type MonochromeOptions,
  type PackingOptions
} from '@tiny-screen-studios/core';

interface WorkerMessage {
  id: string;
  type: 'process';
  files: File[];
  preset: DevicePreset;
  monoOptions?: MonochromeOptions;
  packOptions?: Partial<PackingOptions>;
}

interface WorkerResponse {
  id: string;
  type: 'result' | 'error' | 'progress';
  data?: any;
  error?: string;
  progress?: number;
}

self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { id, type, files, preset, monoOptions, packOptions } = event.data;
  
  try {
    if (type === 'process') {
      // Send progress updates
      const sendProgress = (progress: number) => {
        const response: WorkerResponse = { id, type: 'progress', progress };
        self.postMessage(response);
      };
      
      sendProgress(0);
      
      // Process files
      const rgbaFrames = await decodeImageFiles(files);
      sendProgress(33);
      
      const monoFrames = toMonochrome(rgbaFrames, monoOptions);
      sendProgress(66);
      
      const packedFrames = packFrames(monoFrames, { preset, ...packOptions });
      sendProgress(100);
      
      // Send result
      const response: WorkerResponse = {
        id,
        type: 'result',
        data: {
          frames: packedFrames.map(frame => ({
            bytes: Array.from(frame.bytes), // Convert Uint8Array for transfer
            dims: frame.dims,
            preset: frame.preset,
            delayMs: frame.delayMs
          }))
        }
      };
      
      self.postMessage(response);
    }
  } catch (error) {
    const response: WorkerResponse = {
      id,
      type: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    
    self.postMessage(response);
  }
};
```

### Web Worker Manager

```typescript
// worker-manager.ts
class WorkerManager {
  private worker: Worker | null = null;
  private pendingTasks = new Map<string, {
    resolve: (value: any) => void;
    reject: (error: Error) => void;
    onProgress?: (progress: number) => void;
  }>();
  
  constructor() {
    this.initWorker();
  }
  
  private initWorker() {
    this.worker = new Worker(new URL('./worker.ts', import.meta.url), {
      type: 'module'
    });
    
    this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const { id, type, data, error, progress } = event.data;
      const task = this.pendingTasks.get(id);
      
      if (!task) return;
      
      switch (type) {
        case 'result':
          // Convert arrays back to Uint8Arrays
          const frames = data.frames.map((frame: any) => ({
            ...frame,
            bytes: new Uint8Array(frame.bytes)
          }));
          
          task.resolve(frames);
          this.pendingTasks.delete(id);
          break;
          
        case 'error':
          task.reject(new Error(error));
          this.pendingTasks.delete(id);
          break;
          
        case 'progress':
          task.onProgress?.(progress || 0);
          break;
      }
    };
    
    this.worker.onerror = (error) => {
      console.error('Worker error:', error);
      // Reject all pending tasks
      for (const [id, task] of this.pendingTasks) {
        task.reject(new Error('Worker error'));
      }
      this.pendingTasks.clear();
    };
  }
  
  async processFiles(
    files: File[],
    preset: DevicePreset,
    options?: {
      monoOptions?: MonochromeOptions;
      packOptions?: Partial<PackingOptions>;
      onProgress?: (progress: number) => void;
    }
  ): Promise<PackedFrame[]> {
    if (!this.worker) {
      throw new Error('Worker not initialized');
    }
    
    const id = Math.random().toString(36).substr(2, 9);
    
    return new Promise((resolve, reject) => {
      this.pendingTasks.set(id, {
        resolve,
        reject,
        onProgress: options?.onProgress
      });
      
      const message: WorkerMessage = {
        id,
        type: 'process',
        files,
        preset,
        monoOptions: options?.monoOptions,
        packOptions: options?.packOptions
      };
      
      this.worker!.postMessage(message);
    });
  }
  
  terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    
    // Reject all pending tasks
    for (const [id, task] of this.pendingTasks) {
      task.reject(new Error('Worker terminated'));
    }
    this.pendingTasks.clear();
  }
}

// Usage
const workerManager = new WorkerManager();

try {
  const frames = await workerManager.processFiles(
    largeFileList,
    'SSD1306_128x64',
    {
      monoOptions: { dithering: 'bayer4' },
      onProgress: (progress) => {
        console.log(`Progress: ${progress}%`);
        updateProgressBar(progress);
      }
    }
  );
  
  console.log(`Processed ${frames.length} frames`);
} finally {
  workerManager.terminate();
}
```

## Batch Processing

### Processing Multiple Projects

```typescript
interface Project {
  name: string;
  files: File[];
  preset: DevicePreset;
  options: {
    threshold: number;
    dithering: boolean;
    invert: boolean;
  };
}

class ProjectBatchProcessor {
  async processProjects(
    projects: Project[],
    outputDir: string,
    options?: {
      onProjectComplete?: (project: Project, result: any) => void;
      onProgress?: (completed: number, total: number) => void;
    }
  ): Promise<void> {
    const results = [];
    
    for (let i = 0; i < projects.length; i++) {
      const project = projects[i];
      
      try {
        console.log(`Processing project: ${project.name}`);
        
        // Process project files
        const rgbaFrames = await decodeImageFiles(project.files);
        const monoFrames = toMonochrome(rgbaFrames, {
          threshold: project.options.threshold,
          dithering: project.options.dithering ? 'bayer4' : 'none',
          invert: project.options.invert
        });
        const packedFrames = packFrames(monoFrames, { preset: project.preset });
        
        // Generate outputs
        const cCode = toCRawArray(packedFrames, project.name, {
          perFrame: packedFrames.length > 1,
          includeMetadata: true
        });
        
        const binaryFiles = makeByteFiles(packedFrames, project.name);
        
        // Save outputs
        await this.saveProjectOutputs(project.name, outputDir, cCode, binaryFiles);
        
        const result = {
          project: project.name,
          frameCount: packedFrames.length,
          cCodeSize: cCode.length,
          binaryFileCount: binaryFiles.length
        };
        
        results.push(result);
        options?.onProjectComplete?.(project, result);
        options?.onProgress?.(i + 1, projects.length);
        
      } catch (error) {
        console.error(`Failed to process project ${project.name}:`, error);
        results.push({
          project: project.name,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    // Generate summary report
    await this.generateSummaryReport(results, outputDir);
  }
  
  private async saveProjectOutputs(
    projectName: string,
    outputDir: string,
    cCode: string,
    binaryFiles: ExportFile[]
  ): Promise<void> {
    // In Node.js environment
    if (typeof window === 'undefined') {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      const projectDir = path.resolve(outputDir, projectName);
      await fs.mkdir(projectDir, { recursive: true });
      
      // Save C code
      await fs.writeFile(path.join(projectDir, `${projectName}.c`), cCode);
      
      // Save binary files
      for (const file of binaryFiles) {
        await fs.writeFile(path.join(projectDir, file.name), file.data);
      }
    } else {
      // In browser environment - trigger downloads
      this.downloadFile(`${projectName}.c`, cCode, 'text/plain');
      
      for (const file of binaryFiles) {
        this.downloadFile(file.name, file.data, 'application/octet-stream');
      }
    }
  }
  
  private downloadFile(filename: string, data: string | Uint8Array, mimeType: string) {
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  private async generateSummaryReport(results: any[], outputDir: string): Promise<void> {
    const report = {
      timestamp: new Date().toISOString(),
      totalProjects: results.length,
      successful: results.filter(r => !r.error).length,
      failed: results.filter(r => r.error).length,
      results
    };
    
    const reportText = JSON.stringify(report, null, 2);
    
    if (typeof window === 'undefined') {
      const fs = await import('fs/promises');
      const path = await import('path');
      await fs.writeFile(path.join(outputDir, 'batch-report.json'), reportText);
    } else {
      this.downloadFile('batch-report.json', reportText, 'application/json');
    }
  }
}
```

## Custom Export Formats

### JSON Export Format

```typescript
interface JsonExportFormat {
  metadata: {
    version: string;
    timestamp: string;
    preset: DevicePreset;
    dimensions: { width: number; height: number };
    frameCount: number;
  };
  frames: Array<{
    index: number;
    delayMs?: number;
    data: number[]; // Byte array as numbers for JSON compatibility
    checksum: string; // MD5 or similar for integrity
  }>;
}

function toJsonFormat(frames: PackedFrame[]): JsonExportFormat {
  return {
    metadata: {
      version: '1.0',
      timestamp: new Date().toISOString(),
      preset: frames[0]?.preset || 'SSD1306_128x64',
      dimensions: frames[0]?.dims || { width: 128, height: 64 },
      frameCount: frames.length
    },
    frames: frames.map((frame, index) => ({
      index,
      delayMs: frame.delayMs,
      data: Array.from(frame.bytes),
      checksum: calculateChecksum(frame.bytes)
    }))
  };
}

function calculateChecksum(data: Uint8Array): string {
  // Simple checksum - in production, use a proper hash function
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum = (sum + data[i]) % 65536;
  }
  return sum.toString(16).padStart(4, '0');
}

// Usage
const jsonData = toJsonFormat(packedFrames);
const jsonString = JSON.stringify(jsonData, null, 2);
```

### Assembly Export Format

```typescript
function toAssemblyFormat(
  frames: PackedFrame[], 
  symbolName: string,
  options?: {
    assembler?: 'nasm' | 'gas' | 'masm';
    section?: string;
    alignment?: number;
  }
): string {
  const assembler = options?.assembler || 'nasm';
  const section = options?.section || '.data';
  const alignment = options?.alignment || 1;
  
  let output = '';
  
  switch (assembler) {
    case 'nasm':
      output += `section ${section}\n\n`;
      output += `align ${alignment}\n`;
      output += `${symbolName}:\n`;
      break;
      
    case 'gas':
      output += `${section}\n\n`;
      output += `.align ${alignment}\n`;
      output += `.global ${symbolName}\n`;
      output += `${symbolName}:\n`;
      break;
      
    case 'masm':
      output += `${section} SEGMENT\n\n`;
      output += `ALIGN ${alignment}\n`;
      output += `PUBLIC ${symbolName}\n`;
      output += `${symbolName} LABEL BYTE\n`;
      break;
  }
  
  // Add frame data
  for (let frameIndex = 0; frameIndex < frames.length; frameIndex++) {
    const frame = frames[frameIndex];
    
    if (frames.length > 1) {
      output += `; Frame ${frameIndex}\n`;
    }
    
    for (let i = 0; i < frame.bytes.length; i += 16) {
      const chunk = frame.bytes.slice(i, i + 16);
      const byteStrings = Array.from(chunk).map(b => `0x${b.toString(16).padStart(2, '0')}`);
      
      switch (assembler) {
        case 'nasm':
        case 'gas':
          output += `    db ${byteStrings.join(', ')}\n`;
          break;
        case 'masm':
          output += `    DB ${byteStrings.join(', ')}\n`;
          break;
      }
    }
    
    if (frameIndex < frames.length - 1) {
      output += '\n';
    }
  }
  
  if (assembler === 'masm') {
    output += `\n${section} ENDS\n`;
  }
  
  return output;
}
```

## Real-time Processing

### Live Camera Feed Processing

```typescript
class LiveProcessor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private video: HTMLVideoElement;
  private isProcessing = false;
  
  constructor(
    private outputCanvas: HTMLCanvasElement,
    private preset: DevicePreset = 'SSD1306_128x64'
  ) {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
    this.video = document.createElement('video');
    
    const config = DEVICE_PRESETS[preset];
    this.canvas.width = config.width;
    this.canvas.height = config.height;
  }
  
  async startCamera(): Promise<void> {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 }
      }
    });
    
    this.video.srcObject = stream;
    this.video.play();
    
    this.video.addEventListener('loadedmetadata', () => {
      this.startProcessing();
    });
  }
  
  private startProcessing(): void {
    if (this.isProcessing) return;
    this.isProcessing = true;
    
    const processFrame = () => {
      if (!this.isProcessing) return;
      
      // Capture frame from video
      this.ctx.drawImage(
        this.video,
        0, 0, this.video.videoWidth, this.video.videoHeight,
        0, 0, this.canvas.width, this.canvas.height
      );
      
      // Get image data
      const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      
      // Convert to frame format
      const rgbaFrame: FrameRGBA = {
        pixels: imageData.data,
        dims: { width: this.canvas.width, height: this.canvas.height }
      };
      
      // Process frame
      const monoFrames = toMonochrome([rgbaFrame], { threshold: 128 });
      const packedFrames = packFrames(monoFrames, { preset: this.preset });
      
      // Render to output canvas
      const outputCtx = this.outputCanvas.getContext('2d')!;
      renderFrameToCanvas(outputCtx, packedFrames[0], {
        scale: 4,
        showGrid: false
      });
      
      // Continue processing
      requestAnimationFrame(processFrame);
    };
    
    processFrame();
  }
  
  stopProcessing(): void {
    this.isProcessing = false;
    
    if (this.video.srcObject) {
      const stream = this.video.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  }
}

// Usage
const liveProcessor = new LiveProcessor(
  document.getElementById('output-canvas') as HTMLCanvasElement,
  'SSD1306_128x64'
);

document.getElementById('start-camera')?.addEventListener('click', () => {
  liveProcessor.startCamera();
});

document.getElementById('stop-camera')?.addEventListener('click', () => {
  liveProcessor.stopProcessing();
});
```

## Integration with Build Systems

### Webpack Plugin

```typescript
// webpack-plugin.ts
import { Compiler, WebpackPluginInstance } from 'webpack';
import { readFile, writeFile } from 'fs/promises';
import { resolve, dirname, basename, extname } from 'path';
import { 
  decodeImageFiles,
  toMonochrome,
  packFrames,
  toCRawArray,
  type DevicePreset
} from '@tiny-screen-studios/core';

interface TinyScreenStudiosPluginOptions {
  input: string | string[];
  output: string;
  preset: DevicePreset;
  threshold?: number;
  dithering?: boolean;
  invert?: boolean;
  symbolName?: string;
}

class TinyScreenStudiosPlugin implements WebpackPluginInstance {
  constructor(private options: TinyScreenStudiosPluginOptions) {}
  
  apply(compiler: Compiler): void {
    compiler.hooks.beforeCompile.tapAsync(
      'TinyScreenStudiosPlugin',
      async (params, callback) => {
        try {
          await this.processImages();
          callback();
        } catch (error) {
          callback(error as Error);
        }
      }
    );
  }
  
  private async processImages(): Promise<void> {
    const inputPaths = Array.isArray(this.options.input) 
      ? this.options.input 
      : [this.options.input];
    
    // Read PNG files
    const files = await Promise.all(
      inputPaths.map(async (path) => {
        const data = await readFile(resolve(path));
        const filename = basename(path);
        return new File([data], filename, { type: 'image/png' });
      })
    );
    
    // Process images
    const rgbaFrames = await decodeImageFiles(files);
    const monoFrames = toMonochrome(rgbaFrames, {
      threshold: this.options.threshold || 128,
      dithering: this.options.dithering ? 'bayer4' : 'none',
      invert: this.options.invert || false
    });
    const packedFrames = packFrames(monoFrames, { preset: this.options.preset });
    
    // Generate C code
    const symbolName = this.options.symbolName || 
      basename(this.options.output, extname(this.options.output));
    
    const cCode = toCRawArray(packedFrames, symbolName, {
      perFrame: packedFrames.length > 1,
      includeMetadata: true
    });
    
    // Write output
    await writeFile(resolve(this.options.output), cCode);
    
    console.log(`Generated ${this.options.output} with ${packedFrames.length} frame(s)`);
  }
}

// webpack.config.js usage
module.exports = {
  // ... other config
  plugins: [
    new TinyScreenStudiosPlugin({
      input: 'src/assets/logo.png',
      output: 'src/generated/logo.c',
      preset: 'SSD1306_128x64',
      threshold: 128,
      symbolName: 'logo_bitmap'
    }),
    new TinyScreenStudiosPlugin({
      input: 'src/assets/animation/*.png',
      output: 'src/generated/animation.c',
      preset: 'SSD1306_128x32',
      dithering: true,
      symbolName: 'animation_frames'
    })
  ]
};
```

### Vite Plugin

```typescript
// vite-plugin.ts
import { Plugin } from 'vite';
import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { 
  decodeImageFiles,
  toMonochrome,
  packFrames,
  toCRawArray
} from '@tiny-screen-studios/core';

interface TinyScreenStudiosViteOptions {
  preset: DevicePreset;
  threshold?: number;
  dithering?: boolean;
  invert?: boolean;
}

export function tinyScreenStudios(options: TinyScreenStudiosViteOptions): Plugin {
  return {
    name: 'tiny-screen-studios',
    load(id) {
      if (id.endsWith('?tiny-screen')) {
        return this.processImage(id.replace('?tiny-screen', ''));
      }
    },
    
    async processImage(imagePath: string) {
      try {
        // Read PNG file
        const data = await readFile(resolve(imagePath));
        const file = new File([data], imagePath, { type: 'image/png' });
        
        // Process image
        const rgbaFrames = await decodeImageFiles([file]);
        const monoFrames = toMonochrome(rgbaFrames, {
          threshold: options.threshold || 128,
          dithering: options.dithering ? 'bayer4' : 'none',
          invert: options.invert || false
        });
        const packedFrames = packFrames(monoFrames, { preset: options.preset });
        
        // Generate JavaScript module
        const bytes = Array.from(packedFrames[0].bytes);
        const dims = packedFrames[0].dims;
        
        return `
          export const bytes = new Uint8Array([${bytes.join(', ')}]);
          export const width = ${dims.width};
          export const height = ${dims.height};
          export const preset = '${options.preset}';
          export default { bytes, width, height, preset };
        `;
        
      } catch (error) {
        this.error(`Failed to process image ${imagePath}: ${error}`);
      }
    }
  };
}

// Usage in Vite project
// vite.config.ts
import { defineConfig } from 'vite';
import { tinyScreenStudios } from './vite-plugin-tiny-screen-studios';

export default defineConfig({
  plugins: [
    tinyScreenStudios({
      preset: 'SSD1306_128x64',
      threshold: 128,
      dithering: true
    })
  ]
});

// In your code
import logoData from './assets/logo.png?tiny-screen';

console.log(`Logo: ${logoData.width}×${logoData.height}`);
console.log(`Bytes: ${logoData.bytes.length}`);
```

These advanced examples demonstrate how to extend Tiny Screen Studios for complex use cases, optimize performance for large-scale processing, and integrate with modern development workflows.
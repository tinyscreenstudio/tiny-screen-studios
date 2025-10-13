// Web Worker implementation for batch processing large frame sequences
// Handles processing >100 frames to prevent UI blocking

import type {
  FrameRGBA,
  FrameMono,
  PackedFrame,
  DevicePreset,
  MonochromeOptions,
  PackingOptions,
  ValidationResult,
} from '../types/index.js';

/**
 * Message types for worker communication
 */
export type WorkerMessage =
  | {
      type: 'process_batch';
      id: string;
      frames: FrameRGBA[];
      preset: DevicePreset;
      monoOptions?: MonochromeOptions;
      packOptions?: Partial<PackingOptions>;
    }
  | {
      type: 'process_mono_batch';
      id: string;
      frames: FrameRGBA[];
      monoOptions?: MonochromeOptions;
    }
  | {
      type: 'process_pack_batch';
      id: string;
      frames: FrameMono[];
      packOptions: PackingOptions;
    };

export type WorkerResponse =
  | {
      type: 'batch_complete';
      id: string;
      result: PackedFrame[];
      processingTime: number;
      memoryUsage: {
        peakFrames: number;
        totalBytes: number;
      };
    }
  | {
      type: 'mono_complete';
      id: string;
      result: FrameMono[];
      processingTime: number;
    }
  | {
      type: 'pack_complete';
      id: string;
      result: PackedFrame[];
      processingTime: number;
    }
  | {
      type: 'batch_error';
      id: string;
      error: string;
      validation?: ValidationResult;
    }
  | {
      type: 'progress';
      id: string;
      completed: number;
      total: number;
      operation: string;
    };

/**
 * Web Worker wrapper for batch processing
 */
export class BatchProcessingWorker {
  private worker: Worker | null = null;
  private pendingRequests = new Map<
    string,
    {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      resolve: (result: any) => void;
      reject: (error: Error) => void;
      progressCallback?: (
        completed: number,
        total: number,
        operation: string
      ) => void;
    }
  >();

  constructor() {
    this.initializeWorker();
  }

  /**
   * Initialize the web worker
   */
  private initializeWorker(): void {
    try {
      // Check if we're in a browser environment with Worker support
      if (
        typeof Worker === 'undefined' ||
        typeof URL === 'undefined' ||
        typeof URL.createObjectURL !== 'function'
      ) {
        throw new Error('Web Worker not supported in this environment');
      }

      // Create worker from inline script to avoid external file dependencies
      const workerScript = this.createWorkerScript();
      const blob = new Blob([workerScript], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(blob);

      this.worker = new Worker(workerUrl);
      this.worker.onmessage = this.handleWorkerMessage.bind(this);
      this.worker.onerror = this.handleWorkerError.bind(this);

      // Clean up the blob URL
      URL.revokeObjectURL(workerUrl);
    } catch (error) {
      console.warn(
        'Failed to create web worker, falling back to main thread:',
        error
      );
      this.worker = null;
    }
  }

  /**
   * Check if web worker is available
   */
  isAvailable(): boolean {
    return this.worker !== null;
  }

  /**
   * Process a batch of frames in the worker
   */
  async processBatch(
    frames: FrameRGBA[],
    preset: DevicePreset,
    options: {
      monoOptions?: MonochromeOptions;
      packOptions?: Partial<PackingOptions>;
      progressCallback?: (
        completed: number,
        total: number,
        operation: string
      ) => void;
    } = {}
  ): Promise<PackedFrame[]> {
    if (!this.worker) {
      throw new Error('Web worker not available');
    }

    const id = this.generateRequestId();
    const message: WorkerMessage = {
      type: 'process_batch',
      id,
      frames,
      preset,
      ...(options.monoOptions && { monoOptions: options.monoOptions }),
      ...(options.packOptions && { packOptions: options.packOptions }),
    };

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, {
        resolve,
        reject,
        ...(options.progressCallback && {
          progressCallback: options.progressCallback,
        }),
      });

      this.worker!.postMessage(message);
    });
  }

  /**
   * Process only monochrome conversion in worker
   */
  async processMonochromeBatch(
    frames: FrameRGBA[],
    monoOptions?: MonochromeOptions,
    progressCallback?: (
      completed: number,
      total: number,
      operation: string
    ) => void
  ): Promise<FrameMono[]> {
    if (!this.worker) {
      throw new Error('Web worker not available');
    }

    const id = this.generateRequestId();
    const message: WorkerMessage = {
      type: 'process_mono_batch',
      id,
      frames,
      ...(monoOptions && { monoOptions }),
    };

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, {
        resolve,
        reject,
        ...(progressCallback && { progressCallback }),
      });

      this.worker!.postMessage(message);
    });
  }

  /**
   * Process only packing in worker
   */
  async processPackBatch(
    frames: FrameMono[],
    packOptions: PackingOptions,
    progressCallback?: (
      completed: number,
      total: number,
      operation: string
    ) => void
  ): Promise<PackedFrame[]> {
    if (!this.worker) {
      throw new Error('Web worker not available');
    }

    const id = this.generateRequestId();
    const message: WorkerMessage = {
      type: 'process_pack_batch',
      id,
      frames,
      packOptions,
    };

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, {
        resolve,
        reject,
        ...(progressCallback && { progressCallback }),
      });

      this.worker!.postMessage(message);
    });
  }

  /**
   * Terminate the worker and clean up resources
   */
  terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }

    // Reject all pending requests
    for (const [, request] of this.pendingRequests) {
      request.reject(new Error('Worker terminated'));
    }
    this.pendingRequests.clear();
  }

  /**
   * Handle messages from the worker
   */
  private handleWorkerMessage(event: MessageEvent<WorkerResponse>): void {
    const response = event.data;
    const request = this.pendingRequests.get(response.id);

    if (!request) {
      console.warn('Received response for unknown request:', response.id);
      return;
    }

    switch (response.type) {
      case 'batch_complete':
      case 'mono_complete':
      case 'pack_complete':
        this.pendingRequests.delete(response.id);
        request.resolve(response.result);
        break;

      case 'batch_error':
        this.pendingRequests.delete(response.id);
        request.reject(new Error(response.error));
        break;

      case 'progress':
        if (request.progressCallback) {
          request.progressCallback(
            response.completed,
            response.total,
            response.operation
          );
        }
        break;

      default:
        console.warn(
          'Unknown worker response type:',
          (response as { type: string }).type
        );
    }
  }

  /**
   * Handle worker errors
   */
  private handleWorkerError(error: ErrorEvent): void {
    console.error('Worker error:', error);

    // Reject all pending requests
    for (const [, request] of this.pendingRequests) {
      request.reject(new Error(`Worker error: ${error.message}`));
    }
    this.pendingRequests.clear();
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create the worker script as a string
   */
  private createWorkerScript(): string {
    return `
// Web Worker script for batch processing
// This runs in a separate thread to avoid blocking the UI

// Import types (these will be available in the worker context)
let toMonochrome, packFrames;

// Initialize worker with required functions
async function initializeWorker() {
  try {
    // Import the required modules
    // Note: In a real implementation, these would need to be bundled for the worker
    // For now, we'll implement simplified versions directly in the worker
    
    // Simplified monochrome conversion
    toMonochrome = function(frames, options = {}) {
      const opts = { threshold: 128, dithering: 'none', invert: false, ...options };
      
      return frames.map(frame => {
        const { pixels, dims } = frame;
        const { width, height } = dims;
        const totalPixels = width * height;
        const byteCount = Math.ceil(totalPixels / 8);
        const bits = new Uint8Array(byteCount);
        
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const pixelIndex = (y * width + x) * 4;
            const r = pixels[pixelIndex] || 0;
            const g = pixels[pixelIndex + 1] || 0;
            const b = pixels[pixelIndex + 2] || 0;
            
            // Calculate luminance
            const luminance = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
            
            // Apply threshold
            let isLit = luminance >= opts.threshold;
            if (opts.invert) isLit = !isLit;
            
            // Set bit
            const bitIndex = y * width + x;
            const byteIndex = Math.floor(bitIndex / 8);
            const bitPosition = bitIndex % 8;
            
            if (isLit) {
              bits[byteIndex] |= 1 << bitPosition;
            }
          }
        }
        
        return { bits, dims };
      });
    };
    
    // Simplified packing function
    packFrames = function(frames, options) {
      const presetConfigs = {
        'SSD1306_128x32': { width: 128, height: 32, pageHeight: 8 },
        'SSD1306_128x64': { width: 128, height: 64, pageHeight: 8 },
        'SH1106_132x64': { width: 132, height: 64, pageHeight: 8 }
      };
      
      const config = presetConfigs[options.preset];
      if (!config) throw new Error('Unknown preset: ' + options.preset);
      
      return frames.map(frame => {
        const { bits, dims } = frame;
        const { width, height } = dims;
        const pages = height / config.pageHeight;
        const bytes = new Uint8Array(width * pages);
        
        // Simple SSD1306-style packing
        for (let page = 0; page < pages; page++) {
          for (let col = 0; col < width; col++) {
            let byte = 0;
            for (let bit = 0; bit < 8; bit++) {
              const y = page * 8 + bit;
              const bitIndex = y * width + col;
              const byteIndex = Math.floor(bitIndex / 8);
              const bitPosition = bitIndex % 8;
              
              if (byteIndex < bits.length && (bits[byteIndex] & (1 << bitPosition))) {
                byte |= 1 << bit;
              }
            }
            bytes[page * width + col] = options.invert ? ~byte & 0xFF : byte;
          }
        }
        
        return {
          bytes,
          dims,
          preset: options.preset,
          delayMs: frame.delayMs
        };
      });
    };
    
  } catch (error) {
    console.error('Failed to initialize worker:', error);
  }
}

// Message handler
self.onmessage = async function(event) {
  const message = event.data;
  
  try {
    switch (message.type) {
      case 'process_batch': {
        const startTime = performance.now();
        
        // Report progress
        self.postMessage({
          type: 'progress',
          id: message.id,
          completed: 0,
          total: message.frames.length,
          operation: 'Converting to monochrome'
        });
        
        // Convert to monochrome
        const monoFrames = toMonochrome(message.frames, message.monoOptions);
        
        // Report progress
        self.postMessage({
          type: 'progress',
          id: message.id,
          completed: message.frames.length / 2,
          total: message.frames.length,
          operation: 'Packing frames'
        });
        
        // Pack frames
        const packOptions = { preset: message.preset, ...message.packOptions };
        const packedFrames = packFrames(monoFrames, packOptions);
        
        const processingTime = performance.now() - startTime;
        const totalBytes = packedFrames.reduce((sum, frame) => sum + frame.bytes.length, 0);
        
        self.postMessage({
          type: 'batch_complete',
          id: message.id,
          result: packedFrames,
          processingTime,
          memoryUsage: {
            peakFrames: packedFrames.length,
            totalBytes
          }
        });
        break;
      }
      
      case 'process_mono_batch': {
        const startTime = performance.now();
        const result = toMonochrome(message.frames, message.monoOptions);
        const processingTime = performance.now() - startTime;
        
        self.postMessage({
          type: 'mono_complete',
          id: message.id,
          result,
          processingTime
        });
        break;
      }
      
      case 'process_pack_batch': {
        const startTime = performance.now();
        const result = packFrames(message.frames, message.packOptions);
        const processingTime = performance.now() - startTime;
        
        self.postMessage({
          type: 'pack_complete',
          id: message.id,
          result,
          processingTime
        });
        break;
      }
      
      default:
        throw new Error('Unknown message type: ' + message.type);
    }
  } catch (error) {
    self.postMessage({
      type: 'batch_error',
      id: message.id,
      error: error.message || 'Unknown error'
    });
  }
};

// Initialize the worker
initializeWorker();
`;
  }
}

/**
 * Singleton worker instance for batch processing
 */
let workerInstance: BatchProcessingWorker | null = null;

/**
 * Get or create the batch processing worker
 */
export function getBatchWorker(): BatchProcessingWorker {
  if (!workerInstance) {
    workerInstance = new BatchProcessingWorker();
  }
  return workerInstance;
}

/**
 * Terminate the batch processing worker
 */
export function terminateBatchWorker(): void {
  if (workerInstance) {
    workerInstance.terminate();
    workerInstance = null;
  }
}

/**
 * Check if batch processing should use web worker based on frame count
 */
export function shouldUseWorker(frameCount: number): boolean {
  if (frameCount <= 100) return false;

  try {
    return getBatchWorker().isAvailable();
  } catch {
    return false;
  }
}

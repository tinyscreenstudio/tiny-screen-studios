// Core type definitions for Tiny Screen Studios

// Base types
export type Dimensions = { width: number; height: number };

// Frame representations at different stages
export type FrameRGBA = {
  pixels: Uint8ClampedArray; // RGBA pixel data
  dims: Dimensions;
  delayMs?: number; // For animations
};

export type FrameMono = {
  bits: Uint8Array; // 1-bit logical grid (1 bit per pixel)
  dims: Dimensions;
};

export type PackedFrame = {
  bytes: Uint8Array; // Device-specific byte layout
  dims: Dimensions;
  preset: DevicePreset;
  delayMs?: number;
};

// Device and configuration types
export type DevicePreset =
  | 'SSD1306_128x32'
  | 'SSD1306_128x64'
  | 'SH1106_132x64';

export type PackingOptions = {
  preset: DevicePreset;
  invert?: boolean;
  bitOrder?: 'lsb-top' | 'msb-top';
  pageOrder?: 'top-down' | 'bottom-up';
  columnOrder?: 'left-right' | 'right-left';
  addressing?: AddressingMode; // Export addressing mode (vertical or horizontal)
};

export type MonochromeOptions = {
  threshold?: number; // 0-255, default 128
  dithering?: 'none' | 'bayer4';
  invert?: boolean;
};

export type PresetConfig = {
  width: number;
  height: number;
  pageHeight: number; // Always 8 for current displays
  bitOrder: 'lsb-top' | 'msb-top';
  pageOrder: 'top-down' | 'bottom-up';
  columnOrder: 'left-right' | 'right-left';
  viewportOffset?: number; // For SH1106 displays
};

// Validation and error handling types
export type ValidationResult = {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
};

export type ValidationError = {
  type:
    | 'dimension_mismatch'
    | 'corrupt_file'
    | 'unsupported_format'
    | 'byte_count_error'
    | 'invalid_parameters';
  message: string;
  context?: unknown;
};

export type ValidationWarning = {
  type: 'missing_frames' | 'performance_warning' | 'compatibility_warning';
  message: string;
  context?: unknown;
};

// Rendering and animation types
export type RenderOptions = {
  scale?: number; // Pixel scaling factor
  showGrid?: boolean; // Overlay pixel grid
  invert?: boolean; // Invert display colors
};

export type AnimationOptions = {
  fps?: number; // Frames per second
  loop?: boolean; // Loop animation
  pingpong?: boolean; // Ping-pong loop mode
};

export type AnimationController = {
  stop(): void;
  goTo(frameIndex: number): void;
  setFPS(fps: number): void;
  isPlaying(): boolean;
  getCurrentFrame(): number;
};

// Export types
export type AddressingMode = 'vertical' | 'horizontal';
export type BitOrderMode = 'lsb-first' | 'msb-first';

export type CExportOptions = {
  perFrame?: boolean; // Separate arrays per frame
  bytesPerRow?: number; // Formatting for readability
  includeMetadata?: boolean; // Add dimension/timing comments
  addressing?: AddressingMode; // Vertical (page/column-major) or horizontal (row-major)
  bitOrder?: BitOrderMode; // LSB-first or MSB-first within each byte
  autoLineWrap?: boolean; // Auto-calculate bytes per row based on addressing
};

export type ExportFile = {
  name: string;
  data: Uint8Array;
  mimeType?: string;
};

// Module interfaces

// Image Decoder Interface
export interface ImageDecoder {
  decodeImageFiles(files: File[]): Promise<FrameRGBA[]>;
  validateDimensions(
    frames: FrameRGBA[],
    expected: Dimensions
  ): ValidationResult;
  orderFramesByFilename(frames: FrameRGBA[], files: File[]): FrameRGBA[];
}

// Monochrome Converter Interface
export interface MonochromeConverter {
  toMonochrome(frames: FrameRGBA[], options?: MonochromeOptions): FrameMono[];
  calculateLuminance(r: number, g: number, b: number): number;
  applyThreshold(luminance: number, threshold: number): boolean;
  applyBayerDithering(frame: FrameRGBA, threshold: number): FrameMono;
}

// Byte Packer Interface
export interface BytePacker {
  packFrames(frames: FrameMono[], options: PackingOptions): PackedFrame[];
  getPresetConfig(preset: DevicePreset): PresetConfig;
  packSSD1306(
    frame: FrameMono,
    config: PresetConfig & { invert?: boolean }
  ): Uint8Array;
  packSH1106(
    frame: FrameMono,
    config: PresetConfig & { invert?: boolean }
  ): Uint8Array;
  validatePackedFrame(frame: PackedFrame): ValidationResult;
}

// Display Emulator Interface
export interface DisplayEmulator {
  renderFrameToCanvas(
    ctx: CanvasRenderingContext2D,
    frame: PackedFrame,
    options?: RenderOptions
  ): void;

  playFramesOnCanvas(
    ctx: CanvasRenderingContext2D,
    frames: PackedFrame[],
    options?: AnimationOptions
  ): AnimationController;

  createPreviewCanvas(
    frame: PackedFrame,
    options?: RenderOptions
  ): HTMLCanvasElement;
}

// Data Exporter Interface
export interface DataExporter {
  toCRawArray(
    frames: PackedFrame[],
    symbolName: string,
    options?: CExportOptions
  ): string;

  makeByteFiles(frames: PackedFrame[], basename: string): ExportFile[];

  validateExportOptions(options: CExportOptions): ValidationResult;
}

// Orchestrator Interface for high-level workflows
export interface ProcessingOrchestrator {
  processFiles(
    files: File[],
    preset: DevicePreset,
    monoOptions?: MonochromeOptions,
    packOptions?: Partial<PackingOptions>
  ): Promise<{
    frames: PackedFrame[];
    validation: ValidationResult;
  }>;

  batchProcess(
    fileGroups: File[][],
    preset: DevicePreset,
    options?: {
      monoOptions?: MonochromeOptions;
      packOptions?: Partial<PackingOptions>;
      useWebWorker?: boolean;
    }
  ): Promise<PackedFrame[][]>;
}

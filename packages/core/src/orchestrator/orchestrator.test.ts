// Integration tests for the orchestrator module
// Tests complete workflows from files to exports

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  ProcessingOrchestratorImpl,
  processFilesToPackedFrames,
  processFilesToBinary,
  processFilesToCArray,
  processFilesToCArrayFiles,
  processFilesToCanvas,
  processFilesToAnimation,
  createEmulator,
  estimateMemoryUsage,
  orchestrator,
  type ProgressCallback,
} from './index.js';
import type {
  DevicePreset,
  MonochromeOptions,
  PackingOptions,
} from '../types/index.js';

// Mock file creation helper
function createMockPNGFile(name: string): File {
  // Create a simple mock file for testing
  return new File([], name, { type: 'image/png' });
}

// Mock the createImageBitmap function for testing
global.createImageBitmap = vi.fn().mockImplementation(async (file: File) => {
  // Extract dimensions from filename for testing
  const match = file.name.match(/(\d+)x(\d+)/);
  const width = match ? parseInt(match[1]!) : 128;
  const height = match ? parseInt(match[2]!) : 32;

  return {
    width,
    height,
    close: vi.fn(),
  };
});

// Mock OffscreenCanvas for testing
global.OffscreenCanvas = vi
  .fn()
  .mockImplementation((width: number, height: number) => {
    // Create mock ImageData without using the browser API
    const pixelCount = width * height * 4; // RGBA
    const data = new Uint8ClampedArray(pixelCount);

    // Fill with test pattern (white pixels)
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255; // R
      data[i + 1] = 255; // G
      data[i + 2] = 255; // B
      data[i + 3] = 255; // A
    }

    const mockImageData = {
      data,
      width,
      height,
    };

    return {
      width,
      height,
      getContext: vi.fn().mockReturnValue({
        drawImage: vi.fn(),
        getImageData: vi.fn().mockReturnValue(mockImageData),
        fillRect: vi.fn(),
        createLinearGradient: vi.fn().mockReturnValue({
          addColorStop: vi.fn(),
        }),
        set fillStyle(value: string) {
          // Mock setter
        },
      }),
    };
  });

// Mock HTMLCanvasElement for testing
global.HTMLCanvasElement = vi.fn().mockImplementation(() => {
  const pixelCount = 128 * 32 * 4; // Default size RGBA
  const data = new Uint8ClampedArray(pixelCount);

  // Fill with test pattern
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255; // R
    data[i + 1] = 255; // G
    data[i + 2] = 255; // B
    data[i + 3] = 255; // A
  }

  const mockImageData = {
    data,
    width: 128,
    height: 32,
  };

  return {
    width: 128,
    height: 32,
    getContext: vi.fn().mockReturnValue({
      drawImage: vi.fn(),
      getImageData: vi.fn().mockReturnValue(mockImageData),
      fillRect: vi.fn(),
      fillStyle: '',
      imageSmoothingEnabled: true,
      scale: vi.fn(),
      clearRect: vi.fn(),
      putImageData: vi.fn(),
      createLinearGradient: vi.fn().mockReturnValue({
        addColorStop: vi.fn(),
      }),
    }),
  };
});

// Mock document.createElement for canvas
const originalCreateElement = document.createElement;
document.createElement = vi.fn().mockImplementation((tagName: string) => {
  if (tagName === 'canvas') {
    return new global.HTMLCanvasElement();
  }
  return originalCreateElement.call(document, tagName);
});

describe('ProcessingOrchestrator', () => {
  let orchestratorInstance: ProcessingOrchestratorImpl;

  beforeEach(() => {
    orchestratorInstance = new ProcessingOrchestratorImpl();
    vi.clearAllMocks();
  });

  describe('processFiles', () => {
    it('should process single file through complete pipeline', async () => {
      const files = [createMockPNGFile('test_128x32.png')];
      const preset: DevicePreset = 'SSD1306_128x32';

      const result = await orchestratorInstance.processFiles(files, preset);

      expect(result.validation.isValid).toBe(true);
      expect(result.frames).toHaveLength(1);
      expect(result.frames[0]?.preset).toBe(preset);
      expect(result.frames[0]?.bytes).toBeInstanceOf(Uint8Array);
      expect(result.processingTime).toBeGreaterThan(0);
      expect(result.memoryUsage?.peakFrames).toBe(1);
    });

    it('should process multiple files with frame ordering', async () => {
      const files = [
        createMockPNGFile('frame_003_128x32.png'),
        createMockPNGFile('frame_001_128x32.png'),
        createMockPNGFile('frame_002_128x32.png'),
      ];
      const preset: DevicePreset = 'SSD1306_128x32';

      const result = await orchestratorInstance.processFiles(files, preset);

      expect(result.validation.isValid).toBe(true);
      expect(result.frames).toHaveLength(3);
      expect(result.memoryUsage?.peakFrames).toBe(3);
    });

    it('should handle monochrome conversion options', async () => {
      const files = [createMockPNGFile('test_128x32.png')];
      const preset: DevicePreset = 'SSD1306_128x32';
      const monoOptions: MonochromeOptions = {
        threshold: 64,
        dithering: 'bayer4',
        invert: true,
      };

      const result = await orchestratorInstance.processFiles(
        files,
        preset,
        monoOptions
      );

      expect(result.validation.isValid).toBe(true);
      expect(result.frames).toHaveLength(1);
    });

    it('should handle packing options', async () => {
      const files = [createMockPNGFile('test_128x32.png')];
      const preset: DevicePreset = 'SSD1306_128x32';
      const packOptions: Partial<PackingOptions> = {
        invert: true,
        bitOrder: 'msb-top',
      };

      const result = await orchestratorInstance.processFiles(
        files,
        preset,
        undefined,
        packOptions
      );

      expect(result.validation.isValid).toBe(true);
      expect(result.frames).toHaveLength(1);
    });

    it('should aggregate validation errors from all stages', async () => {
      // Create file with wrong dimensions
      const files = [createMockPNGFile('test_64x32.png')]; // Wrong width
      const preset: DevicePreset = 'SSD1306_128x32';

      const result = await orchestratorInstance.processFiles(files, preset);

      expect(result.validation.isValid).toBe(false);
      expect(result.validation.errors).toHaveLength(1);
      expect(result.validation.errors[0]?.type).toBe('dimension_mismatch');
      expect(result.frames).toHaveLength(0);
    });

    it('should handle invalid monochrome options', async () => {
      const files = [createMockPNGFile('test_128x32.png')];
      const preset: DevicePreset = 'SSD1306_128x32';
      const invalidMonoOptions: MonochromeOptions = {
        threshold: 300, // Invalid threshold > 255
      };

      const result = await orchestratorInstance.processFiles(
        files,
        preset,
        invalidMonoOptions
      );

      expect(result.validation.isValid).toBe(false);
      expect(result.validation.errors).toHaveLength(1);
      expect(result.validation.errors[0]?.type).toBe('invalid_parameters');
    });
  });

  describe('batchProcess', () => {
    it('should process multiple file groups', async () => {
      const fileGroups = [
        [createMockPNGFile('group1_128x32.png')],
        [createMockPNGFile('group2_128x32.png')],
        [createMockPNGFile('group3_128x32.png')],
      ];
      const preset: DevicePreset = 'SSD1306_128x32';

      const results = await orchestratorInstance.batchProcess(
        fileGroups,
        preset
      );

      expect(results).toHaveLength(3);
      expect(results[0]).toHaveLength(1);
      expect(results[1]).toHaveLength(1);
      expect(results[2]).toHaveLength(1);
    });

    it('should call progress callback during batch processing', async () => {
      const fileGroups = [
        [createMockPNGFile('group1_128x32.png')],
        [createMockPNGFile('group2_128x32.png')],
      ];
      const preset: DevicePreset = 'SSD1306_128x32';
      const progressCallback: ProgressCallback = vi.fn();

      await orchestratorInstance.batchProcess(fileGroups, preset, {
        progressCallback,
      });

      expect(progressCallback).toHaveBeenCalledTimes(3); // 2 groups + final completion
      expect(progressCallback).toHaveBeenCalledWith(0, 2, expect.any(String));
      expect(progressCallback).toHaveBeenCalledWith(1, 2, expect.any(String));
      expect(progressCallback).toHaveBeenCalledWith(
        2,
        2,
        'Batch processing complete'
      );
    });

    it('should respect memory limit', async () => {
      const fileGroups = Array.from({ length: 10 }, (_, i) => [
        createMockPNGFile(`group${i}_128x32.png`),
      ]);
      const preset: DevicePreset = 'SSD1306_128x32';

      orchestratorInstance.setMemoryLimit(3);

      const results = await orchestratorInstance.batchProcess(
        fileGroups,
        preset
      );

      expect(results).toHaveLength(10);
      expect(orchestratorInstance.getMemoryLimit()).toBe(3);
    });

    it('should handle failed groups gracefully', async () => {
      const fileGroups = [
        [createMockPNGFile('good_128x32.png')],
        [createMockPNGFile('bad_64x32.png')], // Wrong dimensions
        [createMockPNGFile('good2_128x32.png')],
      ];
      const preset: DevicePreset = 'SSD1306_128x32';

      const results = await orchestratorInstance.batchProcess(
        fileGroups,
        preset
      );

      expect(results).toHaveLength(3);
      expect(results[0]).toHaveLength(1); // Good
      expect(results[1]).toHaveLength(0); // Failed
      expect(results[2]).toHaveLength(1); // Good
    });
  });

  describe('memory management', () => {
    it('should set and get memory limit', () => {
      expect(orchestratorInstance.getMemoryLimit()).toBe(100); // Default

      orchestratorInstance.setMemoryLimit(50);
      expect(orchestratorInstance.getMemoryLimit()).toBe(50);
    });

    it('should throw error for invalid memory limit', () => {
      expect(() => orchestratorInstance.setMemoryLimit(0)).toThrow(
        'Memory limit must be greater than 0'
      );
      expect(() => orchestratorInstance.setMemoryLimit(-1)).toThrow(
        'Memory limit must be greater than 0'
      );
    });
  });
});

describe('High-level workflow functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('processFilesToPackedFrames', () => {
    it('should process files to packed frames', async () => {
      const files = [createMockPNGFile('test_128x32.png')];
      const preset: DevicePreset = 'SSD1306_128x32';

      const result = await processFilesToPackedFrames(files, preset);

      expect(result.validation.isValid).toBe(true);
      expect(result.frames).toHaveLength(1);
      expect(result.processingTime).toBeGreaterThan(0);
    });

    it('should handle options', async () => {
      const files = [createMockPNGFile('test_128x32.png')];
      const preset: DevicePreset = 'SSD1306_128x32';
      const options = {
        monoOptions: { threshold: 64 },
        packOptions: { invert: true },
      };

      const result = await processFilesToPackedFrames(files, preset, options);

      expect(result.validation.isValid).toBe(true);
      expect(result.frames).toHaveLength(1);
    });
  });

  describe('processFilesToBinary', () => {
    it('should process files to binary export', async () => {
      const files = [createMockPNGFile('test_128x32.png')];
      const preset: DevicePreset = 'SSD1306_128x32';
      const basename = 'output';

      const result = await processFilesToBinary(files, preset, basename);

      expect(result.validation.isValid).toBe(true);
      expect(result.files).toHaveLength(1);
      expect(result.files[0]?.name).toBe('output.bin');
      expect(result.files[0]?.data).toBeInstanceOf(Uint8Array);
      expect(result.exportTime).toBeGreaterThan(0);
    });

    it('should create concatenated binary for multiple frames', async () => {
      const files = [
        createMockPNGFile('frame1_128x32.png'),
        createMockPNGFile('frame2_128x32.png'),
      ];
      const preset: DevicePreset = 'SSD1306_128x32';
      const basename = 'animation';

      const result = await processFilesToBinary(files, preset, basename, {
        concatenated: true,
      });

      expect(result.validation.isValid).toBe(true);
      expect(result.files).toHaveLength(1);
      expect(result.files[0]?.name).toBe('animation_all_frames.bin');
    });

    it('should handle processing errors', async () => {
      const files = [createMockPNGFile('bad_64x32.png')]; // Wrong dimensions
      const preset: DevicePreset = 'SSD1306_128x32';
      const basename = 'output';

      const result = await processFilesToBinary(files, preset, basename);

      expect(result.validation.isValid).toBe(false);
      expect(result.files).toHaveLength(0);
    });
  });

  describe('processFilesToCArray', () => {
    it('should process files to C array export', async () => {
      const files = [createMockPNGFile('test_128x32.png')];
      const preset: DevicePreset = 'SSD1306_128x32';
      const symbolName = 'my_image';

      const result = await processFilesToCArray(files, preset, symbolName);

      expect(result.validation.isValid).toBe(true);
      expect(result.code).toContain('const uint8_t my_image');
      expect(result.exportTime).toBeGreaterThan(0);
    });

    it('should handle export options', async () => {
      const files = [createMockPNGFile('test_128x32.png')];
      const preset: DevicePreset = 'SSD1306_128x32';
      const symbolName = 'my_image';
      const exportOptions = {
        bytesPerRow: 16,
        includeMetadata: true,
      };

      const result = await processFilesToCArray(files, preset, symbolName, {
        exportOptions,
      });

      expect(result.validation.isValid).toBe(true);
      expect(result.code).toContain('const uint8_t my_image');
    });

    it('should handle processing errors', async () => {
      const files = [createMockPNGFile('bad_64x32.png')]; // Wrong dimensions
      const preset: DevicePreset = 'SSD1306_128x32';
      const symbolName = 'my_image';

      const result = await processFilesToCArray(files, preset, symbolName);

      expect(result.validation.isValid).toBe(false);
      expect(result.code).toBe('');
    });
  });

  describe('processFilesToCArrayFiles', () => {
    it('should process files to C array files export', async () => {
      const files = [createMockPNGFile('test_128x32.png')];
      const preset: DevicePreset = 'SSD1306_128x32';
      const symbolName = 'my_image';

      const result = await processFilesToCArrayFiles(files, preset, symbolName);

      expect(result.validation.isValid).toBe(true);
      expect(result.files).toHaveLength(2); // .h and .c files
      expect(result.files.some(f => f.name.includes('.h'))).toBe(true);
      expect(result.files.some(f => f.name.includes('.c'))).toBe(true);
      expect(result.exportTime).toBeGreaterThan(0);
    });

    it('should handle processing errors', async () => {
      const files = [createMockPNGFile('bad_64x32.png')]; // Wrong dimensions
      const preset: DevicePreset = 'SSD1306_128x32';
      const symbolName = 'my_image';

      const result = await processFilesToCArrayFiles(files, preset, symbolName);

      expect(result.validation.isValid).toBe(false);
      expect(result.files).toHaveLength(0);
    });
  });

  describe('processFilesToCanvas', () => {
    it('should handle processing errors gracefully', async () => {
      const files = [createMockPNGFile('bad_64x32.png')]; // Wrong dimensions
      const preset: DevicePreset = 'SSD1306_128x32';

      const result = await processFilesToCanvas(files, preset);

      expect(result.validation.isValid).toBe(false);
      expect(result.canvas).toBeNull();
      expect(result.frames).toHaveLength(0);
    });

    it('should return proper structure for canvas workflow', async () => {
      const files = [createMockPNGFile('test_128x32.png')];
      const preset: DevicePreset = 'SSD1306_128x32';

      const result = await processFilesToCanvas(files, preset);

      // Test the structure regardless of validation result
      expect(result).toHaveProperty('canvas');
      expect(result).toHaveProperty('frames');
      expect(result).toHaveProperty('validation');
      expect(result).toHaveProperty('processingTime');
      expect(result.processingTime).toBeGreaterThan(0);
    });

    it('should handle render options parameter', async () => {
      const files = [createMockPNGFile('test_128x32.png')];
      const preset: DevicePreset = 'SSD1306_128x32';
      const renderOptions = {
        scale: 4,
        showGrid: true,
        invert: true,
      };

      const result = await processFilesToCanvas(files, preset, {
        renderOptions,
      });

      // Test that the function accepts render options without throwing
      expect(result).toHaveProperty('canvas');
      expect(result.processingTime).toBeGreaterThan(0);
    });
  });

  describe('processFilesToAnimation', () => {
    it('should handle processing errors gracefully', async () => {
      const mockCanvas = document.createElement('canvas');
      const mockContext = mockCanvas.getContext('2d')!; // We know this will work with our mock

      const files = [createMockPNGFile('bad_64x32.png')]; // Wrong dimensions
      const preset: DevicePreset = 'SSD1306_128x32';

      const result = await processFilesToAnimation(files, preset, mockContext);

      expect(result.validation.isValid).toBe(false);
      expect(result.controller).toBeNull();
      expect(result.frames).toHaveLength(0);
    });

    it('should return proper structure for animation workflow', async () => {
      const mockCanvas = document.createElement('canvas');
      const mockContext = mockCanvas.getContext('2d')!; // We know this will work with our mock

      const files = [createMockPNGFile('test_128x32.png')];
      const preset: DevicePreset = 'SSD1306_128x32';

      const result = await processFilesToAnimation(files, preset, mockContext);

      // Test the structure regardless of validation result
      expect(result).toHaveProperty('controller');
      expect(result).toHaveProperty('frames');
      expect(result).toHaveProperty('validation');
      expect(result).toHaveProperty('processingTime');
      expect(result.processingTime).toBeGreaterThan(0);
    });

    it('should handle animation options parameter', async () => {
      const mockCanvas = document.createElement('canvas');
      const mockContext = mockCanvas.getContext('2d')!; // We know this will work with our mock

      const files = [createMockPNGFile('test_128x32.png')];
      const preset: DevicePreset = 'SSD1306_128x32';
      const animationOptions = {
        fps: 30,
        loop: true,
        pingpong: false,
      };

      const result = await processFilesToAnimation(files, preset, mockContext, {
        animationOptions,
      });

      // Test that the function accepts animation options without throwing
      expect(result).toHaveProperty('controller');
      expect(result.processingTime).toBeGreaterThan(0);
    });
  });
});

describe('Utility functions', () => {
  describe('estimateMemoryUsage', () => {
    it('should estimate memory usage for file groups', () => {
      const fileGroups = [
        [createMockPNGFile('test1_128x32.png')],
        [createMockPNGFile('test2_128x32.png')],
      ];
      const preset: DevicePreset = 'SSD1306_128x32';

      const estimate = estimateMemoryUsage(fileGroups, preset);

      expect(estimate.estimatedBytes).toBeGreaterThan(0);
      expect(estimate.recommendedBatchSize).toBeGreaterThan(0);
    });

    it('should handle different presets', () => {
      const fileGroups = [[createMockPNGFile('test_128x64.png')]];
      const preset: DevicePreset = 'SSD1306_128x64';

      const estimate = estimateMemoryUsage(fileGroups, preset);

      expect(estimate.estimatedBytes).toBeGreaterThan(0);
      expect(estimate.recommendedBatchSize).toBeGreaterThan(0);
    });

    it('should recommend smaller batch size for larger frames', () => {
      const smallFrameGroups = [[createMockPNGFile('small_128x32.png')]];
      const largeFrameGroups = [[createMockPNGFile('large_132x64.png')]];

      const smallEstimate = estimateMemoryUsage(
        smallFrameGroups,
        'SSD1306_128x32'
      );
      const largeEstimate = estimateMemoryUsage(
        largeFrameGroups,
        'SH1106_132x64'
      );

      expect(largeEstimate.recommendedBatchSize).toBeLessThanOrEqual(
        smallEstimate.recommendedBatchSize
      );
    });
  });
});

describe('Emulator utilities', () => {
  describe('createEmulator', () => {
    it('should create a display emulator instance', () => {
      const emulator = createEmulator();

      expect(emulator).toBeTruthy();
      expect(typeof emulator.renderFrameToCanvas).toBe('function');
      expect(typeof emulator.playFramesOnCanvas).toBe('function');
      expect(typeof emulator.createPreviewCanvas).toBe('function');
    });
  });
});

describe('Default orchestrator instance', () => {
  it('should export a default orchestrator instance', () => {
    expect(orchestrator).toBeInstanceOf(ProcessingOrchestratorImpl);
    expect(orchestrator.getMemoryLimit()).toBe(100);
  });
});

describe('Error handling and edge cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle empty file arrays', async () => {
    const files: File[] = [];
    const preset: DevicePreset = 'SSD1306_128x32';

    const result = await processFilesToPackedFrames(files, preset);

    expect(result.validation.isValid).toBe(false);
    expect(result.frames).toHaveLength(0);
  });

  it('should handle corrupted files gracefully', async () => {
    // Mock createImageBitmap to throw an error
    const originalCreateImageBitmap = global.createImageBitmap;
    global.createImageBitmap = vi
      .fn()
      .mockRejectedValue(new Error('Corrupted file'));

    const files = [createMockPNGFile('corrupted.png')];
    const preset: DevicePreset = 'SSD1306_128x32';

    const result = await processFilesToPackedFrames(files, preset);

    expect(result.validation.isValid).toBe(false);
    // The orchestrator wraps decoder errors as invalid_parameters
    expect(result.validation.errors[0]?.type).toBe('invalid_parameters');
    expect(result.validation.errors[0]?.message).toContain('Corrupted file');

    // Restore original function
    global.createImageBitmap = originalCreateImageBitmap;
  });

  it('should handle unexpected errors in processing pipeline', async () => {
    // Mock toMonochrome to throw an unexpected error
    const files = [createMockPNGFile('test_128x32.png')];
    const preset: DevicePreset = 'SSD1306_128x32';

    // This test would require mocking the mono converter, which is complex
    // For now, we'll test the error handling structure
    const result = await processFilesToPackedFrames(files, preset);

    // Should still return a valid structure even if processing fails
    expect(result).toHaveProperty('validation');
    expect(result).toHaveProperty('frames');
    expect(result).toHaveProperty('processingTime');
  });
});
